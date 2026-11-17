package com.wynn.jurnalbintang.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import com.wynn.jurnalbintang.data.*

@Composable fun CollectionsScreen(state: LibraryState,vm: AppViewModel,onCollection: (String)->Unit) {
    var editing by rememberSaveable { mutableStateOf<String?>(null) }
    var name by rememberSaveable { mutableStateOf("") }
    var remove by rememberSaveable { mutableStateOf<String?>(null) }
    val folder=state.folders.find { it.id==editing }
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(bottom=32.dp),verticalArrangement=Arrangement.spacedBy(16.dp)) {
        item { BrandHeader();Column(Modifier.padding(horizontal=24.dp)) { PageHeading("Semua punya tempat.","Rapikan tulisan dengan caramu sendiri.") } }
        item { Column(Modifier.padding(horizontal=24.dp),verticalArrangement=Arrangement.spacedBy(4.dp)) {
            CollectionRow(Icons.Outlined.StarOutline,"Favorit",state.notes.count { it.favorite && !it.archived && !it.trashed }) { onCollection("favorites") }
            CollectionRow(Icons.Outlined.Archive,"Arsip",state.notes.count { it.archived && !it.trashed }) { onCollection("archive") }
            CollectionRow(Icons.Outlined.DeleteOutline,"Sampah",state.notes.count { it.trashed }) { onCollection("trash") }
        } }
        item { SectionTitle("Folder pribadimu",Modifier.padding(horizontal=24.dp)) { IconButton(onClick={name="";editing="new"}) { Icon(Icons.Outlined.CreateNewFolder,"Buat folder") } } }
        if(state.folders.isEmpty()) item { Box(Modifier.padding(horizontal=24.dp)) { EmptyState("Ruang untuk setiap cerita.","Buat folder untuk pekerjaan, ide, atau hal pribadi. Catatan bisa dipindahkan dari editor.",Icons.Outlined.FolderOpen) { OutlinedButton(onClick={name="";editing="new"}) { Text("Buat folder") } } } }
        items(state.folders,key={it.id}) { f ->
            Surface(shape=RoundedCornerShape(16.dp),color=MaterialTheme.colorScheme.surface,modifier=Modifier.padding(horizontal=24.dp).fillMaxWidth()) {
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Row(Modifier.weight(1f).clickable { onCollection(f.id) }.padding(20.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)) {
                        Icon(Icons.Outlined.FolderOpen,null,tint=MaterialTheme.colorScheme.primary)
                        Column { Text(f.name,style=MaterialTheme.typography.titleMedium);Text("${state.notes.count { it.folderId==f.id && !it.trashed && !it.archived }} tulisan",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
                    }
                    IconButton(onClick={name=f.name;editing=f.id},modifier=Modifier.padding(end=8.dp)) { Icon(Icons.Outlined.MoreHoriz,"Kelola folder ${f.name}") }
                }
            }
        }
    }
    if(editing!=null) AlertDialog(onDismissRequest={editing=null},title={Text(if(folder==null) "Folder baru" else "Kelola folder")},
        text={Column(verticalArrangement=Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(value=name,onValueChange={name=it.take(80)},label={Text("Nama folder")},singleLine=true)
            if(folder!=null) TextButton(onClick={remove=folder.id;editing=null}) { Icon(Icons.Outlined.DeleteOutline,null);Spacer(Modifier.width(8.dp));Text("Hapus folder",color=MaterialTheme.colorScheme.error) }
        }},confirmButton={TextButton(onClick={vm.folder(name,folder) { editing=null }},enabled=name.isNotBlank()) { Text("Simpan") }},dismissButton={TextButton(onClick={editing=null}) { Text("Batal") }})
    state.folders.find { it.id==remove }?.let { f -> AlertDialog(onDismissRequest={remove=null},title={Text("Hapus folder?")},text={Text("Folder “${f.name}” akan dihapus. Semua catatannya tetap ada di Catatan; isi tulisan tidak dihapus.")},confirmButton={TextButton(onClick={vm.deleteFolder(f);remove=null}) { Text("Hapus folder") }},dismissButton={TextButton(onClick={remove=null}) { Text("Batal") }}) }
}
@Composable private fun CollectionRow(icon: androidx.compose.ui.graphics.vector.ImageVector,title: String,count: Int,onClick: ()->Unit) {
    Surface(onClick=onClick,shape=RoundedCornerShape(12.dp),color=MaterialTheme.colorScheme.surface) {
        Row(Modifier.fillMaxWidth().padding(20.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)) {
            Icon(icon,null,tint=MaterialTheme.colorScheme.primary)
            Text(title,style=MaterialTheme.typography.titleMedium,modifier=Modifier.weight(1f))
            Text(count.toString(),style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant)
            Icon(Icons.Outlined.ChevronRight,null,tint=MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
