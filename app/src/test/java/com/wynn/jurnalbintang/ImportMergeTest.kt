package com.wynn.jurnalbintang

import com.wynn.jurnalbintang.data.*
import org.junit.Assert.*
import org.junit.Test

class ImportMergeTest {
    @Test fun conflictKeepsBothAndRemapsFolderWithoutRepeating() {
        val n=Note(id="same",body="perangkat",folderId="f",createdAt=1)
        val old=Backup(listOf(n),listOf(Folder("f","Kerja")))
        val imported=Backup(listOf(n.copy(body="backup")),listOf(Folder("f","Rumah")))
        val merged=mergeBackups(old,imported)
        assertEquals(2,merged.notes.size)
        assertEquals(2,merged.folders.size)
        assertEquals("perangkat",merged.notes.first { it.id=="same" }.body)
        val copy=merged.notes.first { it.body=="backup" }
        assertEquals("Rumah",merged.folders.first { it.id==copy.folderId }.name)
        assertEquals(merged,mergeBackups(merged,imported))
    }
    @Test fun reimportAfterEditingImportedCopyPreservesBothVersions() {
        val original=Note(id="same",body="perangkat",createdAt=1)
        val incoming=Backup(listOf(original.copy(body="backup")),listOf(Folder("f","Rumah")))
        val current=Backup(listOf(original),listOf(Folder("f","Kerja")))
        val first=mergeBackups(current,incoming)
        val edited=first.copy(notes=first.notes.map { if(it.id!="same") it.copy(body="edit lokal") else it },
            folders=first.folders.map { if(it.id!="f") it.copy(name="Sudah diganti") else it })
        val second=mergeBackups(edited,incoming)
        assertEquals(setOf("perangkat","edit lokal","backup"),second.notes.map { it.body }.toSet())
        assertEquals(setOf("Kerja","Sudah diganti","Rumah"),second.folders.map { it.name }.toSet())
        assertEquals(second,mergeBackups(second,incoming))
    }
}
