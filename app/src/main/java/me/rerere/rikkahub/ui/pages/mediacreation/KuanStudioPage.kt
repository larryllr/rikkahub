package me.rerere.rikkahub.ui.pages.mediacreation

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.webkit.WebMessage
import android.webkit.WebMessagePort
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.io.FilterInputStream
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.hugeicons.HugeIcons
import me.rerere.hugeicons.stroke.MoreVertical
import me.rerere.rikkahub.R
import me.rerere.rikkahub.Screen
import me.rerere.rikkahub.data.kuan.KuanApi
import me.rerere.rikkahub.data.kuan.KuanCatalog
import me.rerere.rikkahub.data.kuan.KuanJson
import me.rerere.rikkahub.data.kuan.KuanSession
import me.rerere.rikkahub.data.kuan.KuanStudio
import me.rerere.rikkahub.data.kuan.STUDIO_ASSETS
import me.rerere.rikkahub.data.kuan.STUDIO_LOCAL_ORIGIN
import me.rerere.rikkahub.data.kuan.STUDIO_LIBRARY
import me.rerere.rikkahub.data.kuan.STUDIO_PAGE
import me.rerere.rikkahub.data.kuan.STUDIO_SCRIPT
import me.rerere.rikkahub.data.kuan.STUDIO_STYLE
import me.rerere.rikkahub.data.kuan.kuanUiMessage
import me.rerere.rikkahub.data.kuan.long
import me.rerere.rikkahub.data.kuan.obj
import me.rerere.rikkahub.data.kuan.string
import me.rerere.rikkahub.data.kuan.studioSourceLink
import me.rerere.rikkahub.ui.components.nav.BackButton
import me.rerere.rikkahub.ui.context.LocalNavController
import me.rerere.rikkahub.ui.theme.CustomColors
import org.koin.compose.koinInject

private const val MAX_MESSAGE_CHARS = 90 * 1024 * 1024

