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
    fun hasContent(): Boolean = title.isNotBlank() || body.isNotBlank() || items.any { it.text.isNotBlank() } || image != null || mood != null
    val displayTitle: String get() = title.ifBlank { prompt.ifBlank { "Tanpa judul" } }
}

data class CheckItem(val id: String = UUID.randomUUID().toString(), val text: String = "", val done: Boolean = false)
@Entity(tableName = "folders")
data class Folder(@PrimaryKey val id: String = UUID.randomUUID().toString(), val name: String)

data class Prompt(val id: String, val category: String, val question: String, val followUps: List<String>)
fun wordCount(text: String): Int = text.trim().split(Regex("\\s+")).count { it.isNotBlank() }
fun filterNotes(notes: List<Note>, query: String, collection: String, kind: String, oldest: Boolean): List<Note> {
    val term = query.trim().lowercase(java.util.Locale.ROOT)
    return notes.filter { n ->
        val inCollection = when(collection) {
            "trash" -> n.trashed
            "archive" -> n.archived && !n.trashed
            "favorites" -> n.favorite && !n.archived && !n.trashed
            "all" -> !n.archived && !n.trashed
            else -> n.folderId == collection && !n.archived && !n.trashed
        }
        inCollection && (kind == "all" || n.kind == kind || (kind == "favorite" && n.favorite)) &&
            (term.isEmpty() || listOf(n.title,n.body,n.prompt,n.tags.joinToString(" "),n.items.joinToString(" ") { it.text })
                .any { it.lowercase(java.util.Locale.ROOT).contains(term) })
    }.sortedWith(compareByDescending<Note> { it.pinned }.thenBy { if(oldest) it.updatedAt else -it.updatedAt })
}
