package me.rerere.rikkahub.data.kuan

import android.app.Activity
import android.app.Instrumentation
import android.content.ContentUris
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Bitmap
import android.os.SystemClock
import android.provider.MediaStore
import android.util.Base64
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.core.content.FileProvider
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.random.Random
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import me.rerere.rikkahub.AppScope
import me.rerere.rikkahub.data.datastore.SettingsStore
import me.rerere.rikkahub.ui.pages.mediacreation.StudioWebView
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okio.Buffer
import org.json.JSONObject
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class KuanStudioTest {
    @get:Rule val compose = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun workbenchLoadsFallbackCasesAndGeneratesEditsCancelsAndExports() {
        val activity = compose.activity
        val slot = File.createTempFile("studio-test", ".tmp", activity.cacheDir)
        check(slot.delete() && slot.mkdir())
        val isolated = object : ContextWrapper(activity) {
            override fun getFilesDir() = slot
            override fun getNoBackupFilesDir() = slot
            override fun getApplicationContext(): Context = this
        }
        val scope = AppScope()
        val fixture = Fixture()
        val api = KuanApi(KuanApi.privateClient().newBuilder().addInterceptor(fixture).build())
        val session = KuanSession(isolated, scope, api)
        val settings = SettingsStore(
            PreferenceDataStoreFactory.create(scope = scope) { File(slot, "test.preferences_pb") }, scope,
        )
        val catalog = KuanCatalog(scope, session, api, settings)
        val group = KuanGroup(17, "Studio fixture", "openai")
        val profile = runBlocking {
            withTimeout(15000) {
                session.state.first { !it.loading }
                session.signIn("studio@example.invalid", "fixture")
                requireNotNull(session.state.value.profile)
            }
        }
        val studio = KuanStudio(isolated, session, catalog, api, profile.scope, session.state.value.epoch, group)
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val exported = mutableListOf<android.net.Uri>()
        try {
            compose.setContent { StudioWebView(studio, profile.scope, {}, {}) }
            eventually("bundled case data and pinned fallback image") {
                js("Boolean(document.querySelector('.kw-card-image img')?.naturalWidth)") == "true"
            }
            assertTrue(fixture.fallbacks.isNotEmpty())
            eventually("dynamic image model") {
                js("Boolean(document.querySelector('option[value=fixture-paint]'))") == "true"
            }
            assertEquals("false", js("Boolean(document.querySelector('option[value=fixture-admin]'))"))
            assertEquals("false", js("Boolean(document.querySelector('input[type=password]'))"))
            js("document.querySelector('.kw-card-image').click()")
            eventually("case details show without GitHub links") {
                js("Boolean(document.querySelector('.kw-inspector') && !document.querySelector('.kw-inspector a[href]'))") == "true"
            }
            js("document.querySelector('.kw-inspector header button').click()")

            js("document.querySelector('.kw-mobile-composer').click()")
            prompt("First test image")
            js("document.querySelector('.kw-composer .kw-generate').click()")
            eventually("generated result with original image") {
                js("Boolean(document.querySelector('.kw-task.completed img')?.naturalWidth)") == "true"
            }
            assertEquals(listOf("/v1/images/generations"), fixture.waterfall.toList())

            val firstUrl = js("document.querySelector('.kw-task.completed img').src").removeSurrounding("\"")
            assertTrue(firstUrl.startsWith(STUDIO_PAGE + "result/"))
            js("document.querySelector('.kw-task.completed figcaption button').click()")
            eventually("original published to gallery") {
                val uri = galleryFixture(activity, fixture)
                if (uri == null) false else {
                    exported += uri
                    assertArrayEquals(fixture.png, activity.contentResolver.openInputStream(uri)!!.use { it.readBytes() })
                    true
                }
            }

            val uri = FileProvider.getUriForFile(activity, "${activity.packageName}.fileprovider",
                File(slot, "reference.png").apply { writeBytes(fixture.png) })
            val picker = instrumentation.addMonitor(documentFilter(Intent.ACTION_GET_CONTENT, "image/*"),
                Instrumentation.ActivityResult(Activity.RESULT_OK,
                    Intent().setData(uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)), true)
            try {
                js("document.querySelector('.kw-ref-add').click()")
                eventually("system file chooser returned a reference") {
                    js("Boolean(document.querySelector('.kw-refs img')?.naturalWidth)") == "true"
                }
                assertEquals(1, picker.hits)
            } finally {
                instrumentation.removeMonitor(picker)
            }
            prompt("Edit reference")
            js("document.querySelector('.kw-composer .kw-generate').click()")
            eventually("edited image") {
                js("""Array.from(document.querySelectorAll('.kw-task.completed summary')).some(e=>e.textContent==='Edit reference')""") == "true"
            }
            assertEquals("/v1/images/edits", fixture.waterfall.last())

            prompt("Stop this image")
            js("document.querySelector('.kw-composer .kw-generate').click()")
            eventually("generating indicator") { js("Boolean(document.querySelector('.kw-generating'))") == "true" }
            js("document.querySelector('.kw-task.generating header button').click()")
            eventually("cancelled task") { js("Boolean(document.querySelector('.kw-task.cancelled'))") == "true" }

            prompt("Show upstream failure")
            js("document.querySelector('.kw-composer .kw-generate').click()")
            eventually("upstream error shown once, without credentials") {
                js("document.querySelector('.kw-task.failed .kw-field-error')?.textContent?.includes('[redacted]')") == "true"
            }
            assertFalse(js("document.body.textContent.includes('studio-fixture-key')") == "true")

            js("document.querySelector('.kw-header nav button:nth-child(3)').click()")
            eventually("comparison gallery rendered without outbound links") {
                js("Boolean(document.querySelector('.kw-comparison select') && !document.querySelector('.kw-comparison a[href]'))") == "true"
            }
            js("document.querySelector('.kw-header nav button:last-child').click()")
            val target = File(slot, "style-library.zip").apply { createNewFile() }
            val targetUri = FileProvider.getUriForFile(activity, "${activity.packageName}.fileprovider", target)
            val writer = instrumentation.addMonitor(documentFilter(Intent.ACTION_CREATE_DOCUMENT, "application/zip"),
                Instrumentation.ActivityResult(Activity.RESULT_OK,
                    Intent().setData(targetUri).addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)), true)
            try {
                eventually("packaged style guide appeared") { js("Boolean(document.querySelector('.kw-guide .kw-markdown h2'))") == "true" }
                assertEquals("0", js("document.querySelectorAll('.kw-guide a[href]').length"))
                js("document.querySelector('.kw-guide-actions button:nth-child(2)').click()")
                eventually("ZIP saved through system document creation") { target.length() > 2000000L }
                assertEquals(1, writer.hits)
                assertArrayEquals(activity.assets.open("kuan-studio/library/style-library.zip").use { it.readBytes() }, target.readBytes())
            } finally {
                instrumentation.removeMonitor(writer)
            }
            val name = firstUrl.substringAfterLast('/')
            runBlocking { session.signOut() }
            assertNull(studio.result(name))
        } catch (failure: AssertionError) {
            val states = js("Array.from(document.querySelectorAll('.kw-task')).map(e=>[e.className,e.querySelector('.kw-field-error')?.textContent||''])")
            throw AssertionError("${failure.message}; fixtures=${fixture.waterfall}, task states=$states", failure)
        } finally {
            exported.forEach { activity.contentResolver.delete(it, null, null) }
            activity.deleteSharedPreferences("kuan-studio-exports-${profile.scope}")
            scope.cancel()
            slot.deleteRecursively()
        }
    }

    @Test
    fun publicArtworkIsRestrictedToThePinnedGallery() {
        val prefix = "https://raw.githubusercontent.com/$STUDIO_SOURCE"
        assertNotNull(studioPublicImage("$prefix/$STUDIO_REVISION/data/images/case544.jpg"))
        assertNull(studioPublicImage("$prefix/main/data/images/case544.jpg"))
        assertNull(studioPublicImage("$prefix/$STUDIO_REVISION/package.json"))
        assertNull(studioPublicImage("$prefix/$STUDIO_REVISION/data/images/case544.jpg?extra=true"))
        assertNull(studioPublicImage("https://unrelated.example${STUDIO_ASSETS}images/case544.jpg"))
    }

    private fun galleryFixture(context: Context, fixture: Fixture): android.net.Uri? =
        context.contentResolver.query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            arrayOf(MediaStore.Images.Media._ID),
            "${MediaStore.Images.Media.SIZE} = ? AND ${MediaStore.Images.Media.DISPLAY_NAME} LIKE ? AND ${MediaStore.Images.Media.IS_PENDING} = 0",
            arrayOf(fixture.png.size.toString(), "kuanapi-%-1.png"),
            "${MediaStore.Images.Media._ID} DESC",
        )?.use { rows ->
            if (rows.moveToFirst()) ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, rows.getLong(0)) else null
        }

    private fun documentFilter(action: String, mime: String) = IntentFilter(action).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        addDataType(mime)
    }

    private fun eventually(label: String, check: () -> Boolean) {
        val end = SystemClock.elapsedRealtime() + 18000
        while (!check()) {
            if (SystemClock.elapsedRealtime() >= end) throw AssertionError("Timed out: $label")
            SystemClock.sleep(130)
        }
    }

    private fun View.web(): WebView? {
        if (this is WebView) return this
        if (this is ViewGroup) for (index in 0 until childCount) getChildAt(index).web()?.let { return it }
        return null
    }

    private fun js(value: String): String {
        val done = CountDownLatch(1)
        var result = "null"
        compose.activityRule.scenario.onActivity { activity ->
            activity.window.decorView.web()?.evaluateJavascript(value) {
                result = it ?: "null"
                done.countDown()
            } ?: done.countDown()
        }
        check(done.await(5, TimeUnit.SECONDS)) { "WebView did not run JavaScript" }
        return result
    }

    private fun prompt(value: String) {
        js("""(() => {const el=document.querySelector('.kw-prompt');
           Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,${JSONObject.quote(value)});
           el.dispatchEvent(new Event('input',{bubbles:true}));})()""")
        eventually("prompt accepted") { js("document.querySelector('.kw-composer .kw-generate')?.disabled") == "false" }
    }

    private class Fixture : Interceptor {
        val waterfall = CopyOnWriteArrayList<String>()
        val fallbacks = CopyOnWriteArrayList<String>()
        private val owner = Random.nextLong(100_000_000, 2_000_000_000)
        val png = ByteArrayOutputStream().use { bytes ->
            Bitmap.createBitmap(71, 49, Bitmap.Config.ARGB_8888).apply {
                eraseColor(0xffc1436f.toInt())
                compress(Bitmap.CompressFormat.PNG, 100, bytes)
                recycle()
            }
            bytes.toByteArray()
        }

        private fun response(req: Request, code: Int, value: ByteArray, mime: String) = Response.Builder()
            .request(req).protocol(Protocol.HTTP_1_1).code(code).message("fixture")
            .body(value.toResponseBody(mime.toMediaType())).build()

        override fun intercept(chain: Interceptor.Chain): Response {
            val req = chain.request()
            val path = req.url.encodedPath
            val auth = req.header("Authorization")
            fun raw(value: String, code: Int = 200, mime: String = "application/json") =
                response(req, code, value.encodeToByteArray(), mime)
            fun ok(value: String) = raw("""{"code":0,"data":$value}""")
            return when {
                req.url.host == "raw.githubusercontent.com" -> {
                    check(auth == null && req.url.encodedPath.startsWith("/$STUDIO_SOURCE/$STUDIO_REVISION/data/images/"))
                    fallbacks += path
                    response(req, 200, png, "image/png")
                }
                path.startsWith(STUDIO_ASSETS) -> {
                    check(auth == null)
                    raw("<html>Not an image</html>", mime = "text/html")
                }
                path == "/api/v1/auth/login" -> ok("""{"access_token":"fixture-user","refresh_token":"fixture-refresh","expires_in":3600}""")
                path == "/api/v1/auth/me" -> {
                    check(auth == "Bearer fixture-user")
                    ok("""{"id":$owner,"role":"user","email":"studio@example.invalid","balance":12}""")
                }
                path == "/api/v1/auth/logout" -> ok("{}")
                path == "/api/v1/groups/chat" -> ok("""[{"id":17,"name":"Studio fixture","platform":"openai"}]""")
                path == "/api/v1/chat/api-key" -> ok("""{"group_id":17,"key":"studio-fixture-key","status":"active"}""")
                path == "/v1/models" -> {
                    check(auth == "Bearer studio-fixture-key" && req.url.queryParameter("kuan_chat") == "1")
                    raw("""{"data":[{"id":"fixture-paint","task":"image","supported_image_sizes":["1024x1024"]},
                        {"id":"fixture-admin","task":"image","kuan_admin_only":true},{"id":"fixture-chat"}]}""")
                }
                path.startsWith("/v1/images/") -> {
                    check(auth == "Bearer studio-fixture-key")
                    waterfall += path
                    val request = JSONObject(Buffer().also { req.body!!.writeTo(it) }.readUtf8())
                    val prompt = request.getString("prompt")
                    assertEquals("fixture-paint", request.getString("model"))
                    if (path.endsWith("edits")) {
                        val ref = request.getJSONArray("images").getJSONObject(0).getString("image_url")
                        assertArrayEquals(png, Base64.decode(ref.substringAfter(','), Base64.DEFAULT))
                    }
                    if (prompt == "Stop this image") {
                        repeat(70) { if (chain.call().isCanceled()) throw java.io.IOException("Cancelled"); Thread.sleep(40) }
                    }
                    if (prompt == "Show upstream failure") raw("""{"error":{"message":"Cannot generate with studio-fixture-key"}}""", 503)
                    else raw("""{"data":[{"b64_json":"${Base64.encodeToString(png, Base64.NO_WRAP)}"}]}""")
                }
                else -> raw("{}", 404)
            }
        }
    }
}
