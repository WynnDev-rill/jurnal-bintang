package com.wynn.jurnalbintang

import android.graphics.Bitmap
import android.content.ContentValues
import android.provider.MediaStore
import android.os.Build
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
        // Compose can be idle before SystemUI/IME has finished its own layout.
        instrumentation.uiAutomation.waitForIdle(1_000,10_000)
        val bitmap=checkNotNull(instrumentation.uiAutomation.takeScreenshot()) { "Device screenshot unavailable" }
        if(Build.VERSION.SDK_INT>=29) {
            val resolver=rule.activity.contentResolver
            val values=ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME,"$name.png")
                put(MediaStore.Images.Media.MIME_TYPE,"image/png")
                put(MediaStore.Images.Media.RELATIVE_PATH,"Pictures/AsterJournalAcceptance")
                put(MediaStore.Images.Media.IS_PENDING,1)
            }
            val uri=checkNotNull(resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,values))
            checkNotNull(resolver.openOutputStream(uri)).use { bitmap.compress(Bitmap.CompressFormat.PNG,100,it) }
            resolver.update(uri,ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING,0) },null,null)
        } else {
            val folder=File(rule.activity.getExternalFilesDir(null),"screenshots").apply { mkdirs() }
            File(folder,"$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG,100,it) }
        }
        bitmap.recycle()
    }
    private fun awaitLibrary() {
        rule.waitUntil(20_000) { rule.onAllNodesWithContentDescription("Buat catatan").fetchSemanticsNodes().isNotEmpty() }
    }
    private fun awaitIme() {
        rule.waitUntil(15_000) {
            var visible=false
            rule.runOnUiThread { visible=androidx.core.view.ViewCompat.getRootWindowInsets(rule.activity.window.decorView)?.isVisible(androidx.core.view.WindowInsetsCompat.Type.ime())==true }
            visible
        }
    }
    private fun awaitConfiguration(fontScale: Float,minWidthDp: Int=0) {
        // Android recreates the Activity for these shell changes itself. Calling
        // scenario.recreate() concurrently races an already-destroyed instance.
        instrumentation.uiAutomation.waitForIdle(1_000,10_000)
        rule.waitUntil(20_000) {
            runCatching {
                val config=rule.activity.resources.configuration
                kotlin.math.abs(config.fontScale-fontScale)<0.01f && config.screenWidthDp>=minWidthDp
            }.getOrDefault(false)
        }
        rule.waitForIdle()
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
            shell("settings put secure show_ime_with_hard_keyboard 1")
            rule.runOnIdle { androidx.core.view.WindowCompat.getInsetsController(rule.activity.window,rule.activity.window.decorView).show(androidx.core.view.WindowInsetsCompat.Type.ime()) }
            awaitIme()
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
            rule.onNodeWithContentDescription("Navigasi Setelan").performClick()
            capture("05b-settings-dark")
            rule.onNodeWithContentDescription("Navigasi Catatan").performClick()
            rule.onNodeWithText("Cari catatan").performTextInput("zzqanoentry")
            awaitIme()
            rule.onNodeWithText("Coba kata lain, atau ubah filter tulisan.").performScrollTo().assertIsDisplayed()
            rule.onNodeWithTag("note-list").performTouchInput { swipeUp() }
            rule.onNodeWithText("Coba kata lain, atau ubah filter tulisan.").assertIsDisplayed()
            rule.onNodeWithContentDescription("Buat catatan").assertIsDisplayed()
            var keyboardTop=0
            rule.runOnUiThread {
                keyboardTop=rule.activity.window.decorView.height-(androidx.core.view.ViewCompat.getRootWindowInsets(rule.activity.window.decorView)?.getInsets(androidx.core.view.WindowInsetsCompat.Type.ime())?.bottom ?: 0)
            }
            check(rule.onNodeWithContentDescription("Buat catatan").fetchSemanticsNode().boundsInWindow.bottom<=keyboardTop+1) { "Create action is covered by the keyboard" }
            capture("05c-empty-search")
            rule.onNodeWithContentDescription("Bersihkan pencarian").performScrollTo().performClick()
            rule.runOnIdle { androidx.core.view.WindowCompat.getInsetsController(rule.activity.window,rule.activity.window.decorView).hide(androidx.core.view.WindowInsetsCompat.Type.ime()) }
            shell("settings put system font_scale 1.5")
            awaitConfiguration(1.5f)
            rule.waitUntil(20_000) { rule.onAllNodesWithContentDescription("Navigasi Catatan").fetchSemanticsNodes().isNotEmpty() }
            rule.onNodeWithContentDescription("Navigasi Catatan").performClick()
            capture("06-library-large-text")
            shell("settings put system font_scale 1.0")
            shell("wm size 1600x1200")
            shell("wm density 240")
            instrumentation.uiAutomation.waitForIdle(2_000,15_000)
            awaitConfiguration(1f,minWidthDp=900)
            rule.waitUntil(20_000) { rule.onAllNodesWithContentDescription("Navigasi Catatan").fetchSemanticsNodes().isNotEmpty() }
            capture("07-expanded-navigation")
        } finally {
            shell("wm size reset");shell("wm density reset");shell("settings put system font_scale 1.0")
            runBlocking { app.preferences.update(before) }
        }
    }
}
