package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.util.AtomicFile
import java.io.File
import kotlin.uuid.Uuid
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.rikkahub.AppScope
import me.rerere.rikkahub.service.MediaCreationForegroundService

/** Attached to the account and process, not the WebView. Never retries an uncertain image POST. */
internal class KuanStudioTasks(
    private val context: Context,
    private val scope: AppScope,
    private val session: KuanSession,
    private val foreground: Boolean = true,
) {
    private data class Key(val owner: String, val id: Uuid)
    private data class Active(val epoch: Long, val job: Job)
    private val directory = File(context.noBackupFilesDir, "kuan-studio-receipts")
    private val lock = Mutex()
    private val active = mutableMapOf<Key, Active>()

    init {
        scope.launch {
            session.state.collect { state ->
                lock.withLock {
                    active.filter { (key, job) -> state.profile?.scope != key.owner || state.epoch != job.epoch }
                        .values.forEach { it.job.cancel() }
                }
            }
        }
    }

    suspend fun start(studio: KuanStudio, owner: String, payload: JsonObject): JsonObject = withContext(Dispatchers.IO) {
        studio.requireOwner()
        val id = studioTaskId(payload)
        val key = Key(owner, id)
        val epoch = session.state.value.epoch
        lock.withLock {
            if (!session.isCurrent(owner, epoch)) throw KuanHttpError(401)
            existing(key)?.let { return@withLock it }
            if (active.count { it.key.owner == owner } >= 4) throw KuanProtocolError("Four Studio tasks are already running")
            // This is a device receipt, not a server acceptance.
            val started = result("generating")
            write(key, started)
            val job = scope.launch(start = CoroutineStart.UNDISPATCHED) {
                val visible = foreground && MediaCreationForegroundService.acquire(context, id, id)
                var state = result("interrupted")
                try {
                    state = result("completed", value = studio.generate(payload))
                } catch (cancelled: CancellationException) {
                    state = result("cancelled")
                    throw cancelled
                } catch (error: Exception) {
                    state = result("failed", error = error.kuanUiMessage())
                } finally {
                    val terminal = state
                    try {
                        withContext(NonCancellable + Dispatchers.IO) {
                            lock.withLock {
                                try {
                                    write(key, terminal)
                                } finally {
                                    active.remove(key)
                                }
                            }
                        }
                    } finally {
                        if (visible) MediaCreationForegroundService.release(context, id)
                    }
                }
            }
            active[key] = Active(epoch, job)
            started
        }
    }

    suspend fun status(studio: KuanStudio, owner: String, id: Uuid): JsonObject = withContext(Dispatchers.IO) {
        studio.requireOwner()
        lock.withLock { existing(Key(owner, id)) ?: result("interrupted") }
    }

    suspend fun stop(studio: KuanStudio, owner: String, id: Uuid): JsonObject = withContext(Dispatchers.IO) {
        studio.requireOwner()
        val key = Key(owner, id)
        val job = lock.withLock {
            val running = active[key]?.job
            if (running != null) running.cancel()
            else if (existing(key) == null) write(key, result("cancelled"))
            running
        }
        job?.join()
        lock.withLock { existing(key) ?: result("interrupted") }
    }

    private fun file(key: Key) = AtomicFile(File(File(directory, key.owner), "${key.id}.json"))

    private fun existing(key: Key): JsonObject? {
        val file = file(key)
        val bytes = try { file.readFully() } catch (_: java.io.FileNotFoundException) { return null }
        if (bytes.size > 24 * 1024) throw KuanProtocolError("The local Studio receipt is too large")
        val saved = KuanJson.parseToJsonElement(bytes.decodeToString()).asObject()
        return if (saved.string("status") == "generating" && key !in active) result("interrupted") else saved
    }

    private fun write(key: Key, state: JsonObject) {
        val file = file(key)
        check(file.baseFile.parentFile?.let { it.isDirectory || it.mkdirs() } == true)
        val handle = file.startWrite()
        try {
            handle.write(state.toString().encodeToByteArray())
            file.finishWrite(handle)
        } catch (error: Exception) {
            file.failWrite(handle)
            throw error
        }
    }

    private fun result(status: String, value: JsonObject? = null, error: String? = null) = buildJsonObject {
        put("status", status)
        if (value != null) put("result", value)
        if (error != null) put("error", error)
        if (status != "generating") put("completedAt", System.currentTimeMillis())
    }
}

internal fun studioTaskId(payload: JsonObject): Uuid =
    payload.string("taskId")?.takeIf { it.length == 36 }?.let { runCatching { Uuid.parse(it) }.getOrNull() }
        ?: throw KuanProtocolError("Invalid Studio task identifier")
