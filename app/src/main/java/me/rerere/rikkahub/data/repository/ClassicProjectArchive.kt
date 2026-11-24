package me.rerere.rikkahub.data.repository

import java.io.File
import java.io.InputStream
import java.util.zip.ZipInputStream
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import me.rerere.rikkahub.data.kuan.copyKuanBytes

private const val MAX_PROJECT_FILES = 20_000
private const val MAX_PROJECT_FILE = 32_000_000L
private const val MAX_PROJECT_BYTES = 512_000_000L

/** The classic export is a flat ZIP of project files, not an execution-state backup. */
internal suspend fun extractClassicProject(input: InputStream, root: File): Int {
    val prefix = root.canonicalFile.toPath()
    val seen = HashSet<String>()
    var files = 0
    var bytes = 0L
    ZipInputStream(input).use { zip ->
        while (true) {
            currentCoroutineContext().ensureActive()
            val entry = zip.nextEntry ?: break
            val name = entry.name.removeSuffix("/")
            val segments = name.split('/')
            require(name.length in 1..1200 && segments.size <= 30 && '\\' !in name && ':' !in name &&
                segments.none { it.isBlank() || it == "." || it == ".." || it.any(Char::isISOControl) } &&
                seen.add(name) && seen.size <= MAX_PROJECT_FILES
            ) { "Invalid or duplicate project path" }
            val file = File(root, name).canonicalFile
            require(file.toPath().startsWith(prefix) && file.toPath() != prefix) { "Project path is outside the new workspace" }
            if (entry.isDirectory) {
                require(file.isDirectory || file.mkdirs()) { "Cannot create a project directory" }
                require(zip.read() == -1) { "Unexpected project directory data" }
            } else {
                require(!file.exists()) { "Project entry conflicts with an existing entry" }
                val parent = requireNotNull(file.parentFile)
                require(parent.isDirectory || parent.mkdirs()) { "Cannot create a project directory" }
                val limit = minOf(MAX_PROJECT_FILE, MAX_PROJECT_BYTES - bytes)
                require(entry.size < 0 || entry.size <= limit) { "Project archive exceeds its file or total limit" }
                bytes += file.outputStream().use { copyKuanBytes(zip, it, limit) }
                files++
            }
            zip.closeEntry()
        }
    }
    require(files > 0) { "No files in the classic project archive" }
    return files
}
