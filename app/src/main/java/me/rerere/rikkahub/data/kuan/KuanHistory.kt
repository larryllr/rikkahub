package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.net.Uri
import androidx.core.net.toUri
import java.io.ByteArrayOutputStream
import java.io.File
import java.time.Instant
import java.util.UUID
import java.util.zip.ZipFile
import kotlin.uuid.Uuid
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.serialization.json.JsonObject
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.ReasoningType
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.data.datastore.SettingsStore
import me.rerere.rikkahub.data.files.FilesManager
import me.rerere.rikkahub.data.files.saveUploadFromBytes
import me.rerere.rikkahub.data.files.saveUploadFromUri
import me.rerere.rikkahub.data.model.Conversation
import me.rerere.rikkahub.data.model.MessageNode
import me.rerere.rikkahub.service.ChatService

private const val MAX_UNPACKED = 100L * 1024 * 1024
private const val MAX_MANIFEST = 25L * 1024 * 1024
private const val MAX_FILES = 20_000
private const val MAX_MESSAGES = 50_000

data class KuanHistoryResult(val conversations: Int, val messages: Int, val skipped: Int, val missingFiles: Int)

internal class KuanHistory(
    private val context: Context,
    private val session: KuanSession,
    private val settings: SettingsStore,
    private val files: FilesManager,
    private val kuanFiles: KuanFiles,
    private val chat: ChatService,
) {
    private val mutex = Mutex()

    suspend fun import(local: Uri?): KuanHistoryResult = withContext(Dispatchers.IO) {
        mutex.withLock {
            val profile = session.profile()
            val epoch = session.state.value.epoch
            val temporary = File.createTempFile("kuan-history-", ".zip", context.cacheDir)
            try {
                if (local == null) {
                    kuanFiles.cloudArchive(profile.scope, temporary)
                } else {
                    val input = context.contentResolver.openInputStream(local)
                        ?: throw KuanProtocolError("The backup could not be opened")
                    input.use { inputStream ->
                        temporary.outputStream().use { copyKuanBytes(inputStream, it, MAX_LEGACY_BACKUP) }
                    }
                }
                ZipFile(temporary).use { archive ->
                    val manifest = readKuanArchive(archive, profile.id)
                    val assistant = settings.awaitLoaded().assistantId
                    importArchive(archive, manifest, profile, epoch, assistant)
                }
            } finally {
                temporary.delete()
            }
        }
    }

    private suspend fun importArchive(
        zip: ZipFile,
        manifest: KuanArchive,
        profile: KuanProfile,
        epoch: Long,
        assistant: Uuid,
    ): KuanHistoryResult {
        var conversations = 0
        var messages = 0
        var skipped = 0
        var missing = 0
        manifest.conversations.forEach history@{ row ->
            currentCoroutineContext().ensureActive()
            if (!session.isCurrent(profile.scope, epoch)) throw KuanHttpError(401)
            val id = legacyId(profile.scope, "conversation", row.id)
            val existing = chat.getConversation(id)?.messageNodes.orEmpty()
                .flatMap { it.messages }.mapTo(HashSet()) { it.id }
            val entryFiles = mutableListOf<Long>()
            val nodes = mutableListOf<MessageNode>()
            row.messages.forEach message@{ message ->
                val messageId = legacyId(id.toString(), "message", message.id)
                if (messageId in existing) return@message
                val time = kotlin.time.Instant.fromEpochMilliseconds(message.createdAt)
                    .toLocalDateTime(TimeZone.currentSystemDefault())
                val parts = buildList {
                    if (!message.summary.isNullOrBlank() && message.role == MessageRole.ASSISTANT) {
                        add(UIMessagePart.Reasoning(message.summary, reasoningType = ReasoningType.SUMMARY_TEXT))
                    }
                    if (message.content.isNotBlank()) add(UIMessagePart.Text(message.content))
                    message.files.forEach { attachment ->
                        val stored = storeFile(zip, manifest, attachment, profile.scope)
                        if (stored == null) {
                            missing++
                            add(UIMessagePart.Text("[Attachment unavailable: ${attachment.name}]"))
                        } else {
                            entryFiles += stored.id
                            val uri = stored.file.toUri().toString()
                            add(if (stored.mime.startsWith("image/")) UIMessagePart.Image(uri)
                            else UIMessagePart.Document(uri, stored.name, stored.mime))
                        }
                    }
                }
                if (parts.isNotEmpty()) {
                    val imported = UIMessage(id = messageId, role = message.role, parts = parts,
                        createdAt = time, finishedAt = time)
                    nodes += MessageNode(
                        id = legacyId(id.toString(), "node", message.id),
                        messages = listOf(finishKuanPresentation(context, imported)),
                    )
                }
            }
            if (nodes.isEmpty()) {
                skipped++
                return@history
            }
            if (!session.isCurrent(profile.scope, epoch)) throw KuanHttpError(401)
            val added = chat.mergeKuanHistory(Conversation(
                id = id,
                assistantId = assistant,
                title = row.title,
                createAt = Instant.ofEpochMilli(row.createdAt),
                updateAt = Instant.ofEpochMilli(row.updatedAt),
                messageNodes = nodes,
            ))
            if (added == 0) {
                entryFiles.forEach { files.delete(it) }
                skipped++
            } else {
                conversations++
                messages += added
            }
        }
        return KuanHistoryResult(conversations, messages, skipped, missing)
    }

    private suspend fun storeFile(
        zip: ZipFile,
        manifest: KuanArchive,
        attachment: LegacyAttachment,
        scope: String,
    ): SavedKuanFile? {
        val asset = manifest.assets[attachment.assetId]
        val local = File.createTempFile("kuan-archive-file-", ".tmp", context.cacheDir)
        return try {
            val entity = when {
                asset != null -> {
                    val entry = zip.getEntry(asset.path)
                    val actual = zip.getInputStream(entry).use { input ->
                        local.outputStream().use { copyKuanBytes(input, it, asset.size) }
                    }
                    if (actual != asset.size) throw KuanProtocolError("Incomplete archived attachment")
                    files.saveUploadFromUri(local.toUri(), asset.name, asset.mime)
                }
                attachment.text != null -> files.saveUploadFromBytes(
                    attachment.text.encodeToByteArray(), attachment.name, attachment.mime,
                )
                else -> {
                    val owned = attachment.link as? KuanFileLink.Owned ?: return null
                    try {
                        return kuanFiles.save(owned, scope)
                    } catch (error: KuanHttpError) {
                        if (error.status !in setOf(404, 410)) throw error
                        return null
                    }
                }
            }
            SavedKuanFile(entity.id, files.getFile(entity), entity.displayName, entity.mimeType)
        } finally {
            local.delete()
        }
    }
}

