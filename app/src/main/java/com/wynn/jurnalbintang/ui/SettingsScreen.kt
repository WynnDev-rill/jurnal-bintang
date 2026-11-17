package com.wynn.jurnalbintang.ui

import android.Manifest
import android.content.Intent
import android.os.Build
import android.provider.Settings as AndroidSettings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import com.wynn.jurnalbintang.BuildConfig
import com.wynn.jurnalbintang.platform.Reminders
import java.time.LocalDate
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable fun SettingsScreen(state: LibraryState,vm: AppViewModel) {
    val context=LocalContext.current
    val s=state.settings
    val busy by vm.dataBusy.collectAsState()
    val pending by vm.pendingImport.collectAsState()
    var clock by rememberSaveable { mutableStateOf(false) }
    var about by rememberSaveable { mutableStateOf(false) }
    val json=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri -> if(uri!=null) vm.export(uri,false) }
    val markdown=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/markdown")) { uri -> if(uri!=null) vm.export(uri,true) }
    val importer=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri -> if(uri!=null) vm.readBackup(uri) }
    val notifications=rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if(granted && Reminders.permitted(context)) vm.settings { it.copy(reminder=true) }
        else vm.messages.tryEmit("Izin notifikasi belum aktif. Kamu bisa mengaktifkannya di setelan Android.")
    }
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(bottom=40.dp),verticalArrangement=Arrangement.spacedBy(20.dp)) {
        item { BrandHeader();Column(Modifier.padding(horizontal=24.dp)) { PageHeading("Nyaman dengan caramu.","Ruang pribadi yang bisa kamu atur sendiri.") } }
        item { SettingsSection("Tampilan") {
            Text("Tema aplikasi",style=MaterialTheme.typography.titleSmall)
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth().padding(top=12.dp)) {
                listOf("system" to "Sistem","light" to "Terang","dark" to "Gelap").forEachIndexed { i,(key,label) -> SegmentedButton(selected=s.theme==key,onClick={vm.settings { it.copy(theme=key) }},shape=SegmentedButtonDefaults.itemShape(i,3)) { Text(label) } }
            }
            Text("Mengikuti ukuran teks dan animasi perangkat.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant,modifier=Modifier.padding(top=12.dp))
        } }
        item { SettingsSection("Privasi") {
            SettingSwitch("Privasi layar","Cegah tangkapan layar dan sembunyikan pratinjau aplikasi.",s.protectScreen) { checked -> vm.settings { it.copy(protectScreen=checked) } }
            HorizontalDivider(Modifier.padding(vertical=16.dp),color=MaterialTheme.colorScheme.outlineVariant)
            Text("Tulisan disimpan di perangkat ini. Tanpa akun, iklan, pelacak, atau sinkronisasi otomatis.",style=MaterialTheme.typography.bodyMedium)
            Text("Aster tidak mengenkripsi database sendiri. Gunakan kunci layar perangkat dan simpan cadangan di tempat tepercaya.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant,modifier=Modifier.padding(top=8.dp))
        } }
        item { SettingsSection("Waktu untuk dirimu") {
            SettingSwitch("Pengingat harian","Undangan lembut untuk menulis, tanpa menampilkan isi jurnal.",s.reminder) { checked ->
                if(!checked) vm.settings { it.copy(reminder=false) }
                else if(Reminders.permitted(context)) vm.settings { it.copy(reminder=true) }
                else if(Build.VERSION.SDK_INT>=33) notifications.launch(Manifest.permission.POST_NOTIFICATIONS)
                else vm.messages.tryEmit("Aktifkan notifikasi Aster di setelan Android terlebih dahulu.")
            }
            Row(Modifier.fillMaxWidth().padding(top=8.dp),verticalAlignment=Alignment.CenterVertically) {
                Text(String.format(Locale.ROOT,"%02d:%02d",s.hour,s.minute),style=MaterialTheme.typography.titleLarge,modifier=Modifier.weight(1f))
                TextButton(onClick={clock=true}) { Text("Atur waktu") }
            }
            Text("Waktu dapat bergeser mengikuti penghemat baterai Android. Setelah paksa berhenti, buka Aster untuk menjadwalkan ulang.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
            if(!Reminders.permitted(context)) TextButton(onClick={context.startActivity(Intent(AndroidSettings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(AndroidSettings.EXTRA_APP_PACKAGE,context.packageName))}) { Text("Buka izin notifikasi") }
        } }
        item { SettingsSection("Tulisanmu tetap milikmu") {
            Text("Cadangkan sebelum mengganti atau menghapus aplikasi. JSON memuat semua tulisan dan gambar; Markdown adalah salinan teks yang mudah dibaca.",style=MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(12.dp))
            DataAction(Icons.Outlined.SaveAlt,"Buat cadangan JSON",!busy) { json.launch("aster-backup-${LocalDate.now()}.json") }
            DataAction(Icons.Outlined.UploadFile,"Impor cadangan Aster",!busy) { importer.launch(arrayOf("application/json","text/plain","application/octet-stream")) }
            DataAction(Icons.Outlined.Article,"Ekspor Markdown",!busy) { markdown.launch("aster-journal-${LocalDate.now()}.md") }
            if(busy) { LinearProgressIndicator(Modifier.fillMaxWidth().padding(vertical=12.dp));Text("Memproses berkas…",style=MaterialTheme.typography.bodySmall) }
            Text("Berkas ekspor tidak dienkripsi. Simpan dengan aman. Impor menggabungkan data, termasuk backup versi web lama; tulisan yang sudah ada tidak ditimpa.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant,modifier=Modifier.padding(top=8.dp))
        } }
        item { Column(Modifier.padding(horizontal=24.dp),verticalArrangement=Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment=Alignment.CenterVertically) { AsterMark();Spacer(Modifier.width(12.dp));Text("Aster Journal",style=MaterialTheme.typography.titleMedium) }
            Text("Versi ${BuildConfig.VERSION_NAME} · ${if(BuildConfig.DEBUG) "APK debug" else "Build release"}",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
            TextButton(onClick={about=true},contentPadding=PaddingValues(0.dp)) { Text("Tentang & lisensi") }
        } }
    }
    if(clock) {
        val time=rememberTimePickerState(s.hour,s.minute,is24Hour=true)
        AlertDialog(onDismissRequest={clock=false},title={Text("Waktu pengingat")},text={TimePicker(state=time)},confirmButton={TextButton(onClick={vm.settings { it.copy(hour=time.hour,minute=time.minute) };clock=false}) { Text("Simpan") }},dismissButton={TextButton(onClick={clock=false}) { Text("Batal") }})
    }
    pending?.let { backup -> AlertDialog(onDismissRequest={if(!busy) vm.pendingImport.value=null},title={Text("Gabungkan cadangan?")},text={Text("${backup.notes.size} tulisan dan ${backup.folders.size} folder ditemukan. Data saat ini tetap ada. Tulisan yang bentrok akan disimpan sebagai salinan; impor yang sama tidak menambah duplikat.")},confirmButton={TextButton(onClick={vm.importPending()},enabled=!busy) { Text("Impor cadangan") }},dismissButton={TextButton(onClick={vm.pendingImport.value=null},enabled=!busy) { Text("Batal") }}) }
    if(about) AlertDialog(onDismissRequest={about=false},title={Text("Tentang Aster")},text={Text("Ruang tenang untuk mencatat dan mengenal diri.\n\nHuruf DM Serif Display dan Plus Jakarta Sans: SIL Open Font License 1.1. Komponen AndroidX dan Material: Apache License 2.0.\n\nAster tidak mengirim isi tulisan ke layanan apa pun. Cadangan lokal adalah tanggung jawab pemilik perangkat.")},confirmButton={TextButton(onClick={about=false}) { Text("Tutup") }})
}
@Composable private fun SettingsSection(title: String,content: @Composable ColumnScope.()->Unit) {
    Column(Modifier.padding(horizontal=24.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
        Text(title,style=MaterialTheme.typography.titleMedium)
        Surface(color=MaterialTheme.colorScheme.surface,shape=RoundedCornerShape(16.dp)) { Column(Modifier.fillMaxWidth().padding(20.dp),content=content) }
    }
}
@Composable private fun SettingSwitch(title: String,body: String,checked: Boolean,onChange: (Boolean)->Unit) {
    Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)) {
        Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(4.dp)) { Text(title,style=MaterialTheme.typography.titleSmall);Text(body,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
        Switch(checked=checked,onCheckedChange=onChange,modifier=Modifier.semantics { contentDescription=title })
    }
}
@Composable private fun DataAction(icon: androidx.compose.ui.graphics.vector.ImageVector,title: String,enabled: Boolean,onClick: ()->Unit) {
    TextButton(onClick=onClick,enabled=enabled,modifier=Modifier.fillMaxWidth(),contentPadding=PaddingValues(vertical=12.dp)) { Icon(icon,null);Spacer(Modifier.width(12.dp));Text(title,Modifier.weight(1f),textAlign=androidx.compose.ui.text.style.TextAlign.Start);Icon(Icons.Outlined.ChevronRight,null) }
}
