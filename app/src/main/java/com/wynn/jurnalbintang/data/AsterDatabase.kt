package com.wynn.jurnalbintang.data

import androidx.room.*
import androidx.room.withTransaction
import kotlinx.coroutines.flow.Flow
import org.json.JSONArray
import org.json.JSONObject

class Converters {
    @TypeConverter fun encodeTags(value: List<String>): String = JSONArray(value).toString()
    @TypeConverter fun decodeTags(value: String): List<String> = JSONArray(value).let { a -> (0 until a.length()).map { a.getString(it) } }
    @TypeConverter fun encodeItems(value: List<CheckItem>): String = JSONArray(value.map { JSONObject().put("id",it.id).put("text",it.text).put("done",it.done) }).toString()
    @TypeConverter fun decodeItems(value: String): List<CheckItem> = JSONArray(value).let { a -> (0 until a.length()).map { a.getJSONObject(it).let { o -> CheckItem(o.getString("id"),o.getString("text"),o.getBoolean("done")) } } }
}
@Dao
abstract class JournalDao {
    @Query("SELECT * FROM notes ORDER BY updatedAt DESC") abstract fun observeNotes(): Flow<List<Note>>
    @Query("SELECT * FROM folders ORDER BY name COLLATE NOCASE") abstract fun observeFolders(): Flow<List<Folder>>
    @Query("SELECT * FROM notes WHERE id = :id") abstract suspend fun get(id: String): Note?
    @Query("SELECT * FROM notes ORDER BY updatedAt DESC") abstract suspend fun allNotes(): List<Note>
    @Query("SELECT * FROM folders ORDER BY name COLLATE NOCASE") abstract suspend fun allFolders(): List<Folder>
    @Upsert abstract suspend fun save(note: Note)
    @Upsert abstract suspend fun saveFolder(folder: Folder)
    @Query("DELETE FROM notes WHERE id = :id") abstract suspend fun deleteForever(id: String)
    @Query("UPDATE notes SET folderId = NULL WHERE folderId = :id") abstract suspend fun unassignFolder(id: String)
    @Query("DELETE FROM folders WHERE id = :id") abstract suspend fun deleteFolderRow(id: String)
    @Transaction open suspend fun removeFolder(id: String) { unassignFolder(id);deleteFolderRow(id) }
}
@Database(entities=[Note::class,Folder::class],version=1,exportSchema=true)
@TypeConverters(Converters::class)
abstract class AsterDatabase: RoomDatabase() { abstract fun dao(): JournalDao }

class JournalRepository(private val db: AsterDatabase) {
    val dao=db.dao()
    suspend fun snapshot(): Backup = db.withTransaction { Backup(dao.allNotes(),dao.allFolders()) }
    suspend fun importBackup(incoming: Backup): Int = db.withTransaction {
        val current=Backup(dao.allNotes(),dao.allFolders())
        val merged=mergeBackups(current,incoming)
        val folderIds=current.folders.map { it.id }.toSet()
        val noteIds=current.notes.map { it.id }.toSet()
        merged.folders.filter { it.id !in folderIds }.forEach { dao.saveFolder(it) }
        val added=merged.notes.filter { it.id !in noteIds }
        added.forEach { dao.save(it) }
        added.size
    }
}
