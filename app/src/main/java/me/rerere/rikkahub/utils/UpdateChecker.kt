package me.rerere.rikkahub.utils

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import java.io.File
import java.io.IOException
import java.security.MessageDigest
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import me.rerere.common.http.await
import me.rerere.rikkahub.AppScope
import me.rerere.rikkahub.BuildConfig
import me.rerere.rikkahub.data.kuan.KuanApi
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request

class UpdateChecker(
    private val appScope: AppScope,
) {
    private val client: OkHttpClient = KuanApi.privateClient()
    private val json = Json { ignoreUnknownKeys = true }
    private val manifestUrl = BuildConfig.KUAN_UPDATE_MANIFEST.toHttpUrlOrNull()
    val configured = !BuildConfig.IS_PLAY_STORE && manifestUrl != null
    private val state = MutableStateFlow<UiState<UpdateInfo>>(UiState.Loading)
    val updateState = state.asStateFlow()
    private val downloadState = MutableStateFlow<DownloadState>(DownloadState.Idle)
    val updates = downloadState.asStateFlow()
    private var checking: Job? = null
    private var installing: Job? = null

    init { refresh() }

    @Synchronized
    fun refresh() {
        if (!configured || checking?.isActive == true) return
        checking = appScope.launch(Dispatchers.IO) {
            state.value = UiState.Loading
            try {
                val url = checkNotNull(manifestUrl)
                val release = client.newCall(Request.Builder().url(url).build()).await().use {
                    if (!it.isSuccessful || it.body.source().request(65_537)) throw IOException("Update manifest unavailable")
                    json.decodeFromString<UpdateInfo>(it.body.source().readUtf8())
                }
                if (release.packageName != BuildConfig.APPLICATION_ID || release.versionCode <= 0 ||
                    release.version.isBlank() || release.downloads.any { !it.validFor(url) }
                ) throw IOException("Update manifest does not match this installation")
                state.value = UiState.Success(release.copy(
                    downloads = release.downloads.filter { it.abi == "universal" || it.abi in Build.SUPPORTED_ABIS },
                ))
            } catch (error: CancellationException) {
                throw error
            } catch (_: Exception) {
                state.value = UiState.Error(IOException("Could not verify the update manifest"))
            }
        }
    }

    @Synchronized
    fun downloadUpdate(context: Context, download: UpdateDownload) {
        val release = (state.value as? UiState.Success)?.data ?: return
        val url = manifestUrl ?: return
        if (!configured || installing?.isActive == true || download !in release.downloads ||
            !download.validFor(url) || release.versionCode <= BuildConfig.VERSION_CODE.toLong()
        ) return
        val ctx = context.applicationContext
        if (!ctx.packageManager.canRequestPackageInstalls()) {
            runCatching {
                ctx.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${ctx.packageName}"))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            }
            downloadState.value = DownloadState.PermissionNeeded
            return
        }
        installing = appScope.launch(Dispatchers.IO) {
            downloadState.value = DownloadState.Downloading(0f)
            val directory = File(ctx.cacheDir, "verified-updates")
            directory.mkdirs()
            var staged: File? = null
            try {
                val file = File.createTempFile("kuan-", ".apk", directory).also { staged = it }
                val digest = MessageDigest.getInstance("SHA-256")
                val expected = download.bytes
                var read = 0L
                client.newCall(Request.Builder().url(download.url).build()).await().use { response ->
                    if (!response.isSuccessful) throw IOException("APK download failed")
                    val declared = response.body.contentLength()
                    if (declared >= 0 && declared != expected) throw IOException("APK size does not match manifest")
                    response.body.byteStream().use { input ->
                        file.outputStream().use { output ->
                            val buffer = ByteArray(65536)
                            while (true) {
                                val count = input.read(buffer)
                                if (count < 0) break
                                read += count
                                if (read > expected) throw IOException("APK exceeds declared size")
                                digest.update(buffer, 0, count)
                                output.write(buffer, 0, count)
                                downloadState.value = DownloadState.Downloading(read.toFloat() / expected)
                            }
                        }
                    }
                }
                val hash = digest.digest().joinToString("") { "%02x".format(it) }
                if (read != expected || hash != download.sha256) throw IOException("APK checksum mismatch")
                verifyArchive(ctx, file, release.versionCode)
                val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.fileprovider", file)
                withContext(Dispatchers.Main) {
                    ctx.startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive")
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION))
                    downloadState.value = DownloadState.Ready
                }
            } catch (error: CancellationException) {
                staged?.delete()
                throw error
            } catch (_: Exception) {
                staged?.delete()
                downloadState.value = DownloadState.Failed
            }
        }
    }

    @Suppress("DEPRECATION")
    private fun verifyArchive(context: Context, apk: File, expectedCode: Long) {
        val pm = context.packageManager
        val flag = if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES
        val installed = pm.getPackageInfo(context.packageName, flag)
        val candidate = pm.getPackageArchiveInfo(apk.absolutePath, flag) ?: throw IOException("Invalid APK")
        fun version(info: PackageInfo) = if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()
        fun signatures(info: PackageInfo) = (if (Build.VERSION.SDK_INT >= 28) info.signingInfo?.apkContentsSigners
            else info.signatures)?.toSet().orEmpty()
        if (candidate.packageName != installed.packageName || version(candidate) != expectedCode ||
            version(candidate) <= version(installed) || signatures(installed).isEmpty() ||
            signatures(installed) != signatures(candidate)
        ) throw IOException("APK package or signing certificate does not match")
    }
}

