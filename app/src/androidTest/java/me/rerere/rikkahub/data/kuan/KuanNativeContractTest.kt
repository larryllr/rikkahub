package me.rerere.rikkahub.data.kuan

import android.content.ContextWrapper
import androidx.core.net.toUri
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicInteger
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.uuid.Uuid
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.ai.core.MessageRole
import me.rerere.ai.provider.BackgroundTarget
import me.rerere.ai.provider.ProviderSetting
import me.rerere.ai.provider.TextGenerationParams
import me.rerere.ai.provider.providers.openai.OpenAIWire
import me.rerere.ai.ui.StreamChunk
import me.rerere.ai.ui.StreamChunkHandler
import me.rerere.ai.ui.UIMessage
import me.rerere.ai.ui.UIMessageAnnotation
import me.rerere.ai.ui.UIMessagePart
import me.rerere.rikkahub.AppScope
import me.rerere.rikkahub.data.datastore.SettingsStore
import me.rerere.rikkahub.data.files.FilesManager
import me.rerere.rikkahub.data.files.saveUploadFromBytes
import me.rerere.rikkahub.service.ChatService
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okio.Buffer
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.koin.core.context.GlobalContext

@RunWith(AndroidJUnit4::class)
class KuanNativeContractTest {
    @Test
    fun responsesReplyUsesTheSamePresentationAsChatCompletions() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val decoder = KuanStreamDecoder(OpenAIWire(OkHttpClient()), responses = true)
        val handler = StreamChunkHandler()
        val events = decoder.accept(
            """{"type":"response.output_text.delta","item_id":"work","content_index":0,"delta":${JsonPrimitive(Fixture().finalReply)}}""",
        ) + decoder.accept(
            """{"type":"response.completed","response":{"id":"work-reply","status":"completed","output":[]}}""",
        ) + decoder.accept("[DONE]")
        val raw = events.fold(UIMessage(role = MessageRole.ASSISTANT, parts = emptyList())) { message, chunk ->
            handler.handle(listOf(message), chunk).single()
        }
        val finished = finishKuanPresentation(context, raw)
        val text = finished.parts.filterIsInstance<UIMessagePart.Text>().single()
        assertEquals("Final answer", text.text)
        assertEquals("Use A", text.kuanFormGroups().single().array("buttons")!!.single().asObject().string("prompt"))
        assertEquals(1, finished.annotations.size)
        assertTrue(decoder.terminated)
    }

    @Test
    fun groupedChatReplaysTheSameJobAndImportsLegacyOriginalsOnce() = runBlocking {
        withTimeout(90000) {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val slot = File.createTempFile("kuan-native-contract-", ".tmp", context.cacheDir)
            check(slot.delete() && slot.mkdirs())
            val isolated = object : ContextWrapper(context) {
                override fun getNoBackupFilesDir() = slot
                override fun getApplicationContext() = this
            }
            val scope = AppScope()
            try {
                val fixture = Fixture()
                val api = KuanApi(KuanApi.privateClient().newBuilder().addInterceptor(fixture).build())
                val session = KuanSession(isolated, scope, api)
                val settings = SettingsStore(
                    PreferenceDataStoreFactory.create(scope = scope) { File(slot, "contract.preferences_pb") }, scope,
                )
                val catalog = KuanCatalog(scope, session, api, settings)
                session.state.first { !it.loading }
                assertTrue(session.policy().registration)
                assertFalse(session.signIn("native-fixture@example.invalid", "fixture-password"))
                val profile = session.profile()
                assertEquals(42L, profile.id)
                val rejected = runCatching { KuanOperations(session, api).billing() }.exceptionOrNull()
                assertEquals(403, (rejected as? KuanHttpError)?.status)
                assertEquals(0, fixture.adminRequests.get())
                catalog.state.first { !it.busy && it.groupId == 1L }
                val web = settings.awaitLoaded().providers.filterIsInstance<ProviderSetting.OpenAI>()
                    .single { it.kuanRoute()?.let { route -> route.groupId == 1L && route.lane == KuanLane.WEB } == true }
                val selected = web.models.single()
                assertEquals(listOf("standard", "extended"), selected.serverReasoningLevels)
                catalog.refresh(2, force = true)
                assertEquals(2L, catalog.state.value.groupId)
                val work = settings.awaitLoaded().providers.filterIsInstance<ProviderSetting.OpenAI>()
                    .single { it.kuanRoute()?.groupId == 2L }
                assertEquals("fixture-work", work.models.single().modelId)
                assertTrue(work.useResponseApi)
                assertEquals("fixture-key-group-1", catalog.key(profile.scope, 1))
                assertEquals(1, fixture.keyRequests.count { it == 1L })

                val files = GlobalContext.get().get<FilesManager>()
                val kuanFiles = KuanFiles(isolated, session, api, files)
                val source = files.saveUploadFromBytes(fixture.original, "source.py", "text/x-python")
                val sourcePart = UIMessagePart.Document(files.getFile(source).toUri().toString(), "source.py", "text/x-python")
                val earlier = UIMessage(role = MessageRole.USER, parts = listOf(sourcePart))
                val follow = UIMessage(role = MessageRole.USER, parts = listOf(UIMessagePart.Text("Read the original file")))
                val conversation = Uuid.random()
                val reply = Uuid.random()
                val jobs = KuanJobs(isolated, session, api)
                val provider = KuanProvider(api, session, catalog, KuanAssets(context, session, api, files), jobs)
                val params = TextGenerationParams(
                    model = selected, sessionId = conversation.toString(),
                    backgroundTarget = BackgroundTarget(Uuid.random(), follow.id, reply),
                    providerReasoningEffort = "standard",
                )
                val rendered = mutableListOf<StreamChunk>()
                provider.streamText(web, listOf(earlier, follow), params).collect { rendered += it }
                assertTrue(rendered.any { it is StreamChunk.ServerToolStart && it.toolName == "kuan_background" })
                assertEquals("Draft discarded" + fixture.finalReply, rendered.filterIsInstance<StreamChunk.TextDelta>().joinToString("") { it.text })
                assertTrue(StreamChunk.ResetAttempt in rendered)
                assertEquals(1, fixture.submits.get())
                val created = checkNotNull(fixture.created)
                assertEquals("fixture-key-group-1", created.string("api_key"))
                val payload = created.array("attempts")!!.single().asObject().obj("body")!!
                assertEquals("standard", payload.string("reasoning_effort"))
                assertEquals(true, payload.obj("x_kuanapi_chat")!!.flag("web_only"))
                val oldAttachment = payload.array("messages")!!.first().asObject().array("content")!!.single()
                    .asObject().obj("file")!!
                assertEquals("source.py", oldAttachment.string("filename"))
                assertEquals("kuan-asset://" + fixture.assetId, oldAttachment.string("file_data"))
                assertEquals(1, fixture.uploads.get())

                val reopened = KuanJobs(isolated, session, api)
                val saved = checkNotNull(reopened.pending(conversation))
                var replyState = UIMessage(role = MessageRole.ASSISTANT, parts = emptyList())
                var handler = StreamChunkHandler(selected)
                reopened.events(saved).collect { event ->
                    if (event == StreamChunk.ResetAttempt) {
                        replyState = replyState.copy(parts = emptyList())
                        handler = StreamChunkHandler(selected)
                    } else replyState = handler.handle(listOf(replyState), event).single()
                }
                val projected = finishKuanPresentation(context, replyState)
                val answer = projected.parts.filterIsInstance<UIMessagePart.Text>().single()
                assertEquals("Final answer", answer.text)
                assertEquals("Pick a file", answer.kuanFormGroups().single().string("question"))
                assertEquals("https://example.com/file", (projected.annotations.single() as UIMessageAnnotation.UrlCitation).url)
                assertEquals(1, fixture.submits.get())
                reopened.acknowledge(conversation, reply)
                assertEquals(1, fixture.receipts.get())
                assertNull(reopened.pending(conversation))

                val filePath = "/download/file/" + "a".repeat(32) + "/original.py"
                val link = kuanFileLink("http://ai.larryllr.cc.cd" + filePath) as KuanFileLink.Owned
                val downloaded = kuanFiles.save(link)
                assertEquals("source.py", downloaded.name)
                assertEquals("py", downloaded.file.extension)
                assertArrayEquals(fixture.original, downloaded.file.readBytes())
                assertEquals(downloaded, kuanFiles.cached(link))

                val archive = File(slot, "legacy.zip")
                val legacyId = "android-fixture-" + Uuid.random()
                fixture.writeArchive(archive, owner = 43, conversation = legacyId)
                val chat = GlobalContext.get().get<ChatService>()
                val history = KuanHistory(isolated, session, settings, files, kuanFiles, chat)
                assertTrue(runCatching { history.import(archive.toUri()) }.exceptionOrNull() is KuanProtocolError)
                fixture.writeArchive(archive, owner = 42, conversation = legacyId)
                val first = history.import(archive.toUri())
                val duplicate = history.import(archive.toUri())
                assertEquals(KuanHistoryResult(1, 2, 0, 0), first)
                assertEquals(KuanHistoryResult(0, 0, 1, 0), duplicate)
                val importedId = Uuid.parse(UUID.nameUUIDFromBytes(
                    "kuan-history/${profile.scope}/conversation/$legacyId".encodeToByteArray(),
                ).toString())
                val imported = checkNotNull(chat.getConversation(importedId)).currentMessages.last()
                assertEquals(MessageRole.ASSISTANT, imported.role)
                assertEquals(1, imported.annotations.size)
                assertEquals("Pick a file", (imported.parts.single() as UIMessagePart.Text).kuanFormGroups().single().string("question"))
                session.signOut()
                assertNull(session.state.value.profile)
                assertTrue(session.state.value.ownerBound)
                assertTrue(runCatching { session.signIn("second@example.invalid", "fixture-password") }
                    .exceptionOrNull() is KuanProtocolError)
            } finally {
                scope.cancel()
                slot.deleteRecursively()
            }
        }
    }

    @Test
    fun administratorUpdateUsesTheReadRevisionAndPreservesOtherRates() = runBlocking {
        withTimeout(30000) {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val slot = File.createTempFile("kuan-admin-contract-", ".tmp", context.cacheDir)
            check(slot.delete() && slot.mkdirs())
            val isolated = object : ContextWrapper(context) {
                override fun getNoBackupFilesDir() = slot
                override fun getApplicationContext() = this
            }
            val scope = AppScope()
            try {
                val fixture = Fixture(admin = true)
                val api = KuanApi(KuanApi.privateClient().newBuilder().addInterceptor(fixture).build())
                val session = KuanSession(isolated, scope, api)
                session.state.first { !it.loading }
                assertFalse(session.signIn("native-fixture@example.invalid", "fixture-password"))
                val operations = KuanOperations(session, api)
                val accounts = operations.webAccounts()
                assertTrue(accounts.accounts.single().enabled)
                assertEquals(3, accounts.accounts.single().activeRequests)
                assertFalse(operations.setWebAccount(accounts, 100, false).accounts.single().enabled)
                val billing = operations.billing()
                val bad = runCatching { operations.savePrice(billing, "fixture-model", "unlisted", KuanBillingPrice("1", "0")) }
                assertTrue(bad.exceptionOrNull() is KuanProtocolError)
                val saved = operations.savePrice(billing, "fixture-model", "standard", KuanBillingPrice("1.250", "0.0010"))
                assertEquals(KuanBillingPrice("1.25", "0.001"), saved.price("fixture-model", "standard"))
                assertEquals(KuanBillingPrice("0.5", "0"), saved.price("other-model", ""))
                assertEquals(KuanBillingPrice("1", "0"), saved.price("fixture-model", ""))
                assertEquals(4, fixture.adminRequests.get())
                session.signOut()
            } finally {
                scope.cancel()
                slot.deleteRecursively()
            }
        }
    }

    private class Fixture(private val admin: Boolean = false) : Interceptor {
        val original = "print('source preserved')\n".encodeToByteArray()
        val hash = MessageDigest.getInstance("SHA-256").digest(original).joinToString("") { "%02x".format(it) }
        val assetId = "asset-" + hash.take(32)
        val keyRequests = CopyOnWriteArrayList<Long>()
        val submits = AtomicInteger()
        val uploads = AtomicInteger()
        val receipts = AtomicInteger()
        val adminRequests = AtomicInteger()
        @Volatile var created: JsonObject? = null
        @Volatile var released = false

        override fun intercept(chain: Interceptor.Chain): Response {
            val req = chain.request()
            check(req.url.isHttps && req.url.host == "kuanapi.kuankuan.de5.net")
            val path = req.url.encodedPath
            val auth = req.header("Authorization")
            return when {
                path == "/api/v1/settings/public" -> ok(req, """{"registration_enabled":true}""")
                path == "/api/v1/auth/login" -> {
                    val second = read(req).string("email")!!.startsWith("second")
                    ok(req, """{"access_token":"fixture-user-${if (second) 43 else 42}","refresh_token":"fixture-refresh","expires_in":3600}""")
                }
                path == "/api/v1/auth/me" -> {
                    val id = auth?.removePrefix("Bearer fixture-user-")?.toLongOrNull()
                    if (id == null) response(req, 401, "{}")
                    else ok(req, """{"id":$id,"role":"${if (admin) "admin" else "user"}","email":"native-fixture@example.invalid","balance":12.43}""")
                }
                path == "/api/v1/auth/logout" -> ok(req, "{}")
                path == "/api/v1/kuan/web-accounts" -> {
                    check(admin && auth == "Bearer fixture-user-42")
                    adminRequests.incrementAndGet()
                    val enabled = req.method == "GET"
                    if (!enabled) {
                        val write = read(req)
                        check(write.string("revision") == "a".repeat(64) && write.long("account_id") == 100L && write["enabled"] == JsonPrimitive(false))
                    }
                    response(req, 200, """{"revision":"${(if (enabled) "a" else "b").repeat(64)}",
                        "accounts":[{"id":100,"plan_type":"fixture","enabled":$enabled,"eligible":true,"active_requests":3}]}""")
                }
                path == "/api/v1/kuan/chat-billing" -> {
                    check(admin && auth == "Bearer fixture-user-42")
                    adminRequests.incrementAndGet()
                    val readOnly = req.method == "GET"
                    val policy = if (readOnly) """{"default":{"multiplier":"1","minimum_usd":"0"},
                        "rules":[{"model":"other-model","effort":"","multiplier":"0.5","minimum_usd":"0"}]}""" else {
                        val write = read(req)
                        check(write.string("revision") == "c".repeat(64))
                        checkNotNull(write.obj("policy")).toString()
                    }
                    response(req, 200, """{"revision":"${(if (readOnly) "c" else "d").repeat(64)}","policy":$policy,
                        "models":[{"id":"fixture-model","supported_reasoning_levels":[{"effort":"standard"}]}]}""")
                }
                path == "/api/v1/groups/chat" -> {
                    check(auth == "Bearer fixture-user-42")
                    ok(req, """[{"id":1,"name":"GPT fixture","platform":"openai"},{"id":2,"name":"Work fixture","platform":"openai"}]""")
                }
                path == "/api/v1/chat/api-key" -> {
                    check(auth == "Bearer fixture-user-42")
                    val id = checkNotNull(read(req).long("group_id"))
                    keyRequests += id
                    ok(req, """{"group_id":$id,"key":"fixture-key-group-$id","status":"active"}""")
                }
                path == "/v1/models" -> {
                    check(req.url.queryParameter("kuan_chat") == "1")
                    val data = if (auth == "Bearer fixture-key-group-1") {
                        """{"data":[{"id":"fixture-web","kuan_chatgpt_web":true,
                            "kuan_web_lane":"auto","supported_reasoning_levels":[{"effort":"standard"},"extended"]},
                            {"id":"admin-pro","kuan_chatgpt_web":true,"kuan_admin_only":true}]}"""
                    } else {
                        check(auth == "Bearer fixture-key-group-2")
                        """{"data":[{"id":"fixture-work","input_modalities":["text"]}]}"""
                    }
                    response(req, 200, data)
                }
                path == "/api/v1/kuan/chat-assets" -> {
                    check(auth == "Bearer fixture-user-42")
                    assertArrayEquals(original, Buffer().also { req.body!!.writeTo(it) }.readByteArray())
                    uploads.incrementAndGet()
                    ok(req, """{"id":"$assetId","sha256":"$hash","size":${original.size}}""")
                }
                path == "/api/v1/kuan/chat-jobs" && req.method == "POST" -> {
                    check(auth == "Bearer fixture-user-42")
                    val job = read(req)
                    check(req.header("Idempotency-Key") == job.string("client_job_id"))
                    created = job
                    submits.incrementAndGet()
                    ok(req, receipt(job, "queued", 0, emptyList()).toString(), 202)
                }
                path.startsWith("/api/v1/kuan/chat-jobs/") -> {
                    check(auth == "Bearer fixture-user-42")
                    val job = checkNotNull(created)
                    check(path.substringAfterLast('/') == job.string("client_job_id"))
                    val cursor = checkNotNull(req.url.queryParameter("after")?.toInt())
                    if (req.method == "DELETE") {
                        check(cursor == 4)
                        receipts.incrementAndGet()
                        ok(req, "null")
                    } else if (cursor == 0 && !released) {
                        released = true
                        ok(req, receipt(job, "running", 1, listOf(event(1, delta("Draft discarded")))).toString())
                    } else {
                        val events = listOf(
                            event(1, delta("Draft discarded")),
                            event(2, """{"type":"kuan.response.reset"}"""),
                            event(3, delta(finalReply)),
                            event(4, """{"id":"fixture","choices":[{"delta":{},"finish_reason":"stop"}]}"""),
                        )
                        ok(req, receipt(job, "completed", 4, events.drop(cursor)).toString())
                    }
                }
                path.startsWith("/download/file/") -> {
                    assertNull(auth)
                    response(
                        req, 200, original.decodeToString(), "text/x-python",
                        "attachment; filename*=UTF-8''source.py",
                    )
                }
                else -> error("Unexpected fixture path: $path")
            }
        }

        private fun receipt(job: JsonObject, status: String, items: Int, events: List<JsonObject>) = buildJsonObject {
            put("id", job.string("client_job_id"))
            put("client_job_id", job.string("client_job_id"))
            put("conversation_id", job.string("conversation_id"))
            put("assistant_message_id", job.string("assistant_message_id"))
            put("status", status)
            put("protocol", "chat_completions")
            put("request_persisted", true)
            put("accepted_at", "2026-11-23T00:00:00Z")
            put("cursor", items)
            put("event_count", items)
            put("events", JsonArray(events))
        }

        private fun event(seq: Int, raw: String) = buildJsonObject {
            put("seq", seq)
            put("protocol", "chat_completions")
            put("event", KuanJson.parseToJsonElement(raw))
        }
        private fun delta(value: String) = """{"id":"fixture","choices":[{"delta":{"content":${JsonPrimitive(value)}}}]}"""
        private fun read(req: Request) = KuanJson.parseToJsonElement(
            Buffer().also { req.body!!.writeTo(it) }.readUtf8(),
        ).asObject()
        private fun ok(req: Request, data: String, code: Int = 200) = response(req, code, """{"code":0,"data":$data}""")
        private fun response(req: Request, code: Int, body: String, mime: String = "application/json", disposition: String? = null) =
            Response.Builder().request(req).code(code).protocol(Protocol.HTTP_1_1).message("Synthetic fixture")
                .header("Content-Type", mime).apply { disposition?.let { header("Content-Disposition", it) } }
                .body(body.toResponseBody(mime.toMediaType())).build()

        val finalReply = """Final answer

            |<box><title>Pick a file</title><button onClick={()=>GenUI.issueNewTurn("Use A")}>File A</button></box>
            |
            |### Sources
            |- [File](https://example.com/file)
        """.trimMargin().trimEnd()

        fun writeArchive(path: File, owner: Long, conversation: String) {
            val manifest = buildJsonObject {
                put("ownerId", owner.toString())
                put("version", 1)
                put("conversations", buildJsonArray {
                    add(buildJsonObject {
                        put("id", conversation)
                        put("title", "Fixture import")
                        put("createdAt", 1000)
                        put("updatedAt", 2000)
                        put("messages", KuanJson.parseToJsonElement("""[
                            {"id":"m1","role":"user","content":"Retain the code","createdAt":1000,
                              "attachments":[{"assetId":"a1","name":"source.py","type":"text/x-python"}]},
                            {"id":"m2","role":"assistant","content":${JsonPrimitive(finalReply)},"createdAt":2000}
                        ]"""))
                    })
                })
                put("assets", KuanJson.parseToJsonElement(
                    """[{"assetId":"a1","path":"assets/a1","name":"source.py","type":"text/x-python","size":${original.size}}]""",
                ))
            }
            ZipOutputStream(path.outputStream()).use { zip ->
                zip.putNextEntry(ZipEntry("manifest.json"))
                zip.write(manifest.toString().encodeToByteArray())
                zip.closeEntry()
                zip.putNextEntry(ZipEntry("assets/a1"))
                zip.write(original)
                zip.closeEntry()
            }
        }
    }
}
