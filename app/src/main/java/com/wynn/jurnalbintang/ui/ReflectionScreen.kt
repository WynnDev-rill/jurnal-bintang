package com.wynn.jurnalbintang.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
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
import java.time.LocalDate

@Composable fun ReflectionScreen(state: LibraryState,onPrompt: (Prompt)->Unit,onFree: ()->Unit,onOpen: (Note)->Unit) {
    var category by rememberSaveable { mutableStateOf("Semua") }
    val today=LocalDate.now()
    var shift by rememberSaveable(today.toEpochDay()) { mutableIntStateOf(0) }
    val daily=Prompts.daily(today.plusDays(shift.toLong()))
    val reflections=remember(state.notes) { state.notes.filter { it.kind=="reflection" && !it.trashed && !it.archived }.sortedByDescending { it.updatedAt } }
    val prompts=remember(category) { Prompts.all.filter { category=="Semua" || it.category==category } }
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(bottom=32.dp),verticalArrangement=Arrangement.spacedBy(16.dp)) {
        item { BrandHeader();Column(Modifier.padding(horizontal=24.dp)) { PageHeading("Kembali ke dirimu.","Sejenak berhenti. Dengarkan yang terasa.") } }
        item {
            Surface(color=MaterialTheme.colorScheme.primary,contentColor=MaterialTheme.colorScheme.onPrimary,shape=RoundedCornerShape(16.dp),modifier=Modifier.padding(horizontal=24.dp).fillMaxWidth()) {
                Column(Modifier.padding(24.dp),verticalArrangement=Arrangement.spacedBy(16.dp)) {
                    Row(verticalAlignment=Alignment.CenterVertically) {
                        Text("Pertanyaan hari ini",style=MaterialTheme.typography.titleSmall,modifier=Modifier.weight(1f))
                        IconButton(onClick={shift++}) { Icon(Icons.Outlined.Refresh,"Ganti pertanyaan") }
                    }
                    Text(daily.question,style=MaterialTheme.typography.headlineMedium)
                    Text("Tak perlu jawaban sempurna. Cukup jujur pada dirimu.",style=MaterialTheme.typography.bodyMedium)
                    Button(onClick={onPrompt(daily)},colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.onPrimary,contentColor=MaterialTheme.colorScheme.primary),contentPadding=PaddingValues(horizontal=20.dp,vertical=14.dp)) { Text("Mulai menulis");Spacer(Modifier.width(12.dp));Icon(Icons.Outlined.EditNote,null) }
                }
            }
        }
        item { Row(Modifier.padding(horizontal=24.dp),verticalAlignment=Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) { Text("Ingin bercerita bebas?",style=MaterialTheme.typography.titleSmall);Text("Mulai tanpa pertanyaan.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
            OutlinedButton(onClick=onFree) { Text("Tulis bebas") }
        } }
        if(reflections.isNotEmpty()) {
            item { SectionTitle("Tulisan refleksimu",Modifier.padding(horizontal=24.dp)) }
            items(reflections.take(3),key={"r-${it.id}"}) { note -> Box(Modifier.padding(horizontal=24.dp)) { NoteCard(note,null) { onOpen(note) } } }
            if(reflections.size>3) item { Text("${reflections.size} refleksi tersimpan. Temukan semuanya lewat filter Refleksi di Catatan.",Modifier.padding(horizontal=24.dp),style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
        }
        item { Column {
            SectionTitle("Temukan pertanyaanmu",Modifier.padding(horizontal=24.dp))
            Text("Pilih yang terasa dekat hari ini.",Modifier.padding(horizontal=24.dp,vertical=4.dp),style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant)
            Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal=24.dp),horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                (listOf("Semua")+Prompts.all.map { it.category }.distinct()).forEach { name -> FilterChip(selected=category==name,onClick={category=name},label={Text(name)},modifier=Modifier.heightIn(min=48.dp)) }
            }
        } }
        items(prompts,key={"p-${it.id}"}) { prompt ->
            Surface(onClick={onPrompt(prompt)},color=MaterialTheme.colorScheme.surface,shape=RoundedCornerShape(12.dp),modifier=Modifier.padding(horizontal=24.dp).fillMaxWidth()) {
                Row(Modifier.padding(20.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)) {
                    Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(8.dp)) {
                        Text(prompt.question,style=MaterialTheme.typography.titleMedium)
                        Text(prompt.category+" · 2 pertanyaan pendalaman",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Icon(Icons.Outlined.ChevronRight,null,tint=MaterialTheme.colorScheme.primary)
                }
            }
        }
        item { Text("Kamu boleh melewati pertanyaan apa pun. Tulis sebebas dan seperlahan yang kamu butuhkan.",Modifier.padding(horizontal=24.dp,vertical=8.dp),style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
    }
}
