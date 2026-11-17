package com.wynn.jurnalbintang

import com.wynn.jurnalbintang.data.*
import org.junit.Assert.*
import org.junit.Test

class BackupCodecTest {
    @Test fun roundTripKeepsAllWritingAndMetadata() {
        val note = Note(id="n", kind="checklist", title="日本語 & kopi", body="  spasi\nisi  ",
            items=listOf(CheckItem("i", "Beli ☕", true)), tags=listOf("pribadi"), folderId="f", pinned=true,
            favorite=true, archived=true, trashed=true, prompt="Kenapa?", mood="good", createdAt=100, updatedAt=200)
        val backup = Backup(listOf(note), listOf(Folder("f", "Kerja")))
        assertEquals(backup, BackupCodec.decode(BackupCodec.encode(backup)))
        assertTrue(BackupCodec.markdown(backup).contains("- [x] Beli ☕"))
    }
    @Test fun legacyWebBackupKeepsCollectionsReflectionsAndDraft() {
        val text = """{"app":"Aster Journal","schema":3,"data":{"notes":[{"id":"n","type":"note","title":"Lama","body":"isi","folderId":"sys-trash","createdAt":"2026-11-17T01:00:00.000Z"}],"folders":[{"id":"sys-trash","name":"Sampah","system":true},{"id":"f","name":"Pribadi"}],"reflections":[{"id":"r","prompt":"Syukur?","body":"keluarga","mood":"good","createdAt":"2026-11-16T01:00:00Z"}],"reflectionDraft":{"prompt":"Pelan?","body":"istirahat","mood":"okay","updatedAt":"2026-11-17T02:00:00Z"}}}"""
        val b = BackupCodec.decode(text)
        assertEquals(3,b.notes.size)
        assertTrue(b.notes.first().trashed)
        assertEquals(1,b.folders.size)
        assertEquals("good",b.notes[1].mood)
        assertEquals("istirahat",b.notes[2].body)
        assertEquals("reflection",b.notes[2].kind)
    }
    @Test fun rejectsMalformedUnsupportedAndDuplicateIdsBeforeImport() {
        for (bad in listOf("{}", "{broken", """{"app":"Other","schema":4,"data":{"notes":[],"folders":[]}}""",
            """{"app":"Aster Journal","schema":999,"data":{"notes":[],"folders":[]}}""",
            """{"app":"Aster Journal","schema":4,"data":{"notes":[{"id":"same"},{"id":"same"}],"folders":[]}}""",
            """{"app":"Aster Journal","schema":4,"data":{"notes":[{"id":"a","items":"bad"}],"folders":[]}}""")) {
            try { BackupCodec.decode(bad); fail("accepted invalid backup") } catch (_: IllegalArgumentException) { }
        }
    }
    @Test fun rejectsOversizedBackupAndInvalidImage() {
        try { BackupCodec.decode(" ".repeat(BackupCodec.MAX_BYTES+1)); fail() } catch (_: IllegalArgumentException) { }
        val text = """{"app":"Aster Journal","schema":4,"data":{"notes":[{"id":"a","image":"https://remote.invalid/tracking.png"}],"folders":[]}}"""
        try { BackupCodec.decode(text); fail() } catch (_: IllegalArgumentException) { }
    }
    @Test fun importedFolderCannotMasqueradeAsSystemCollection() {
        val text="""{"app":"Aster Journal","schema":4,"data":{"notes":[{"id":"n","folderId":"trash","body":"tetap aktif"}],"folders":[{"id":"trash","name":"Pribadi"}]}}"""
        val b=BackupCodec.decode(text)
        assertNotEquals("trash",b.folders.single().id)
        assertEquals(b.folders.single().id,b.notes.single().folderId)
        assertEquals(b.notes,filterNotes(b.notes,"",b.folders.single().id,"all",false))
    }
    @Test fun rejectsHugeDecodedPngJpegAndWebpBeforeDatabaseImport() {
        val png=ByteArray(33);byteArrayOf(0x89.toByte(),0x50,0x4e,0x47,13,10,26,10).copyInto(png)
        java.nio.ByteBuffer.wrap(png).putInt(16,10000).putInt(20,10000)
        val jpeg=byteArrayOf(0xff.toByte(),0xd8.toByte(),0xff.toByte(),0xc0.toByte(),0,17,8,0x27,0x10,0x27,0x10,3,1,0x11,0,2,0x11,0,3,0x11,0)
        val webp=ByteArray(30);"RIFF".toByteArray().copyInto(webp);"WEBPVP8X".toByteArray().copyInto(webp,8)
        val dimension=9999;webp[24]=dimension.toByte();webp[25]=(dimension shr 8).toByte();webp[27]=dimension.toByte();webp[28]=(dimension shr 8).toByte()
        for((format,bytes) in listOf("png" to png,"jpeg" to jpeg,"webp" to webp)) {
            val image="data:image/$format;base64,"+java.util.Base64.getEncoder().encodeToString(bytes)
            try { BackupCodec.validateImage(image);fail("accepted huge decoded $format") } catch(_: IllegalArgumentException) { }
        }
    }
    @Test fun rejectsRowTooLargeForReliableRoomReads() {
        val n=Note(items=(1..500).map { CheckItem(text="界".repeat(2000)) })
        try { BackupCodec.encode(Backup(listOf(n),emptyList()));fail("accepted oversized database row") } catch(_: IllegalArgumentException) { }
    }
}
