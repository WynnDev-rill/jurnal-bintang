package com.wynn.jurnalbintang.ui

import android.content.Context
import android.net.Uri
import androidx.lifecycle.*
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.wynn.jurnalbintang.data.*
import com.wynn.jurnalbintang.platform.Photos
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class EditorViewModel(private val repository: JournalRepository,handle: SavedStateHandle): ViewModel() {
    private val _session=MutableStateFlow<DraftSession?>(null)
    val session=_session.asStateFlow()
    private val _loadError=MutableStateFlow<String?>(null)
    val loadError=_loadError.asStateFlow()
    private val _photoBusy=MutableStateFlow(false)
    val photoBusy=_photoBusy.asStateFlow()
    val messages=MutableSharedFlow<String>(extraBufferCapacity=4)
    private val id=checkNotNull(handle.get<String>("id"))
    private val kind=handle.get<String>("kind") ?: "note"
    private val promptId=handle.get<String>("prompt") ?: ""
    private val folder=handle.get<String>("folder")?.takeIf { it.isNotBlank() }
    init { load() }
    fun load() {
        _loadError.value=null
        viewModelScope.launch {
            try {
                val saved=repository.dao.get(id)
                val initial=saved ?: Note(id=id,kind=kind,prompt=Prompts.all.find { it.id==promptId }?.question ?: "",folderId=folder?.takeIf { id -> repository.dao.allFolders().any { it.id==id } })
                val session=DraftSession(initial,saved!=null,viewModelScope) { repository.dao.save(it) }
                _session.value=session
                if(saved==null && initial.hasContent()) session.edit { it }
            } catch(e: CancellationException) { throw e }
            catch(_: Exception) { _loadError.value="Catatan belum bisa dibuka. Coba lagi tanpa menghapus data aplikasi." }
        }
    }
    fun edit(transform: (Note)->Note) { _session.value?.edit(transform) }
    suspend fun flush(): Boolean = _session.value?.flush() ?: false
    fun onBackground() { viewModelScope.launch { _session.value?.flush() } }
    fun attach(context: Context,uri: Uri) {
        viewModelScope.launch {
            _photoBusy.value=true
            try { val image=withContext(Dispatchers.IO) { Photos.read(context,uri) };edit { it.copy(image=image) } }
            catch(e: CancellationException) { throw e }
            catch(e: Exception) { messages.emit(if(e is IllegalArgumentException) e.message ?: "Gambar tidak dapat dipakai." else "Gambar belum bisa dibaca. Pilih gambar lain.") }
            finally { _photoBusy.value=false }
        }
    }
    suspend fun deleteForever(): Boolean {
        if(!flush()) return false
        return try { repository.dao.deleteForever(id);true } catch(_: Exception) { messages.emit("Catatan belum terhapus. Coba lagi.");false }
    }
    companion object {
        fun factory(repository: JournalRepository) = viewModelFactory {
            initializer { EditorViewModel(repository,createSavedStateHandle()) }
        }
    }
}
