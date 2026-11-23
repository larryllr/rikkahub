package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.util.AtomicFile
import java.io.File
import java.io.FileNotFoundException
import java.io.IOException
import kotlin.uuid.Uuid
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.provider.Model
import me.rerere.ai.provider.TextGenerationParams
import me.rerere.ai.provider.providers.openai.OpenAIWire
import me.rerere.ai.ui.ServerToolStatus
import me.rerere.ai.ui.StreamChunk

private const val JOB_PATH = "$KUAN_API/kuan/chat-jobs"
private const val DELIVERY_CARD = "kuan.background"

@Serializable
internal data class KuanJobRecord(
    val id: String,
    val scope: String,
    val group: Long,
    val conversation: Uuid,
    val anchor: Uuid,
    val node: Uuid,
    val message: Uuid,
    val model: Uuid,
    val wireModel: String,
    val protocol: String,
    val cursor: Long? = null,
)

/** Tracks a job independently of the network connection; never stores prompts, events, or keys here. */
internal class KuanJobs(context: Context, private val session: KuanSession, api: KuanApi) {
    private val wire = OpenAIWire(api.client)
    private val directory = File(context.noBackupFilesDir, "kuan-pending-jobs")
    private val lock = Mutex()

    private fun file(conversation: Uuid) = AtomicFile(File(directory, "$conversation.json"))
    private fun read(conversation: Uuid): KuanJobRecord? {
        val raw = try { file(conversation).readFully() } catch (_: FileNotFoundException) { return null }
        return KuanJson.decodeFromString<KuanJobRecord>(raw.decodeToString()).also {
            require(it.conversation == conversation && it.id.matches(Regex("job-[a-f0-9]{32}")))
        }
    }

    private fun write(record: KuanJobRecord) {
        directory.mkdirs()
        val target = file(record.conversation)
        val handle = target.startWrite()
        try {
            handle.write(KuanJson.encodeToString(record).encodeToByteArray())
            target.finishWrite(handle)
        } catch (error: Exception) {
            target.failWrite(handle)
            throw error
        }
    }

    suspend fun pending(conversation: Uuid): KuanJobRecord? = withContext(Dispatchers.IO) {
        if (!file(conversation).baseFile.isFile) return@withContext null
        val scope = session.state.first { !it.loading }.profile?.scope ?: return@withContext null
        lock.withLock {
            read(conversation)?.takeIf { it.scope == scope }
        }
    }

    private suspend fun remove(record: KuanJobRecord) {
        lock.withLock {
            if (read(record.conversation)?.id == record.id) file(record.conversation).delete()
        }
    }

    fun start(
        route: KuanRoute,
        key: String,
        protocol: String,
        params: TextGenerationParams,
        wireBody: JsonObject,
    ): Flow<StreamChunk> = flow {
        val target = checkNotNull(params.backgroundTarget)
        val conversation = Uuid.parse(checkNotNull(params.sessionId))
        val message = checkNotNull(target.messageId)
        val id = "job-" + message.toString().replace("-", "")
        val record = KuanJobRecord(
            id, route.scope, route.groupId, conversation, target.anchorId, target.nodeId,
            message, params.model.id, params.model.modelId, protocol,
        )
        lock.withLock {
            if (read(conversation) != null) throw KuanProtocolError("This conversation already has a server task to recover")
            write(record)
        }
        try {
            val receipt = session.json(route.scope, JOB_PATH, "POST", buildJsonObject {
                put("client_job_id", id)
                put("conversation_id", conversation.toString())
                put("assistant_message_id", message.toString())
                put("api_key", key)
                put("attempts", buildJsonArray {
                    add(buildJsonObject {
                        put("protocol", protocol)
                        put("body", wireBody)
                    })
                })
            }, headers = mapOf("Idempotency-Key" to id)).asObject()
            verify(receipt, record)
        } catch (error: CancellationException) {
            throw error
        } catch (error: KuanHttpError) {
            if (error.status in 400..499 && error.status !in setOf(408, 409, 425)) {
                remove(record)
                throw error
            }
            // A timed-out POST may already be committed; only query its original ID.
        } catch (_: IOException) {
            // Do not submit to an alternate endpoint or allocate another task ID.
        }
        emitAll(events(record))
    }.flowOn(Dispatchers.IO)

