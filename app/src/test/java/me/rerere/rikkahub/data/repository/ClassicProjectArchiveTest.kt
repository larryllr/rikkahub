package me.rerere.rikkahub.data.repository

import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class ClassicProjectArchiveTest {
    @get:Rule val temporary = TemporaryFolder()

    @Test
    fun extractsNestedAndBinaryFilesWithoutRunningAnything() = runBlocking {
        val root = temporary.newFolder("workspace")
        val binary = byteArrayOf(1, 0, -1, 5)
        val text = "print('data')".encodeToByteArray()
        val input = zipped(mapOf("src/main.py" to text, "assets/raw.bin" to binary))
        assertEquals(2, extractClassicProject(input, root))
        assertArrayEquals(text, root.resolve("src/main.py").readBytes())
        assertArrayEquals(binary, root.resolve("assets/raw.bin").readBytes())
    }

    @Test
    fun rejectsParentPathsAndNeverWritesOutsideTheWorkspace() = runBlocking {
        val root = temporary.newFolder("workspace")
        val input = zipped(mapOf("../outside.py" to byteArrayOf(1)))
        assertNotNull(runCatching { extractClassicProject(input, root) }.exceptionOrNull())
        assertFalse(temporary.root.resolve("outside.py").exists())
    }

    private fun zipped(files: Map<String, ByteArray>) = ByteArrayOutputStream().let { bytes ->
        ZipOutputStream(bytes).use { zip ->
            for ((name, data) in files) {
                zip.putNextEntry(ZipEntry(name))
                zip.write(data)
                zip.closeEntry()
            }
        }
        bytes.toByteArray().inputStream()
    }
}
