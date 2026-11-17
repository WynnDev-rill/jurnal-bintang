package com.wynn.jurnalbintang

import com.wynn.jurnalbintang.data.*
import org.junit.Assert.*
import org.junit.Test
import java.time.LocalDate

class NoteRulesTest {
    @Test fun searchIncludesChecklistAndTagsWithoutLeakingTrash() {
        val normal = Note(title = "Rencana", items = listOf(CheckItem(text = "Beli teh")), tags = listOf("rumah"))
        val trash = normal.copy(id = "trash", trashed = true)
        assertEquals(listOf(normal), filterNotes(listOf(normal, trash), "teh", "all", "all", false))
        assertEquals(listOf(normal), filterNotes(listOf(normal), "RUMAH", "all", "all", false))
        assertEquals(listOf(trash), filterNotes(listOf(normal, trash), "", "trash", "all", false))
    }
    @Test fun pinnedSortsFirstAndArchiveStaysSeparate() {
        val old = Note(id = "old", pinned = true, updatedAt = 1)
        val recent = Note(id = "recent", updatedAt = 4)
        val archived = Note(id = "archive", archived = true, folderId = "work")
        assertEquals(listOf(old, recent), filterNotes(listOf(recent, archived, old), "", "all", "all", false))
        assertEquals(listOf(archived), filterNotes(listOf(archived), "", "archive", "all", false))
        assertTrue(filterNotes(listOf(archived), "", "work", "all", false).isEmpty())
    }
    @Test fun unicodeWordsAndMeaningfulDrafts() {
        assertEquals(3, wordCount("  Selamat\n pagi  dunia! "))
        assertEquals(0, wordCount("  \n  "))
        assertFalse(Note().hasContent())
        assertTrue(Note(mood = "hard", kind = "reflection").hasContent())
        assertTrue(Note(items = listOf(CheckItem(text = "tugas"))).hasContent())
    }
    @Test fun dailyPromptIsStableAcrossLocalDateAndCategoriesHaveDepth() {
        val date = LocalDate.of(2026,11,17)
        assertEquals(Prompts.daily(date), Prompts.daily(date))
        assertNotEquals(Prompts.daily(date), Prompts.daily(date.plusDays(1)))
        assertTrue(Prompts.all.size >= 24)
        assertTrue(Prompts.all.all { it.followUps.size >= 2 && it.question.isNotBlank() })
        assertEquals(Prompts.all.size, Prompts.all.map { it.id }.distinct().size)
    }
}
