package com.wynn.jurnalbintang

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class WritingFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()
    @Test fun noteAutosavesOnImmediateBackAndReopens() {
        val title = "Catatan UI ${System.nanoTime()}"
        rule.onNodeWithContentDescription("Buat catatan").performClick()
        rule.onNodeWithText("Catatan kosong").performClick()
        rule.onNodeWithTag("editor-title").performTextInput(title)
        rule.onNodeWithTag("editor-body").performTextInput("Baris terakhir harus tetap ada")
        rule.onNodeWithContentDescription("Kembali").performClick()
        rule.waitUntil(10000) { rule.onAllNodesWithText(title).fetchSemanticsNodes().isNotEmpty() }
        rule.onNodeWithText(title).performClick()
        rule.onNodeWithTag("editor-body").assertTextContains("Baris terakhir harus tetap ada")
        rule.activityRule.scenario.recreate()
        rule.waitUntil(10000) { rule.onAllNodesWithTag("editor-body").fetchSemanticsNodes().isNotEmpty() }
        rule.onNodeWithTag("editor-body").assertTextContains("Baris terakhir harus tetap ada")
    }
    @Test fun reflectionPromptCreatesPersistentGuidedWriting() {
        rule.onNodeWithContentDescription("Navigasi Refleksi").performClick()
        rule.onNodeWithText("Mulai menulis").performClick()
        rule.onNodeWithTag("editor-body").performTextInput("Aku bersyukur punya waktu untuk diriku.")
        rule.onNodeWithText("Baik", useUnmergedTree=true).performClick()
        rule.onNodeWithContentDescription("Kembali").performClick()
        rule.onNodeWithText("Tulisan refleksimu").assertExists()
    }
}
