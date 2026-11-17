package com.wynn.jurnalbintang

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.wynn.jurnalbintang.data.Note
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class OrganizationFlowTest {
    @get:Rule val rule=createAndroidComposeRule<MainActivity>()
    private fun click(text: String) { rule.onNodeWithText(text).performClick() }
    private fun menu(text: String) { rule.onNodeWithContentDescription("Menu catatan").performClick();click(text) }
    @Test fun folderFavoriteArchiveTrashAndRestoreKeepOriginalWriting() {
        val app=rule.activity.application as AsterApplication
        val stamp=System.nanoTime().toString()
        val title="Organisasi $stamp"
        val folder="Pribadi $stamp"
        val note=Note(title=title,body="Tulisan asli tetap tersimpan.")
        runBlocking { app.repository.dao.save(note) }
        rule.onNodeWithContentDescription("Navigasi Koleksi").performClick()
        rule.onNodeWithContentDescription("Buat folder").performClick()
        rule.onNodeWithText("Nama folder").performTextInput(folder)
        click("Simpan")
        rule.onNodeWithContentDescription("Navigasi Catatan").performClick()
        rule.waitUntil(10_000) { rule.onAllNodesWithText(title).fetchSemanticsNodes().isNotEmpty() }
        click(title)
        rule.onNodeWithContentDescription("Tandai favorit").performClick()
        menu("Folder & tag")
        click(folder);click("Selesai")
        menu("Sematkan")
        menu("Arsipkan")
        rule.onNodeWithContentDescription("Navigasi Koleksi").performClick()
        click("Arsip");click(title)
        menu("Kembalikan dari arsip")
        rule.onNodeWithContentDescription("Kembali").performClick()
        rule.onNodeWithContentDescription("Navigasi Catatan").performClick()
        click(title);menu("Pindahkan ke Sampah");click("Pindahkan")
        rule.onNodeWithContentDescription("Navigasi Koleksi").performClick()
        click("Sampah");click(title);menu("Pulihkan dari Sampah")
        rule.waitUntil(10_000) { runBlocking { app.repository.dao.get(note.id)?.trashed==false } }
        val persisted=runBlocking { app.repository.dao.get(note.id)!! }
        assertFalse(persisted.trashed);assertFalse(persisted.archived)
        assertTrue(persisted.favorite)
        assertEquals(note.body,persisted.body)
        assertNotNull(persisted.folderId)
        assertEquals(folder,runBlocking { app.repository.dao.allFolders() }.first { it.id==persisted.folderId }.name)
    }
}
