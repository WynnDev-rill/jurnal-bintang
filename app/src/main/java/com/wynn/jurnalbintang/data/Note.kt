package com.wynn.jurnalbintang.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDate
import java.util.UUID

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val kind: String = "note",
    val title: String = "",
    val body: String = "",
    val items: List<CheckItem> = emptyList(),
    val tags: List<String> = emptyList(),
    val folderId: String? = null,
    val pinned: Boolean = false,
    val favorite: Boolean = false,
    val archived: Boolean = false,
    val trashed: Boolean = false,
    val prompt: String = "",
    val mood: String? = null,
    val image: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = createdAt,
) {
    fun hasContent(): Boolean = TODO("meaningful content")
    val displayTitle: String get() = title.ifBlank { prompt.ifBlank { "Tanpa judul" } }
}

data class CheckItem(val id: String = UUID.randomUUID().toString(), val text: String = "", val done: Boolean = false)
@Entity(tableName = "folders")
data class Folder(@PrimaryKey val id: String = UUID.randomUUID().toString(), val name: String)

data class Prompt(val id: String, val category: String, val question: String, val followUps: List<String>)
object Prompts {
    val all: List<Prompt> = emptyList()
    fun daily(date: LocalDate = LocalDate.now()): Prompt = TODO("daily prompt")
}
fun wordCount(text: String): Int = TODO("unicode words")
fun filterNotes(notes: List<Note>, query: String, collection: String, kind: String, oldest: Boolean): List<Note> = TODO("filter")
