package com.wynn.jurnalbintang.ui

import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.*
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.wynn.jurnalbintang.data.*
import com.wynn.jurnalbintang.platform.Documents
import kotlinx.coroutines.launch

@Composable fun EditorScreen(vm: EditorViewModel,folders: List<Folder>,onBack: ()->Unit) {
    val session by vm.session.collectAsStateWithLifecycle()
    val error by vm.loadError.collectAsStateWithLifecycle()
    if(session==null) {
        Column(Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding()) { BackHeader("Membuka tulisan",onBack);Box(Modifier.padding(24.dp)) { if(error!=null) ErrorNotice(error!!,vm::load) else CircularProgressIndicator() } }
    } else EditorContent(vm,session!!,folders,onBack)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun EditorContent(vm: EditorViewModel,session: DraftSession,folders: List<Folder>,onBack: ()->Unit) {
    val state by session.state.collectAsStateWithLifecycle()
    val n=state.note
    val context=LocalContext.current
    val owner=LocalLifecycleOwner.current
    val scope=rememberCoroutineScope()
    val keyboard=LocalSoftwareKeyboardController.current
    val focus=LocalFocusManager.current
    val snackbar=remember { SnackbarHostState() }
    var menu by remember { mutableStateOf(false) }
    var organize by rememberSaveable { mutableStateOf(false) }
    var delete by rememberSaveable { mutableStateOf(false) }
    var closing by remember { mutableStateOf(false) }
    var tagInput by rememberSaveable { mutableStateOf("") }
    var deeper by rememberSaveable { mutableStateOf(false) }
    val photoBusy by vm.photoBusy.collectAsStateWithLifecycle()
    val picker=rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri -> if(uri!=null) vm.attach(context,uri) }
    val close: ()->Unit={ if(!closing && !photoBusy) { closing=true;focus.clearFocus();keyboard?.hide();scope.launch { if(vm.flush()) onBack();closing=false } } }
    BackHandler { close() }
    DisposableEffect(owner,vm) {
        val observer=LifecycleEventObserver { _,event -> if(event==Lifecycle.Event.ON_STOP) vm.onBackground() }
        owner.lifecycle.addObserver(observer)
        onDispose { owner.lifecycle.removeObserver(observer) }
    }
    LaunchedEffect(vm) { vm.messages.collect { snackbar.showSnackbar(it) } }
    Scaffold(contentWindowInsets=WindowInsets.safeDrawing,snackbarHost={SnackbarHost(snackbar)},topBar={
        Column(Modifier.statusBarsPadding()) {
            BackHeader(kindLabel(n.kind),close) {
                if(closing || photoBusy) CircularProgressIndicator(Modifier.padding(12.dp).size(24.dp),strokeWidth=2.dp)
                else if(!n.trashed) IconButton(onClick={vm.edit { it.copy(favorite=!it.favorite) }}) { Icon(if(n.favorite) Icons.Outlined.Star else Icons.Outlined.StarOutline,if(n.favorite) "Hapus favorit" else "Tandai favorit",tint=MaterialTheme.colorScheme.primary) }
                Box {
                    IconButton(onClick={menu=true},enabled=!closing && !photoBusy) { Icon(Icons.Outlined.MoreHoriz,"Menu catatan") }
                    DropdownMenu(expanded=menu,onDismissRequest={menu=false}) {
                        if(!n.trashed) {
                            DropdownMenuItem(text={Text(if(n.pinned) "Lepas sematan" else "Sematkan")},leadingIcon={Icon(Icons.Outlined.PushPin,null)},onClick={menu=false;vm.edit { it.copy(pinned=!it.pinned) }})
                            DropdownMenuItem(text={Text("Folder & tag")},leadingIcon={Icon(Icons.Outlined.FolderOpen,null)},onClick={menu=false;organize=true})
                            DropdownMenuItem(text={Text(if(n.image==null) "Tambahkan gambar" else "Ganti gambar")},leadingIcon={Icon(Icons.Outlined.Image,null)},onClick={menu=false;picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))})
                            DropdownMenuItem(text={Text(if(n.archived) "Kembalikan dari arsip" else "Arsipkan")},leadingIcon={Icon(Icons.Outlined.Archive,null)},onClick={menu=false;vm.edit { it.copy(archived=!it.archived,pinned=false) };close()})
                        } else DropdownMenuItem(text={Text("Pulihkan dari Sampah")},leadingIcon={Icon(Icons.Outlined.Restore,null)},onClick={menu=false;vm.edit { it.copy(trashed=false) };close()})
                        DropdownMenuItem(text={Text("Bagikan teks")},leadingIcon={Icon(Icons.Outlined.Share,null)},onClick={menu=false;runCatching { Documents.share(context,n) }.onFailure { vm.messages.tryEmit("Belum ada aplikasi untuk berbagi teks.") }})
                        DropdownMenuItem(text={Text(if(n.trashed) "Hapus permanen" else "Pindahkan ke Sampah",color=MaterialTheme.colorScheme.error)},leadingIcon={Icon(Icons.Outlined.DeleteOutline,null)},onClick={menu=false;delete=true})
                    }
                }
            }
            Row(Modifier.fillMaxWidth().padding(start=24.dp,end=24.dp,bottom=12.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                Icon(if(state.error!=null) Icons.Outlined.ErrorOutline else if(state.saving) Icons.Outlined.Sync else Icons.Outlined.CheckCircleOutline,null,Modifier.size(14.dp),tint=if(state.error!=null) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
                Text(if(state.error!=null) "Belum tersimpan" else if(state.saving) "Menyimpan…" else if(state.stored) "Tersimpan di perangkat" else "Draf kosong",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant,modifier=Modifier.semantics { liveRegion=LiveRegionMode.Polite })
                Spacer(Modifier.weight(1f))
                Text("${wordCount(n.body)+n.items.sumOf { wordCount(it.text) }} kata",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
            }
            HorizontalDivider(color=MaterialTheme.colorScheme.outlineVariant)
        }
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding).imePadding().verticalScroll(rememberScrollState()).padding(horizontal=24.dp).padding(top=24.dp,bottom=40.dp),verticalArrangement=Arrangement.spacedBy(20.dp)) {
            if(state.error!=null) ErrorNotice(state.error!!) { scope.launch { vm.flush() } }
            if(n.trashed || n.archived) Surface(color=MaterialTheme.colorScheme.secondaryContainer,shape=RoundedCornerShape(12.dp)) { Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically) { Text(if(n.trashed) "Tulisan ini berada di Sampah." else "Tulisan ini diarsipkan.",style=MaterialTheme.typography.bodySmall,modifier=Modifier.weight(1f));TextButton(onClick={vm.edit { if(it.trashed) it.copy(trashed=false) else it.copy(archived=false) };close()}) { Text("Pulihkan") } } }
            if(n.prompt.isNotBlank()) {
                Text(n.prompt,style=MaterialTheme.typography.headlineMedium)
                val prompt=Prompts.all.find { it.question==n.prompt }
                if(prompt!=null) {
                    TextButton(onClick={deeper=!deeper},contentPadding=PaddingValues(0.dp)) { Icon(if(deeper) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore,null);Spacer(Modifier.width(8.dp));Text(if(deeper) "Tutup pendalaman" else "Bantu aku menggali lebih dalam") }
                    if(deeper) Surface(color=MaterialTheme.colorScheme.primaryContainer,shape=RoundedCornerShape(12.dp)) { Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) { prompt.followUps.forEach { Text(it,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onPrimaryContainer) } } }
                }
            }
            if(n.kind!="reflection" || n.prompt.isBlank()) BasicTextField(value=n.title,onValueChange={value -> if(value.length<=500) vm.edit { it.copy(title=value) }},enabled=!closing && !n.trashed,
                textStyle=MaterialTheme.typography.headlineMedium.copy(color=MaterialTheme.colorScheme.onSurface),cursorBrush=SolidColor(MaterialTheme.colorScheme.primary),modifier=Modifier.fillMaxWidth().testTag("editor-title").semantics { contentDescription="Judul catatan" },
                decorationBox={inner -> Box { if(n.title.isEmpty()) Text(if(n.kind=="reflection") "Cerita hari ini" else "Judul catatan",style=MaterialTheme.typography.headlineMedium,color=MaterialTheme.colorScheme.onSurfaceVariant);inner() } })
            Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Outlined.CalendarToday,null,Modifier.size(16.dp),tint=MaterialTheme.colorScheme.onSurfaceVariant)
                Text(dateLabel(n.createdAt),style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
                if(!n.trashed && (n.folderId!=null || n.tags.isNotEmpty())) TextButton(onClick={organize=true}) { Text(listOfNotNull(folders.find { it.id==n.folderId }?.name,n.tags.firstOrNull()?.let { "#$it" }).joinToString(" · "),maxLines=1,overflow=androidx.compose.ui.text.style.TextOverflow.Ellipsis) }
            }
            if(n.kind=="reflection") MoodPicker(n.mood,enabled=!n.trashed && !closing) { mood -> if(!n.trashed) vm.edit { it.copy(mood=mood) } }
            if(n.kind=="checklist") {
                n.items.forEach { item -> key(item.id) {
                    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically) {
                        Checkbox(checked=item.done,onCheckedChange={done -> vm.edit { it.copy(items=it.items.map { row -> if(row.id==item.id) row.copy(done=done) else row }) }},enabled=!n.trashed && !closing,modifier=Modifier.semantics { contentDescription="Selesai: ${item.text.ifBlank { "Item checklist" }}" })
                        BasicTextField(value=item.text,onValueChange={value -> if(value.length<=2000) vm.edit { it.copy(items=it.items.map { row -> if(row.id==item.id) row.copy(text=value) else row }) }},enabled=!n.trashed && !closing,textStyle=MaterialTheme.typography.bodyLarge.copy(color=MaterialTheme.colorScheme.onSurface,textDecoration=if(item.done) TextDecoration.LineThrough else TextDecoration.None),modifier=Modifier.weight(1f).padding(vertical=12.dp).semantics { contentDescription="Isi item checklist" },decorationBox={inner -> Box { if(item.text.isEmpty()) Text("Tulis satu hal…",color=MaterialTheme.colorScheme.onSurfaceVariant);inner() } })
                        if(!n.trashed) IconButton(onClick={vm.edit { it.copy(items=it.items.filterNot { row -> row.id==item.id }) }}) { Icon(Icons.Outlined.Close,"Hapus item checklist") }
                    }
                } }
                if(!n.trashed && n.items.size<500) TextButton(onClick={vm.edit { it.copy(items=it.items+CheckItem()) }}) { Icon(Icons.Outlined.Add,null);Spacer(Modifier.width(8.dp));Text("Tambah item") }
            }
            BasicTextField(value=n.body,onValueChange={value -> if(value.length<=BackupCodec.MAX_BODY) vm.edit { it.copy(body=value) } else vm.messages.tryEmit("Batas satu tulisan 200.000 karakter. Buat catatan lanjutan untuk meneruskan.") },enabled=!closing && !n.trashed,
                textStyle=MaterialTheme.typography.bodyLarge.copy(fontSize=17.sp,lineHeight=29.sp,color=MaterialTheme.colorScheme.onSurface),cursorBrush=SolidColor(MaterialTheme.colorScheme.primary),
                modifier=Modifier.fillMaxWidth().heightIn(min=if(n.kind=="checklist") 100.dp else 260.dp).testTag("editor-body").semantics { contentDescription="Isi tulisan" },
                decorationBox={inner -> Box { if(n.body.isEmpty()) Text(if(n.kind=="reflection") "Mulai dari yang sedang kamu rasakan…" else if(n.kind=="checklist") "Tambahkan keterangan…" else "Tuangkan pikiranmu di sini…",style=MaterialTheme.typography.bodyLarge.copy(fontSize=17.sp,lineHeight=29.sp),color=MaterialTheme.colorScheme.onSurfaceVariant);inner() } })
            n.image?.let { data -> Column(verticalArrangement=Arrangement.spacedBy(8.dp)) { NotePhoto(data);if(!n.trashed) TextButton(onClick={vm.edit { it.copy(image=null) }}) { Icon(Icons.Outlined.Close,null);Spacer(Modifier.width(8.dp));Text("Hapus gambar") } } }
            if(n.tags.isNotEmpty()) Text(n.tags.joinToString("  ") { "#$it" },style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.primary)
        }
    }
    if(organize) ModalBottomSheet(onDismissRequest={organize=false}) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(horizontal=24.dp).padding(bottom=32.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
            Text("Folder & tag",style=MaterialTheme.typography.headlineSmall)
            Text("Folder",style=MaterialTheme.typography.titleSmall)
            Column {
                FolderChoice("Tanpa folder",n.folderId==null) { vm.edit { it.copy(folderId=null) } }
                folders.forEach { folder -> FolderChoice(folder.name,n.folderId==folder.id) { vm.edit { it.copy(folderId=folder.id) } } }
            }
            if(folders.isEmpty()) Text("Buat folder dari tab Koleksi untuk mengelompokkan tulisan.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
            OutlinedTextField(value=tagInput,onValueChange={tagInput=it.take(80)},label={Text("Tag baru")},singleLine=true,modifier=Modifier.fillMaxWidth(),trailingIcon={IconButton(onClick={val t=tagInput.trim().removePrefix("#").lowercase();if(t.isNotEmpty() && n.tags.size<50) { vm.edit { it.copy(tags=(it.tags+t).distinct()) };tagInput="" }},enabled=tagInput.isNotBlank() && n.tags.size<50) { Icon(Icons.Outlined.Add,"Tambah tag") }})
            FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp)) { n.tags.forEach { tag -> InputChip(selected=true,onClick={vm.edit { it.copy(tags=it.tags-tag) }},label={Text("#$tag")},trailingIcon={Icon(Icons.Outlined.Close,"Hapus tag $tag",Modifier.size(16.dp))},modifier=Modifier.heightIn(min=48.dp)) } }
            Button(onClick={organize=false},modifier=Modifier.fillMaxWidth()) { Text("Selesai") }
        }
    }
    if(delete) AlertDialog(onDismissRequest={delete=false},title={Text(if(n.trashed) "Hapus permanen?" else "Pindahkan ke Sampah?")},text={Text(if(n.trashed) "Tulisan ini akan dihapus dari perangkat dan tidak bisa dipulihkan. Cadangan yang pernah kamu buat tidak ikut dihapus." else "Tulisan ini bisa dipulihkan dari Koleksi → Sampah.")},confirmButton={TextButton(onClick={delete=false;if(n.trashed) { closing=true;scope.launch { if(vm.deleteForever()) onBack();closing=false } } else { vm.edit { it.copy(trashed=true,pinned=false) };close() }}) { Text(if(n.trashed) "Hapus permanen" else "Pindahkan",color=MaterialTheme.colorScheme.error) }},dismissButton={TextButton(onClick={delete=false}) { Text("Batal") }})
}
@Composable private fun FolderChoice(name: String,selected: Boolean,onClick: ()->Unit) {
    Surface(onClick=onClick,color=if(selected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface,shape=RoundedCornerShape(12.dp)) { Row(Modifier.fillMaxWidth().padding(12.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(12.dp)) { RadioButton(selected=selected,onClick=null);Text(name,style=MaterialTheme.typography.bodyMedium) } }
}