internal data class KuanArchive(val conversations: List<LegacyConversation>, val assets: Map<String, LegacyAsset>)
internal data class LegacyConversation(
    val id: String, val title: String, val createdAt: Long, val updatedAt: Long, val messages: List<LegacyMessage>,
)
internal data class LegacyMessage(
    val id: String, val role: MessageRole, val createdAt: Long, val content: String,
    val summary: String?, val files: List<LegacyAttachment>,
)
internal data class LegacyAsset(val path: String, val name: String, val mime: String, val size: Long)
internal data class LegacyAttachment(val assetId: String?, val link: KuanFileLink?, val name: String, val mime: String, val text: String?)

internal suspend fun readKuanArchive(zip: ZipFile, owner: Long): KuanArchive {
    val paths = HashSet<String>()
    var total = 0L
    val entries = zip.entries()
    while (entries.hasMoreElements()) {
        val entry = entries.nextElement()
        val path = entry.name
        if (!paths.add(path) || paths.size > MAX_FILES || entry.size < 0 ||
            path.startsWith("/") || '\\' in path || path.split('/').any { it == "." || it == ".." }
        ) throw KuanProtocolError("Invalid file table in Kuan API backup")
        if (entry.size > MAX_UNPACKED - total) throw KuanProtocolError("The uncompressed backup exceeds 100 MiB")
        total += entry.size
    }
    val entry = zip.getEntry("manifest.json") ?: throw KuanProtocolError("Kuan API backup manifest is missing")
    if (entry.size !in 1..MAX_MANIFEST) throw KuanProtocolError("Invalid Kuan API backup manifest size")
    val bytes = ByteArrayOutputStream(entry.size.toInt())
    zip.getInputStream(entry).use { input -> copyKuanBytes(input, bytes, MAX_MANIFEST) }
    val root = KuanJson.parseToJsonElement(bytes.toByteArray().decodeToString(throwOnInvalidSequence = true)).asObject()
    if (root.int("version") != 1 || root.long("ownerId") != owner) {
        throw KuanProtocolError("This backup belongs to a different account or uses an unsupported format")
    }
    val assets = linkedMapOf<String, LegacyAsset>()
    val assetPaths = mutableSetOf<String>()
    val assetRows = root.array("assets") ?: throw KuanProtocolError("Kuan API backup has no attachment table")
    for (element in assetRows) {
        val item = element.asObject()
        val id = item.requiredId("assetId")
        val path = item.string("path").orEmpty()
        val file = zip.getEntry(path)
        val size = item.long("size")
        if (!path.startsWith("assets/") || file == null || file.isDirectory || file.size != size ||
            id in assets || !assetPaths.add(path)
        ) throw KuanProtocolError("Corrupt attachment table in Kuan API backup")
        assets[id] = LegacyAsset(path, archiveName(item.string("name"), "attachment"), item.mime(), file.size)
    }
    val conversationRows = root.array("conversations") ?: throw KuanProtocolError("Kuan API backup has no conversations")
    if (conversationRows.size > 5_000) throw KuanProtocolError("Too many conversations in this backup")
    val conversationIds = mutableSetOf<String>()
    var messageCount = 0
    val conversations = conversationRows.map { element ->
        val row = element.asObject()
        val id = row.requiredId("id")
        if (!conversationIds.add(id)) throw KuanProtocolError("Duplicate conversation in Kuan API backup")
        val createdAt = row.timestamp("createdAt")
        val source = row.array("messages") ?: throw KuanProtocolError("Kuan API backup has no message list")
        messageCount += source.size
        if (messageCount > MAX_MESSAGES) throw KuanProtocolError("Too many messages in this backup")
        val messageIds = mutableSetOf<String>()
        val messages = source.mapNotNull { item ->
            val message = item.asObject()
            val messageId = message.requiredId("id")
            if (!messageIds.add(messageId)) throw KuanProtocolError("Duplicate message in Kuan API backup")
            val role = when (message.string("role")) {
                "user" -> MessageRole.USER
                "assistant" -> MessageRole.ASSISTANT
                else -> return@mapNotNull null
            }
            val attachments = buildList {
                message.array("attachments")?.forEach { raw ->
                    val file = raw.asObject()
                    add(LegacyAttachment(
                        file.string("assetId"), file.string("url")?.let(::kuanFileLink),
                        archiveName(file.string("name"), "attachment"), file.mime(),
                        if (file.string("kind") == "text" && file.string("assetId") == null) file.string("text") else null,
                    ))
                }
                val image = message.string("imageAssetId")
                val link = message.string("imageUrl")?.let(::kuanFileLink)
                if (image != null || link != null) add(LegacyAttachment(image, link, "image.png", "image/png", null))
            }.distinctBy { it.assetId ?: it.link ?: it }
            LegacyMessage(messageId, role, message.timestamp("createdAt"),
                message.string("content").orEmpty(), message.string("reasoningSummary"), attachments)
        }
        LegacyConversation(id, row.string("title").orEmpty().take(200), createdAt,
            maxOf(createdAt, row.timestamp("updatedAt")), messages)
    }
    return KuanArchive(conversations, assets)
}

private fun JsonObject.requiredId(field: String) = string(field)?.takeIf { it.isNotBlank() && it.length <= 256 }
    ?: throw KuanProtocolError("Invalid identifier in Kuan API backup")

private fun JsonObject.timestamp(field: String) = long(field)?.takeIf { it in 0L..32_503_680_000_000L }
    ?: throw KuanProtocolError("Invalid timestamp in Kuan API backup")

private fun JsonObject.mime() = string("type")?.lowercase()?.takeIf { it.matches(Regex("[a-z0-9.+-]+/[a-z0-9.+-]+")) }
    ?: "application/octet-stream"

private fun legacyId(scope: String, kind: String, id: String): Uuid =
    Uuid.parse(UUID.nameUUIDFromBytes("kuan-history/$scope/$kind/$id".encodeToByteArray()).toString())
