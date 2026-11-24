package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.OutputStream
import java.security.MessageDigest
import java.util.zip.ZipEntry
import java.util.zip.ZipFile
import java.util.zip.ZipOutputStream
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.core.MessageRole
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.data.files.FileFolders
import me.rerere.rikkahub.data.files.FilesManager
import me.rerere.rikkahub.data.model.Conversation
import okhttp3.MediaType.Companion.toMediaTypeOrNull

internal data class KuanCloudSyncResult(val imported: KuanHistoryResult, val published: Boolean, val conflict: Boolean)

/** v1 is a snapshot, not a replication log. Never propagate deletion or replace a cloud-side edit. */
internal class KuanCloudHistory(
    private val context: Context,
    private val session: KuanSession,
    private val files: FilesManager,
    private val transfers: KuanFiles,
) {
    private fun ledger(scope: String) = context.getSharedPreferences("kuan-cloud-$scope", Context.MODE_PRIVATE)
    private fun record(id: String) = "revision:" + cloudDigest(id.encodeToByteArray())
    private fun primary(row: LegacyConversation) = "import:" + cloudDigest(row.id.encodeToByteArray())

    fun isOwnRevision(scope: String, id: String, revision: String) = ledger(scope).getString(record(id), null) == revision

    fun importedRevisionChanged(scope: String, row: LegacyConversation, localExists: Boolean): Boolean =
        localExists && ledger(scope).getString(primary(row), null)?.let { it != row.revision } == true

    fun recordImportedRevision(scope: String, row: LegacyConversation) {
        val preferences = ledger(scope)
        val key = primary(row)
        if (!preferences.contains(key)) preferences.edit().putString(key, row.revision).apply()
    }

    suspend fun sync(
        conversation: Conversation,
        profile: KuanProfile,
        epoch: Long,
        import: suspend (ZipFile, KuanArchive) -> KuanHistoryResult,
    ): KuanCloudSyncResult {
        val downloaded = File.createTempFile("kuan-cloud-base-", ".zip", context.cacheDir)
        try {
            val revision = try {
                transfers.cloudArchive(profile.scope, downloaded)
            } catch (error: KuanHttpError) {
                if (error.status != 404) throw error
                null
            }
            val attachments = linkedMapOf<String, ExportAsset>()
            val outgoing = exportRow(conversation, attachments)
            val preference = ledger(profile.scope)
            val localKey = "upload:${conversation.id}"
            val previousId = preference.getString(localKey, null) ?: "native-${conversation.id}"
            val existing = if (revision == null) null else ZipFile(downloaded)
            try {
                val base = existing?.let { readKuanArchive(it, profile.id) }
                val oldRows = base?.manifest?.array("conversations").orEmpty().filterIsInstance<JsonObject>()
                val prior = oldRows.firstOrNull { it.string("id") == previousId }
                val proposed = outgoing.withCloudId(previousId)
                val conflict = prior != null && cloudRowRevision(prior) != cloudRowRevision(proposed) &&
                    !isOwnRevision(profile.scope, previousId, cloudRowRevision(prior))
                val id = if (!conflict) previousId else "native-${conversation.id}-" + cloudRowRevision(outgoing).take(24)
                val row = outgoing.withCloudId(id)
                val rowRevision = cloudRowRevision(row)
                val target = oldRows.firstOrNull { it.string("id") == id }
                if (target != null && id != previousId && cloudRowRevision(target) != rowRevision) {
                    throw KuanProtocolError("A differently edited classic copy already exists; no backup was changed")
                }
                val changed = target == null || cloudRowRevision(target) != rowRevision
                if (!session.isCurrent(profile.scope, epoch)) throw KuanHttpError(401)
                if (!changed) {
                    preference.edit().putString(localKey, id).putString(record(id), rowRevision).apply()
                    return KuanCloudSyncResult(import(requireNotNull(existing), requireNotNull(base)), false, conflict)
                }
                val candidate = File.createTempFile("kuan-cloud-next-", ".zip", context.cacheDir)
                try {
                    val rows = oldRows.toMutableList()
                    val position = rows.indexOfFirst { it.string("id") == id }
                    if (position >= 0) rows[position] = row else rows += row
                    writeArchive(candidate, profile.id, id, existing, base, rows, attachments)
                    return ZipFile(candidate).use { zip ->
                        val verified = readKuanArchive(zip, profile.id)
                        if (!session.isCurrent(profile.scope, epoch)) throw KuanHttpError(401)
                        transfers.publishCloudArchive(profile.scope, candidate, revision, digestFile(candidate))
                        preference.edit().putString(localKey, id).putString(record(id), rowRevision).apply()
                        KuanCloudSyncResult(import(zip, verified), true, conflict)
                    }
                } finally {
                    candidate.delete()
                }
            } finally {
                existing?.close()
            }
        } finally {
            downloaded.delete()
        }
    }

    private suspend fun exportRow(conversation: Conversation, assets: MutableMap<String, ExportAsset>): JsonObject {
        var total = 0L
        val messages = conversation.currentMessages.asSequence()
            .filter { !it.isSynthetic && !it.isContextCheckpoint && it.role in setOf(MessageRole.USER, MessageRole.ASSISTANT) }
            .take(MAX_MESSAGES + 1).toList()
        require(messages.size <= MAX_MESSAGES) { "Too many messages" }
        val rows = messages.mapNotNull { message ->
            currentCoroutineContext().ensureActive()
            val references = message.parts.mapNotNull { part -> when (part) {
                is UIMessagePart.Document -> Triple(part.url, part.fileName, part.mime)
                is UIMessagePart.Image -> Triple(part.url, "", "image/png")
                is UIMessagePart.Audio -> Triple(part.url, "", "audio/mpeg")
                is UIMessagePart.Video -> Triple(part.url, "", "video/mp4")
                else -> null
            } }
            val attachments = references.map { (uri, name, mime) ->
                val file = exportFile(uri)
                val relative = file.relativeTo(context.filesDir.canonicalFile).invariantSeparatorsPath
                val record = files.getByRelativePath(relative)
                val displayName = archiveName(name.ifBlank { record?.displayName ?: file.name }, "attachment")
                val type = (record?.mimeType ?: mime).toMediaTypeOrNull()?.let { "${it.type}/${it.subtype}" }
                    ?.takeUnless { '*' in it } ?: "application/octet-stream"
                val size = file.length().takeIf { it in 0..MAX_UNPACKED } ?: throw KuanProtocolError("A cloud attachment is too large")
                val digest = digestFile(file)
                val id = "native-" + cloudDigest("$digest\n$displayName\n$type".encodeToByteArray())
                if (id !in assets) {
                    total += size
                    if (total > MAX_UNPACKED || assets.size >= MAX_FILES) throw KuanProtocolError("Cloud attachments exceed the archive limit")
                    assets[id] = ExportAsset(file, displayName, type, size, digest)
                }
                buildJsonObject {
                    put("assetId", id)
                    put("name", displayName)
                    put("type", type)
                    put("kind", if (type.startsWith("image/")) "image" else "file")
                    put("size", size)
                }
            }
            val text = message.withKuanQuestionHistory().parts.filterIsInstance<UIMessagePart.Text>().joinToString("\n\n") { it.text }
            if (text.isBlank() && attachments.isEmpty()) return@mapNotNull null
            buildJsonObject {
                put("id", message.id.toString())
                put("role", if (message.role == MessageRole.USER) "user" else "assistant")
                put("createdAt", message.createdAt.toInstant(TimeZone.currentSystemDefault()).toEpochMilliseconds())
                put("content", text)
                if (attachments.isNotEmpty()) {
                    put("attachments", JsonArray(attachments))
                    if (message.role == MessageRole.ASSISTANT) {
                        attachments.firstOrNull { it.string("type")?.startsWith("image/") == true }
                            ?.string("assetId")?.let { put("imageAssetId", it) }
                    }
                }
            }
        }
        if (rows.isEmpty()) throw KuanProtocolError("No chat messages to sync")
        return buildJsonObject {
            put("title", conversation.title.take(200))
            put("createdAt", conversation.createAt.toEpochMilli())
            put("updatedAt", conversation.updateAt.toEpochMilli())
            put("messages", JsonArray(rows))
        }
    }

    private fun exportFile(value: String): File {
        val uri = Uri.parse(value)
        if (uri.scheme != "file" || !uri.authority.isNullOrEmpty()) {
            throw KuanProtocolError("Save the original attachment to this conversation before syncing")
        }
        val file = File(uri.path ?: throw KuanProtocolError("The attachment original is unavailable")).canonicalFile
        val allowed = listOf(FileFolders.UPLOAD, FileFolders.TOOL_OUTPUTS, FileFolders.MEDIA_CREATION)
            .any { file.toPath().startsWith(context.filesDir.resolve(it).canonicalFile.toPath()) }
        if (!allowed || !file.isFile) throw KuanProtocolError("An attachment original is missing; the cloud copy was not changed")
        return file
    }

    private suspend fun writeArchive(
        target: File,
        owner: Long,
        active: String,
        zip: ZipFile?,
        base: KuanArchive?,
        rows: List<JsonObject>,
        files: Map<String, ExportAsset>,
    ) {
        val oldAssets = base?.manifest?.array("assets").orEmpty().filterIsInstance<JsonObject>()
        val retained = oldAssets.associateBy { it.string("assetId") }
        for ((id, asset) in files) {
            val existing = base?.assets?.get(id) ?: continue
            if (existing.size != asset.size || existing.name != asset.name || existing.mime != asset.type) {
                throw KuanProtocolError("A classic cloud attachment conflicts with the local file")
            }
            val hash = MessageDigest.getInstance("SHA-256")
            val source = requireNotNull(zip)
            source.getInputStream(source.getEntry(existing.path)).use {
                copyKuanBytes(it, discardBytes, existing.size, hash)
            }
            if (hash.digest().hex() != asset.digest) throw KuanProtocolError("A classic cloud attachment has different bytes")
        }
        val fresh = files.filterKeys { it !in retained }
        val manifest = JsonObject(base?.manifest.orEmpty() + buildJsonObject {
            put("version", 1)
            put("ownerId", owner.toString())
            put("exportedAt", System.currentTimeMillis())
            put("activeConversationId", active)
            put("conversations", JsonArray(rows))
            put("assets", JsonArray(oldAssets + fresh.map { (id, asset) -> buildJsonObject {
                put("assetId", id)
                put("path", "assets/$id")
                put("name", asset.name)
                put("type", asset.type)
                put("size", asset.size)
            } }))
        })
        val bytes = manifest.toString().encodeToByteArray()
        val newPaths = fresh.keys.mapTo(HashSet()) { "assets/$it" }
        val priorEntries = zip?.entries()?.asSequence()?.filter { it.name != "manifest.json" }?.toList().orEmpty()
        if (bytes.size > MAX_MANIFEST || 1 + priorEntries.size + fresh.size > MAX_FILES ||
            priorEntries.sumOf { it.size } + fresh.values.sumOf { it.size } + bytes.size > MAX_UNPACKED ||
            priorEntries.any { it.name in newPaths }) throw KuanProtocolError("The merged cloud backup exceeds its limits")
        ZipOutputStream(target.outputStream().buffered()).use { out ->
            out.putNextEntry(ZipEntry("manifest.json"))
            out.write(bytes)
            out.closeEntry()
            for (entry in priorEntries) {
                out.putNextEntry(ZipEntry(entry.name))
                requireNotNull(zip).getInputStream(entry).use { input ->
                    if (copyKuanBytes(input, out, entry.size) != entry.size) throw KuanProtocolError("Classic backup entry changed")
                }
                out.closeEntry()
            }
            for ((id, asset) in fresh) {
                out.putNextEntry(ZipEntry("assets/$id"))
                val digest = MessageDigest.getInstance("SHA-256")
                val size = asset.file.inputStream().use { copyKuanBytes(it, out, asset.size, digest) }
                if (size != asset.size || digest.digest().hex() != asset.digest) {
                    throw KuanProtocolError("An attachment changed while preparing the upload")
                }
                out.closeEntry()
            }
        }
    }

    private data class ExportAsset(val file: File, val name: String, val type: String, val size: Long, val digest: String)
}

private fun JsonObject.withCloudId(id: String) = JsonObject(this + ("id" to JsonPrimitive(id)))

internal fun cloudRowRevision(row: JsonObject): String =
    cloudDigest(canonicalJson(row).toString().encodeToByteArray())

private fun canonicalJson(value: JsonElement, depth: Int = 0): JsonElement {
    if (depth > 48) throw KuanProtocolError("The cloud archive contains excessively nested data")
    return when (value) {
        is JsonObject -> JsonObject(value.toSortedMap().mapValues { canonicalJson(it.value, depth + 1) })
        is JsonArray -> JsonArray(value.map { canonicalJson(it, depth + 1) })
        else -> value
    }
}

private val discardBytes = object : OutputStream() {
    override fun write(value: Int) {}
    override fun write(bytes: ByteArray, offset: Int, length: Int) {}
}

private suspend fun digestFile(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { copyKuanBytes(it, discardBytes, MAX_UNPACKED, digest) }
    return digest.digest().hex()
}

private fun cloudDigest(bytes: ByteArray) = MessageDigest.getInstance("SHA-256").digest(bytes).hex()
private fun ByteArray.hex() = joinToString("") { "%02x".format(it) }