@Composable
internal fun KuanStudioPage(
    session: KuanSession = koinInject(),
    catalog: KuanCatalog = koinInject(),
    api: KuanApi = koinInject(),
) {
    val nav = LocalNavController.current
    val context = LocalContext.current
    val auth by session.state.collectAsStateWithLifecycle()
    val directory by catalog.state.collectAsStateWithLifecycle()
    val profile = auth.profile
    val scope = rememberCoroutineScope()
    var selected by remember(profile?.scope) { mutableStateOf<Long?>(null) }
    var menu by remember { mutableStateOf(false) }
    var revision by remember { mutableStateOf(0) }
    val group = directory.groups.firstOrNull { it.id == selected }
        ?: directory.groups.firstOrNull { it.id == directory.groupId && it.platform.equals("openai", true) }
        ?: directory.groups.firstOrNull { it.platform.equals("openai", true) }
        ?: directory.groups.firstOrNull { it.id == directory.groupId }
        ?: directory.groups.firstOrNull()
    val openMedia = { nav.navigate(Screen.MediaCreationSessions) }
    LaunchedEffect(profile?.scope) {
        if (profile != null && directory.groups.isEmpty()) catalog.refresh()
    }
    Scaffold(
        containerColor = CustomColors.topBarColors.containerColor,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.kuan_studio_title), maxLines = 1, overflow = TextOverflow.Ellipsis) },
                navigationIcon = { BackButton() },
                colors = CustomColors.topBarColors,
                actions = {
                    if (profile != null && group != null) {
                        TextButton(onClick = { menu = true }) {
                            Text(group.name, modifier = Modifier.widthIn(max = 120.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    } else {
                        IconButton(onClick = { menu = true }) {
                            Icon(HugeIcons.MoreVertical, contentDescription = stringResource(R.string.kuan_studio_options))
                        }
                    }
                    DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                        if (profile != null) {
                            directory.groups.forEach { item ->
                                DropdownMenuItem(text = { Text(item.name) }, onClick = { selected = item.id; menu = false })
                            }
                        }
                        DropdownMenuItem(text = { Text(stringResource(R.string.media_creation_title)) }, onClick = {
                            menu = false
                            openMedia()
                        })
                    }
                },
            )
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when {
                auth.loading || profile != null && group == null && directory.busy ->
                    CircularProgressIndicator(Modifier.align(Alignment.Center))
                profile == null -> Column(
                    modifier = Modifier.align(Alignment.Center).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Button(onClick = { nav.navigate(Screen.KuanAccount) }) { Text(stringResource(R.string.kuan_sign_in_action)) }
                    TextButton(onClick = openMedia) { Text(stringResource(R.string.media_creation_title)) }
                }
                group == null -> Column(
                    modifier = Modifier.align(Alignment.Center).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(directory.error ?: stringResource(R.string.kuan_no_group))
                    Button(onClick = { scope.launch { catalog.refresh(force = true) } }) { Text(stringResource(R.string.kuan_refresh)) }
                }
                else -> key(profile.scope, auth.epoch, group.id, revision) {
                    val studio = remember { KuanStudio(context, session, catalog, api, profile.scope, auth.epoch, group) }
                    StudioWebView(
                        studio = studio,
                        owner = profile.scope,
                        back = { nav.popBackStack() },
                        openMedia = openMedia,
                        reload = { revision += 1 },
                    )
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
internal fun StudioWebView(
    studio: KuanStudio,
    owner: String,
    back: () -> Unit,
    openMedia: () -> Unit,
    reload: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var loadFailed by remember { mutableStateOf(false) }
    var picker by remember { mutableStateOf<CancellableContinuation<List<Uri>>?>(null) }
    var document by remember { mutableStateOf<CancellableContinuation<Uri?>?>(null) }
    val references = remember { StudioReferences(context.contentResolver, studio) }
    val chooser = rememberLauncherForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        val target = picker
        picker = null
        if (target?.isActive == true) target.resume(uris.filter { it.scheme == "content" })
    }
    val documentPicker = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val target = document
        document = null
        if (target?.isActive == true) {
            target.resume(result.data?.data?.takeIf { result.resultCode == Activity.RESULT_OK && it.scheme == "content" })
        }
    }
    val runtime = remember {
        val exports = StudioExports(context, studio, owner)
        StudioRuntime(
            studio, scope, back, openMedia,
            pick = {
                references.issue(suspendCancellableCoroutine { target ->
                    check(picker == null) { "The system image picker is already open" }
                    picker = target
                    try {
                        chooser.launch("image/*")
                    } catch (error: Exception) {
                        picker = null
                        target.resumeWithException(error)
                    }
                })
            },
            source = { value ->
                check(studioSourceLink(value))
                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(value)))
            },
            save = { url, fallback, name ->
                exports.download(url, fallback, name) { filename, type ->
                    suspendCancellableCoroutine { target ->
                        document = target
                        try {
                            documentPicker.launch(Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                                this.type = type
                                addCategory(Intent.CATEGORY_OPENABLE)
                                putExtra(Intent.EXTRA_TITLE, filename)
                            })
                        } catch (error: Exception) {
                            document = null
                            target.resumeWithException(error)
                        }
                    }
                }
            },
        )
    }
    if (!loadFailed) AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = false
                settings.allowContentAccess = false
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                settings.setSupportMultipleWindows(false)
                settings.javaScriptCanOpenWindowsAutomatically = false
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                        request.url.toString() != STUDIO_PAGE

                    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean =
                        url != STUDIO_PAGE

                    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                        studioResponse(view.context, request, studio, references)

                    override fun onPageFinished(view: WebView, url: String) {
                        if (url == STUDIO_PAGE) runtime.connect(view)
                    }

                    override fun onRenderProcessGone(view: WebView, detail: android.webkit.RenderProcessGoneDetail): Boolean {
                        loadFailed = true
                        return true
                    }
                }
                loadUrl(STUDIO_PAGE)
            }
        },
        onRelease = { view ->
            picker?.cancel()
            picker = null
            references.clear()
            document?.cancel()
            document = null
            runtime.close()
            view.destroy()
        },
    )
    if (loadFailed) {
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text(stringResource(R.string.kuan_studio_load_failed))
            Button(onClick = reload) { Text(stringResource(R.string.kuan_refresh)) }
        }
    }
}

private class StudioRuntime(
    private val studio: KuanStudio,
    private val scope: CoroutineScope,
    private val back: () -> Unit,
    private val openMedia: () -> Unit,
    private val pick: suspend () -> JsonObject,
    private val source: (String) -> Unit,
    private val save: suspend (String, String?, String?) -> JsonObject,
) {
    private val jobs = mutableMapOf<Long, Job>()
    private var port: WebMessagePort? = null

    fun connect(view: WebView) {
        if (port != null) return
        val (local, page) = view.createWebMessageChannel()
        port = local
        local.setWebMessageCallback(object : WebMessagePort.WebMessageCallback() {
            override fun onMessage(receiver: WebMessagePort, message: WebMessage) {
                val raw = message.data ?: return
                if (receiver != port) return
                if (raw.length > MAX_MESSAGE_CHARS) return
                val request = runCatching { KuanJson.parseToJsonElement(raw) as? JsonObject }.getOrNull() ?: return
                val id = request.long("id")?.takeIf { it > 0 } ?: return
                val action = request.string("action")
                if (action == "cancel") {
                    jobs[id]?.cancel()
                    return
                }
                if (id in jobs || jobs.size >= 8) {
                    answer(id, false, error = "Too many pending Image Studio actions")
                    return
                }
                val payload = request.obj("payload") ?: JsonObject(emptyMap())
                val job = scope.launch(start = CoroutineStart.LAZY) {
                    try {
                        val result = when (action) {
                            "back" -> { back(); null }
                            "media" -> { openMedia(); null }
                            "source" -> { source(address(payload)); null }
                            "pick" -> pick()
                            "initialize" -> studio.initialize()
                            "profile" -> studio.profile()
                            "generate" -> studio.generate(payload)
                            "download" -> save(address(payload), payload.string("fallback")?.takeIf { it.length <= 8192 }, payload.string("name"))
                            else -> error("Unsupported Image Studio action")
                        }
                        answer(id, true, result)
                    } catch (error: CancellationException) {
                        throw error
                    } catch (error: Exception) {
                        answer(id, false, error = error.kuanUiMessage())
                    } finally {
                        jobs.remove(id)
                    }
                }
                jobs[id] = job
                job.start()
            }
        })
        view.postWebMessage(WebMessage("kuan-studio-connect", arrayOf(page)), Uri.parse(STUDIO_LOCAL_ORIGIN))
    }

    private fun address(payload: JsonObject): String =
        requireNotNull(payload.string("url")?.takeIf { it.length in 1..8192 })

    private fun answer(id: Long, ok: Boolean, result: JsonObject? = null, error: String? = null) {
        val body = buildJsonObject {
            put("id", id)
            put("ok", ok)
            if (result != null) put("result", result)
            if (error != null) put("error", error)
        }
        runCatching { port?.postMessage(WebMessage(body.toString())) }
    }

    fun close() {
        jobs.values.toList().forEach { it.cancel() }
        port?.close()
        port = null
    }
}

