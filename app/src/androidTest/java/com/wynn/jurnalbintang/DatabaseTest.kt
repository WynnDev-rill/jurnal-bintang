package com.wynn.jurnalbintang

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.wynn.jurnalbintang.data.*
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class DatabaseTest {
    @Test fun persistedWritingSurvivesReopenAndFolderRemovalKeepsContent() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val name = "test-${System.nanoTime()}.db"
        var db = Room.databaseBuilder(context,AsterDatabase::class.java,name).build()
        val note=Note(id="n", title="Tetap ada", body="Baris terakhir",folderId="f",archived=true)
        db.dao().saveFolder(Folder("f","Kerja"))
        db.dao().save(note)
        db.close()
        db=Room.databaseBuilder(context,AsterDatabase::class.java,name).build()
        assertEquals(note,db.dao().get("n"))
        db.dao().removeFolder("f")
        assertNull(db.dao().get("n")!!.folderId)
        assertEquals("Baris terakhir",db.dao().get("n")!!.body)
        assertTrue(db.dao().get("n")!!.archived)
        db.close();context.deleteDatabase(name)
    }
    @Test fun conflictingImportDoesNotOverwriteAndIsIdempotent() = runBlocking {
        val db=Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext(),AsterDatabase::class.java).build()
        val repo=JournalRepository(db)
        val current=Note(id="same",body="milik perangkat",createdAt=10)
        db.dao().save(current)
        val imported=Backup(listOf(current.copy(body="milik backup")),emptyList())
        assertEquals(1,repo.importBackup(imported))
        assertEquals(0,repo.importBackup(imported))
        assertEquals(2,db.dao().allNotes().size)
        assertEquals(current,db.dao().get("same"))
        db.close()
    }
}
