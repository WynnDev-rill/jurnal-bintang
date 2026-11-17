package com.wynn.jurnalbintang.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import com.wynn.jurnalbintang.data.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable fun LibraryScreen(state: LibraryState,collection: String="all",onSettings: ()->Unit,onBack: ()->Unit,onOpen: (Note)->Unit,onCreate: (String)->Unit,onSort: ()->Unit,onRetry: ()->Unit) {
    var query by rememberSaveable(collection) { mutableStateOf("") }
    var filter by rememberSaveable(collection) { mutableStateOf("all") }
    var createSheet by rememberSaveable { mutableStateOf(false) }
    val notes=remember(state.notes,query,filter,collection,state.settings.oldest) { filterNotes(state.notes,query,collection,filter,state.settings.oldest) }
    val name=when(collection) { "all"->"Catatanmu";"archive"->"Arsip";"trash"->"Sampah";"favorites"->"Favorit";else->state.folders.find { it.id==collection }?.name ?: "Folder" }
    Box(Modifier.fillMaxSize()) {
        LazyColumn(modifier=Modifier.fillMaxSize(),contentPadding=PaddingValues(bottom=104.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
            item {
                if(collection=="all") BrandHeader(onSettings) else BackHeader(name,onBack)
                Column(Modifier.padding(horizontal=24.dp)) {
                    PageHeading(if(collection=="all") "Ruang untuk\npikiranmu." else name,
                        if(collection=="trash") "Pulihkan kapan saja. Dihapus permanen hanya olehmu." else if(collection=="archive") "Tulisan yang disimpan untuk nanti." else "${notes.size} tulisan · tersimpan di perangkat")
                    Spacer(Modifier.height(24.dp))
                    OutlinedTextField(value=query,onValueChange={query=it.take(200)},singleLine=true,
                        label={Text("Cari catatan")},placeholder={Text("Judul, isi, tag, atau checklist")},
                        leadingIcon={Icon(Icons.Outlined.Search,null)},trailingIcon={if(query.isNotEmpty()) IconButton(onClick={query=""}) { Icon(Icons.Outlined.Close,"Bersihkan pencarian") }},
                        modifier=Modifier.fillMaxWidth(),shape=androidx.compose.foundation.shape.RoundedCornerShape(16.dp))
                }
                Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal=24.dp,vertical=8.dp),horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                    listOf("all" to "Semua","note" to "Catatan","checklist" to "Checklist","reflection" to "Refleksi","favorite" to "Favorit").forEach { (key,label) ->
                        FilterChip(selected=filter==key,onClick={filter=key},label={Text(label)},modifier=Modifier.heightIn(min=48.dp))
                    }
                }
            }
            if(state.error!=null) item { Box(Modifier.padding(horizontal=24.dp)) { ErrorNotice(state.error,onRetry) } }
            else if(!state.loaded) item { Box(Modifier.fillMaxWidth().padding(40.dp),contentAlignment=Alignment.Center) { CircularProgressIndicator(Modifier.size(28.dp)) } }
            else if(notes.isEmpty()) item { Box(Modifier.padding(horizontal=24.dp)) { EmptyState(
                if(query.isNotBlank()) "Belum ketemu." else when(collection) { "trash"->"Sampah masih kosong.";"archive"->"Simpan untuk nanti.";"favorites"->"Yang berarti, mudah dicari.";else->"Mulai dari satu pikiran." },
                if(query.isNotBlank()) "Coba kata lain, atau ubah filter tulisan." else when(collection) { "trash"->"Tulisan yang kamu hapus akan berada di sini.";"archive"->"Arsipkan tulisan dari menu catatan. Kamu bisa memulihkannya kapan saja.";"favorites"->"Tandai tulisan dengan bintang dari menu catatan.";else->"Ide singkat, rencana kecil, atau cerita hari ini. Tidak perlu sempurna." },
                icon=if(collection=="trash") Icons.Outlined.DeleteOutline else Icons.Outlined.EditNote,
                action=if(collection=="all" && query.isBlank()) {{ TextButton(onClick={createSheet=true}) { Text("Tulis catatan pertama") } }} else null) } }
            else {
                item { Row(Modifier.padding(horizontal=24.dp),verticalAlignment=Alignment.CenterVertically) {
                    Text(if(query.isNotBlank()) "Hasil pencarian" else "${name} · ${notes.size}",style=MaterialTheme.typography.titleSmall,modifier=Modifier.weight(1f))
                    IconButton(onClick=onSort) { Icon(if(state.settings.oldest) Icons.Outlined.North else Icons.Outlined.South,if(state.settings.oldest) "Urutkan terbaru" else "Urutkan terlama") }
                } }
                items(notes,key={it.id},contentType={it.kind}) { note -> Box(Modifier.padding(horizontal=24.dp)) { NoteCard(note,state.folders.find { it.id==note.folderId }?.name) { onOpen(note) } } }
            }
        }
        if(collection!in listOf("trash","archive")) FloatingActionButton(onClick={createSheet=true},modifier=Modifier.align(Alignment.BottomEnd).padding(24.dp),containerColor=MaterialTheme.colorScheme.primary,contentColor=MaterialTheme.colorScheme.onPrimary) { Icon(Icons.Outlined.Add,"Buat catatan") }
    }
    if(createSheet) ModalBottomSheet(onDismissRequest={createSheet=false}) {
        Column(Modifier.fillMaxWidth().padding(horizontal=24.dp).navigationBarsPadding().padding(bottom=24.dp),verticalArrangement=Arrangement.spacedBy(8.dp)) {
            Text("Apa yang ingin kamu tulis?",style=MaterialTheme.typography.headlineSmall)
            Text("Mulai sederhana. Aster menyimpannya otomatis.",style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))
            CreateRow(Icons.Outlined.Description,"Catatan kosong","Tangkap ide dan cerita sehari-hari") { createSheet=false;onCreate("note") }
            CreateRow(Icons.Outlined.Checklist,"Checklist","Beri ruang untuk rencana kecil") { createSheet=false;onCreate("checklist") }
            CreateRow(Icons.Outlined.AutoAwesome,"Refleksi bebas","Tulis lebih dalam, dengan mood opsional") { createSheet=false;onCreate("reflection") }
        }
    }
}
@Composable private fun CreateRow(icon: androidx.compose.ui.graphics.vector.ImageVector,title: String,body: String,onClick: ()->Unit) {
    Surface(onClick=onClick,shape=androidx.compose.foundation.shape.RoundedCornerShape(12.dp),color=MaterialTheme.colorScheme.surfaceContainerLow) {
        Row(Modifier.fillMaxWidth().padding(16.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)) {
            Icon(icon,null,tint=MaterialTheme.colorScheme.primary)
            Column(Modifier.weight(1f)) { Text(title,style=MaterialTheme.typography.titleSmall);Text(body,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
            Icon(Icons.Outlined.ChevronRight,null)
        }
    }
}
