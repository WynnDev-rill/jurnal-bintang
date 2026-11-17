package com.wynn.jurnalbintang.data

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class DraftState(val note: Note,val revision: Long=0,val saving: Boolean=false,val stored: Boolean=false,val error: String?=null)
class DraftSession(initial: Note,stored: Boolean,scope: CoroutineScope,private val writer: suspend (Note)->Unit) {
    private val _state=MutableStateFlow(DraftState(initial,stored=stored))
    val state=_state.asStateFlow()
    private val requests=Channel<Unit>(Channel.CONFLATED)
    private val lock=Mutex()
    private var persisted=0L
    init { scope.launch { for(request in requests) persistLatest() } }
    fun edit(transform: (Note)->Note) {
        _state.update { it.copy(note=transform(it.note).copy(updatedAt=System.currentTimeMillis()),revision=it.revision+1,saving=true,error=null) }
        requests.trySend(Unit)
    }
    private suspend fun persistLatest(): Boolean = lock.withLock {
        val snapshot=_state.value
        if(snapshot.revision==persisted) return@withLock true
        try {
            val stored=snapshot.stored || snapshot.note.hasContent()
            if(stored) writer(snapshot.note)
            persisted=snapshot.revision
            _state.update { it.copy(stored=stored,saving=it.revision!=persisted,error=null) }
            true
        } catch(e: CancellationException) { throw e }
        catch(_: Exception) {
            _state.update { it.copy(saving=false,error="Perubahan terakhir belum tersimpan. Periksa ruang perangkat, lalu coba lagi. Teks tetap ada selama editor ini terbuka.") }
            false
        }
    }
    suspend fun flush(): Boolean {
        do { if(!persistLatest()) return false } while(_state.value.revision!=persisted)
        return true
    }
}
