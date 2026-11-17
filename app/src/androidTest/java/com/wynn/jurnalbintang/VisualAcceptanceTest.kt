package com.wynn.jurnalbintang

import android.graphics.Bitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.wynn.jurnalbintang.data.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.io.FileInputStream

/** Real Android captures, using explicitly synthetic writing in a disposable emulator. */
@RunWith(AndroidJUnit4::class)
class VisualAcceptanceTest {
    @get:Rule val rule=createAndroidComposeRule<MainActivity>()
    private val instrumentation get()=InstrumentationRegistry.getInstrumentation()
    private fun shell(command: String) {
        instrumentation.uiAutomation.executeShellCommand(command).use { fd -> FileInputStream(fd.fileDescriptor).use { it.readBytes() } }
    }
    private fun capture(name: String) {
        rule.waitForIdle()
        val bitmap=checkNotNull(instrumentation.uiAutomation.takeScreenshot()) { "Device screenshot unavailable" }
        val folder=File(rule.activity.getExternalFilesDir(null),"screenshots").apply { mkdirs() }
        File(folder,"$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG,100,it) }
        bitmap.recycle()
    }
    private fun awaitLibrary() {
        rule.waitUntil(20_000) { rule.onAllNodesWithContentDescription("Buat catatan").fetchSemanticsNodes().isNotEmpty() }
    }
    @Test fun captureNativeLightDarkEditorKeyboardAndExpandedLayouts() {
        val app=rule.activity.application as AsterApplication
        val before=runBlocking { app.preferences.settings.first() }
        try {
            runBlocking {
                app.preferences.update(before.copy(theme="light",protectScreen=false))
                app.repository.dao.saveFolder(Folder("visual-folder","Pribadi"))
                app.repository.dao.save(Note(id="visual-note",title="Hal-hal yang ingin kusimpan",body="Pagi yang pelan, secangkir teh, dan waktu untuk mendengarkan diri sendiri. Ternyata hal kecil bisa terasa cukup.",folderId="visual-folder",pinned=true,tags=listOf("keseharian")))
                app.repository.dao.save(Note(id="visual-list",kind="checklist",title="Rencana kecil minggu ini",items=listOf(CheckItem("a","Jalan sebentar di pagi hari",true),CheckItem("b","Lanjutkan buku yang tertunda"))))
            }
            awaitLibrary()
            rule.waitUntil(10_000) { rule.onAllNodesWithText("Hal-hal yang ingin kusimpan").fetchSemanticsNodes().isNotEmpty() }
            capture("01-library-light")
            rule.onNodeWithText("Hal-hal yang ingin kusimpan").performClick()
            rule.waitUntil(10_000) { rule.onAllNodesWithTag("editor-body").fetchSemanticsNodes().isNotEmpty() }
            rule.onNodeWithTag("editor-body").performClick()
            rule.waitForIdle()
            capture("02-editor-input")
            rule.onNodeWithContentDescription("Kembali").performClick()
            awaitLibrary()
            rule.onNodeWithContentDescription("Navigasi Refleksi").performClick()
            rule.onNodeWithText("Mulai menulis").assertExists()
            capture("03-reflection-light")
            runBlocking { app.preferences.update(before.copy(theme="dark",protectScreen=false)) }
            rule.waitUntil(10_000) { !rule.activity.window.attributes.flags.and(android.view.WindowManager.LayoutParams.FLAG_SECURE).equals(android.view.WindowManager.LayoutParams.FLAG_SECURE) }
            rule.waitForIdle()
            capture("04-reflection-dark")
            rule.onNodeWithContentDescription("Navigasi Koleksi").performClick()
            capture("05-collections-dark")
            shell("settings put system font_scale 1.5")
            rule.activityRule.scenario.recreate()
            rule.waitUntil(20_000) { rule.onAllNodesWithContentDescription("Navigasi Catatan").fetchSemanticsNodes().isNotEmpty() }
            rule.onNodeWithContentDescription("Navigasi Catatan").performClick()
            capture("06-library-large-text")
            shell("settings put system font_scale 1.0")
            shell("wm size 1600x1200")
            shell("wm density 240")
            rule.activityRule.scenario.recreate()
            rule.waitUntil(20_000) { rule.onAllNodesWithContentDescription("Navigasi Catatan").fetchSemanticsNodes().isNotEmpty() }
            capture("07-expanded-navigation")
        } finally {
            shell("wm size reset");shell("wm density reset");shell("settings put system font_scale 1.0")
            runBlocking { app.preferences.update(before) }
        }
    }
}