sealed interface DownloadState {
    data object Idle : DownloadState
    data object PermissionNeeded : DownloadState
    data class Downloading(val progress: Float) : DownloadState
    data object Ready : DownloadState
    data object Failed : DownloadState
}

@Serializable
data class UpdateDownload(
    val name: String,
    val url: String,
    val size: String = "",
    val bytes: Long = 0,
    val sha256: String = "",
    val abi: String = "universal",
) {
    internal fun validFor(manifest: HttpUrl): Boolean {
        val apk = url.toHttpUrlOrNull() ?: return false
        return apk.isHttps && apk.host == manifest.host && apk.port == manifest.port &&
            apk.username.isEmpty() && apk.password.isEmpty() && apk.fragment == null &&
            apk.encodedPath.endsWith(".apk") && name.endsWith(".apk") &&
            sha256.matches(Regex("[a-f0-9]{64}")) && bytes in 1L..180_000_000L &&
            abi in setOf("universal", "arm64-v8a", "x86_64")
    }
}

@Serializable
data class UpdateInfo(
    val version: String,
    val publishedAt: String = "",
    val changelog: String = "",
    val downloads: List<UpdateDownload>,
    val packageName: String = "",
    val versionCode: Long = 0,
)

/**
 * 版本号值类，封装版本号字符串并提供比较功能
 *
 * 支持完整的 SemVer 规范：MAJOR.MINOR.PATCH[-prerelease][+build]
 * - 预发布版本优先级低于正式版：1.0.0-alpha < 1.0.0
 * - 预发布标识符按段逐个比较：数字按数值比较，字符串按字典序比较
 * - 预发布标识符优先级：alpha < beta < rc（通过字典序自然满足）
 * - build metadata（+号后面的部分）不影响优先级比较
 */
@JvmInline
value class Version(val value: String) : Comparable<Version> {

    private fun parse(): ParsedVersion {
        // 去掉 build metadata（+号后面的部分）
        val withoutBuild = value.split("+").first()
        // 分离主版本号和预发布标识符
        val hyphenIndex = withoutBuild.indexOf('-')
        val (coreStr, prereleaseStr) = if (hyphenIndex >= 0) {
            withoutBuild.substring(0, hyphenIndex) to withoutBuild.substring(hyphenIndex + 1)
        } else {
            withoutBuild to null
        }
        val core = coreStr.split(".").map { it.toIntOrNull() ?: 0 }
        val prerelease = prereleaseStr?.split(".")
        return ParsedVersion(core, prerelease)
    }

    override fun compareTo(other: Version): Int {
        val a = this.parse()
        val b = other.parse()

        // 先比较主版本号
        val maxLen = maxOf(a.core.size, b.core.size)
        for (i in 0 until maxLen) {
            val ap = if (i < a.core.size) a.core[i] else 0
            val bp = if (i < b.core.size) b.core[i] else 0
            if (ap != bp) return ap.compareTo(bp)
        }

        // 主版本号相同时比较预发布标识符
        // 有预发布标识符的版本优先级低于没有的：1.0.0-alpha < 1.0.0
        return when {
            a.prerelease == null && b.prerelease == null -> 0
            a.prerelease != null && b.prerelease == null -> -1
            a.prerelease == null && b.prerelease != null -> 1
            else -> comparePrerelease(a.prerelease!!, b.prerelease!!)
        }
    }

    companion object {
        fun compare(version1: String, version2: String): Int {
            return Version(version1).compareTo(Version(version2))
        }

        private fun comparePrerelease(a: List<String>, b: List<String>): Int {
            val maxLen = maxOf(a.size, b.size)
            for (i in 0 until maxLen) {
                // 字段少的优先级更低：1.0.0-alpha < 1.0.0-alpha.1
                if (i >= a.size) return -1
                if (i >= b.size) return 1

                val aNum = a[i].toIntOrNull()
                val bNum = b[i].toIntOrNull()

                val cmp = when {
                    // 都是字：按数值比较
                    aNum != null && bNum != null -> aNum.compareTo(bNum)
                    // 数字优先级低于字符串
                    aNum != null -> -1
                    bNum != null -> 1
                    // 都是字符串：按字典序比较
                    else -> a[i].compareTo(b[i])
                }
                if (cmp != 0) return cmp
            }
            return 0
        }
    }
}

private data class ParsedVersion(
    val core: List<Int>,
    val prerelease: List<String>?,
)

// 扩展操作符函数，使比较更直观
operator fun String.compareTo(other: Version): Int = Version(this).compareTo(other)
operator fun Version.compareTo(other: String): Int = this.compareTo(Version(other))