private fun studioResponse(
    context: android.content.Context,
    request: WebResourceRequest,
    studio: KuanStudio,
    references: StudioReferences,
): WebResourceResponse {
    val uri = request.url
    if (request.method != "GET" || uri.scheme != "https" || uri.port !in listOf(-1, 443) || uri.userInfo != null) {
        return missingStudioResource()
    }
    if (uri.host == "raw.githubusercontent.com" && !request.isForMainFrame) return publicStudioImage(studio, uri)
    if (uri.host != "appassets.androidplatform.net" || uri.fragment != null || uri.query != null) return missingStudioResource()
    val path = uri.encodedPath.orEmpty()
    val mime = when {
        path.endsWith(".js") -> "application/javascript"
        path.endsWith(".css") -> "text/css"
        path.endsWith(".json") -> "application/json"
        path.endsWith(".png") -> "image/png"
        path.endsWith(".webp") -> "image/webp"
        path.endsWith(".gif") -> "image/gif"
        path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
        path.endsWith(".txt") || path.endsWith(".md") -> "text/plain"
        path.endsWith(".zip") -> "application/zip"
        else -> "text/html"
    }
    return try {
        when (path) {
            "/kuan-studio/" -> if (request.isForMainFrame) {
                WebResourceResponse(mime, "UTF-8", context.assets.open("kuan-studio/index.html"))
            } else missingStudioResource()
            "/kuan-studio/host.js", "/kuan-studio/$STUDIO_SCRIPT", "/kuan-studio/$STUDIO_STYLE" ->
                WebResourceResponse(mime, "UTF-8", context.assets.open("kuan-studio/" + path.substringAfterLast('/')))
            "/logo.png" -> WebResourceResponse(mime, null, context.resources.openRawResource(R.drawable.kuan_logo))
            else -> when {
                path.startsWith("/kuan-studio/result/") -> {
                    val result = studio.result(path.removePrefix("/kuan-studio/result/"))
                    if (result == null) missingStudioResource() else WebResourceResponse(result.mime, null, 200, "OK",
                        mapOf("Cache-Control" to "no-store"), result.file.inputStream())
                }
                path.startsWith("/kuan-studio/reference/") ->
                    references.open(path.removePrefix("/kuan-studio/reference/")) ?: missingStudioResource()
                path.startsWith(STUDIO_ASSETS) -> {
                    val name = path.removePrefix(STUDIO_ASSETS)
                    if (name in STUDIO_LIBRARY) WebResourceResponse(mime, if (mime == "application/zip") null else "UTF-8",
                        context.assets.open("kuan-studio/library/$name"))
                    else if (!request.isForMainFrame) publicStudioImage(studio, uri)
                    else missingStudioResource()
                }
                else -> missingStudioResource()
            }
        }
    } catch (_: Exception) {
        missingStudioResource()
    }
}

private fun publicStudioImage(studio: KuanStudio, uri: Uri): WebResourceResponse = try {
    val response = studio.publicAsset(uri.toString())
    if (response == null) missingStudioResource()
    else {
        val stream = object : FilterInputStream(response.body.byteStream()) {
            override fun close() = response.close()
        }
        WebResourceResponse(requireNotNull(response.body.contentType()).let { "${it.type}/${it.subtype}" }, null,
            200, "OK", mapOf("Cache-Control" to "public, max-age=86400"), stream)
    }
} catch (_: Exception) {
    missingStudioResource()
}

private fun missingStudioResource() =
    WebResourceResponse("text/plain", "UTF-8", 404, "Not found", emptyMap(), "Not found".byteInputStream())
