package com.wynn.jurnalbintang

import com.wynn.jurnalbintang.data.*
import kotlinx.coroutines.*
import kotlinx.coroutines.test.*
import org.junit.Assert.*
import org.junit.Test
import java.io.IOException

@OptIn(ExperimentalCoroutinesApi::class)
class DraftSessionTest {
    @Test fun immediateFlushKeepsLastInputAndDoesNotCreateEmptyDraft() = runTest {
        val writes=mutableListOf<Note>()
        val session=DraftSession(Note(id="n"),false,backgroundScope) { writes+=it }
        assertTrue(session.flush());assertTrue(writes.isEmpty())
        session.edit { it.copy(body="pertama") }
        session.edit { it.copy(body="terakhir") }
        assertTrue(session.flush())
        assertEquals("terakhir",writes.last().body)
        assertFalse(session.state.value.saving)
    }
    @Test fun saveFailureKeepsInputAndRetryCommitsIt() = runTest {
        var fail=true;var saved:Note?=null
        val session=DraftSession(Note(),false,backgroundScope) { if(fail) throw IOException("disk full") else saved=it }
        session.edit { it.copy(body="jangan hilang") }
        assertFalse(session.flush())
        assertEquals("jangan hilang",session.state.value.note.body)
        assertNotNull(session.state.value.error)
        fail=false;assertTrue(session.flush())
        assertEquals("jangan hilang",saved!!.body)
        assertNull(session.state.value.error)
    }
    @Test fun slowWriteCannotOverwriteNewerEdit() = runTest {
        val gate=CompletableDeferred<Unit>();val writes=mutableListOf<String>()
        val session=DraftSession(Note(),false,backgroundScope) { if(it.body=="a") gate.await();writes+=it.body }
        session.edit { it.copy(body="a") };runCurrent()
        session.edit { it.copy(body="b") };gate.complete(Unit)
        assertTrue(session.flush())
        runCurrent()
        assertEquals("b",writes.last())
        assertEquals(2,session.state.value.revision)
    }
}