    fun events(record: KuanJobRecord): Flow<StreamChunk> = flow {
        var cursor = 0L
        var accepted = false
        var decoder = KuanStreamDecoder(wire, record.protocol == "responses")
        while (true) {
            val snapshot = try {
                poll(record, cursor)
            } catch (error: KuanHttpError) {
                if (error.status == 404) {
                    remove(record)
                    throw KuanProtocolError("The server task was not found or its retention period expired")
                }
                throw error
            }
            verify(snapshot, record)
            if (!accepted) {
                accepted = true
                emit(StreamChunk.ServerToolStart(DELIVERY_CARD, "kuan_background"))
            }
            val events = snapshot.array("events") ?: throw KuanProtocolError("Server task events are missing")
            events.forEach { raw ->
                val wrapped = raw.asObject()
                val seq = wrapped.long("seq") ?: throw KuanProtocolError("Invalid server task cursor")
                if (seq <= cursor) return@forEach
                if (seq != cursor + 1 || wrapped.string("protocol") != record.protocol) {
                    throw KuanProtocolError("Server task event order or protocol changed")
                }
                val event = wrapped.obj("event") ?: throw KuanProtocolError("Invalid server task event")
                if (event.string("type") == "kuan.response.reset") {
                    decoder = KuanStreamDecoder(wire, record.protocol == "responses")
                    emit(StreamChunk.ResetAttempt)
                    emit(StreamChunk.ServerToolStart(DELIVERY_CARD, "kuan_background"))
                } else {
                    try {
                        decoder.accept(event.toString()).forEach { emit(it) }
                    } catch (error: KuanProtocolError) {
                        if (snapshot.string("status") in setOf("failed", "cancelled", "interrupted")) remove(record)
                        throw error
                    }
                }
                cursor = seq
            }
            val count = snapshot.long("event_count") ?: throw KuanProtocolError("Missing server task event count")
            if (snapshot.long("cursor") != cursor || cursor > count) throw KuanProtocolError("Server task cursor was not confirmed")
            val status = snapshot.string("status")
            if (cursor == count && status == "completed") {
                decoder.accept("[DONE]").forEach { emit(it) }
                emit(StreamChunk.ServerToolEnd(DELIVERY_CARD, status = ServerToolStatus.COMPLETED))
                lock.withLock {
                    if (read(record.conversation)?.id == record.id) write(record.copy(cursor = cursor))
                }
                break
            }
            if (cursor == count && status in setOf("failed", "cancelled", "interrupted")) {
                remove(record)
                throw KuanProtocolError("Server task $status")
            }
        }
    }.flowOn(Dispatchers.IO)

    private suspend fun poll(record: KuanJobRecord, cursor: Long): JsonObject {
        var retries = 0
        while (true) {
            try {
                return session.json(
                    record.scope, "$JOB_PATH/${record.id}?after=$cursor&wait_ms=20000",
                    limit = 120L * 1024 * 1024,
                ).asObject()
            } catch (error: IOException) {
                val status = (error as? KuanHttpError)?.status
                if (retries == 5 || status != null && status !in listOf(408, 425, 429, 502, 503, 504)) throw error
                delay(1000L shl retries++)
            }
        }
    }

    private fun verify(snapshot: JsonObject, record: KuanJobRecord) {
        if (!snapshot.flag("request_persisted") || snapshot.string("accepted_at").isNullOrBlank() ||
            snapshot.string("id") != record.id || snapshot.string("client_job_id") != record.id ||
            snapshot.string("conversation_id") != record.conversation.toString() ||
            snapshot.string("assistant_message_id") != record.message.toString() ||
            snapshot.string("protocol") != record.protocol
        ) throw KuanProtocolError("The server did not verify ownership and persistence of this task")
    }

    suspend fun acknowledge(conversation: Uuid, message: Uuid) = withContext(Dispatchers.IO) {
        val record = pending(conversation) ?: return@withContext
        val cursor = record.cursor ?: return@withContext
        if (record.message != message || cursor <= 0) return@withContext
        try {
            session.json(record.scope, "$JOB_PATH/${record.id}?after=$cursor", "DELETE")
        } catch (error: KuanHttpError) {
            if (error.status != 404) throw error
        }
        remove(record)
    }

    suspend fun cancel(conversation: Uuid) = withContext(Dispatchers.IO) {
        val record = pending(conversation) ?: return@withContext
        try {
            val snapshot = session.json(record.scope, "$JOB_PATH/${record.id}/cancel", "POST", buildJsonObject {}).asObject()
            verify(snapshot, record)
            if (snapshot.string("status") == "cancelled") remove(record)
        } catch (error: KuanHttpError) {
            if (error.status == 404) remove(record) else throw error
        }
    }
}
