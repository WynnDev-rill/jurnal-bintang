package com.wynn.jurnalbintang.ui

import android.app.Application
import android.net.Uri
import com.wynn.jurnalbintang.platform.Documents
import androidx.lifecycle.*
import com.wynn.jurnalbintang.AsterApplication
import com.wynn.jurnalbintang.data.*
import com.wynn.jurnalbintang.platform.Reminders
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class LibraryState(val notes: List<Note> = emptyList(),val folders: List<Folder> = emptyList(),val settings: Settings=Settings(),val loaded: Boolean=false,val error: String?=null)
class AppViewModel(application: Application): AndroidViewModel(application) {
    private val app=application as AsterApplication
    val repository=app.repository
    private val _state=MutableStateFlow(LibraryState())
    val state=_state.asStateFlow()
    val messages=MutableSharedFlow<String>(extraBufferCapacity=8)
    private var loading: Job?=null
    private val settingsLock=Mutex()
    init { reload() }
    fun reload() {
        loading?.cancel()
        loading=viewModelScope.launch {
            combine(repository.dao.observeNotes(),repository.dao.observeFolders(),app.preferences.settings) { notes,folders,settings -> LibraryState(notes,folders,settings,true) }
                .catch { _state.update { it.copy(loaded=true,error="Data belum bisa dibaca. Coba lagi; data lama tidak dihapus.") } }
                .collect { _state.value=it }
        }
    }
    fun action(success: String?=null,block: suspend ()->Unit) = viewModelScope.launch {
        try { block();success?.let { messages.emit(it) } }
        catch(e: CancellationException) { throw e }
        catch(e: Exception) { messages.emit(if(e is IllegalArgumentException) e.message ?: "Masukan belum valid." else "Perubahan belum tersimpan. Periksa ruang perangkat, lalu coba lagi.") }
    }
    fun settings(transform: (Settings)->Settings) = action {
        settingsLock.withLock {
            val next=transform(app.preferences.settings.first())
            app.preferences.update(next)
            Reminders.schedule(app,next)
        }
    }
    fun folder(name: String,existing: Folder?=null,onSuccess: ()->Unit) = action {
        val trimmed=name.trim();require(trimmed.isNotEmpty() && trimmed.length<=80) { "Nama folder harus 1–80 karakter." }
        require(_state.value.folders.none { it.id!=existing?.id && it.name.equals(trimmed,true) }) { "Nama folder sudah digunakan." }
        repository.dao.saveFolder(existing?.copy(name=trimmed) ?: Folder(name=trimmed));onSuccess()
    }
    val pendingImport=MutableStateFlow<Backup?>(null)
    val dataBusy=MutableStateFlow(false)
    fun readBackup(uri: Uri) = action {
        dataBusy.value=true
        try { pendingImport.value=withContext(Dispatchers.IO) { Documents.read(app,uri) } }
        finally { dataBusy.value=false }
    }
    fun importPending() = action {
        val backup=pendingImport.value ?: return@action
        dataBusy.value=true
        try {
            val count=repository.importBackup(backup)
            pendingImport.value=null
            messages.emit("$count tulisan ditambahkan. Tulisan lama tetap ada.")
        } finally { dataBusy.value=false }
    }
    fun export(uri: Uri,markdown: Boolean) = action {
        dataBusy.value=true
        try {
            val backup=repository.snapshot()
            withContext(Dispatchers.IO) {
                Documents.write(app,uri,if(markdown) BackupCodec.markdown(backup) else BackupCodec.encode(backup))
            }
            messages.emit("${if(markdown) "Ekspor Markdown" else "Cadangan JSON"} berhasil disimpan.")
        } finally { dataBusy.value=false }
    }
    fun deleteFolder(folder: Folder) = action("Folder dihapus. Catatan tetap tersimpan.") { repository.dao.removeFolder(folder.id) }
}
