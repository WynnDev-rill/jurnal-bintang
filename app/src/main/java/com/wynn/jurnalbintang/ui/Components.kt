package com.wynn.jurnalbintang.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.wynn.jurnalbintang.data.*
import com.wynn.jurnalbintang.platform.Photos
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.*
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.*

@Composable fun AsterMark(modifier: Modifier=Modifier,color: Color=MaterialTheme.colorScheme.primary) {
    Canvas(modifier.size(32.dp)) {
        val radius=size.minDimension*0.4f
        for(i in 0..7) {
            val angle=i*Math.PI/4
            val dx=cos(angle).toFloat();val dy=sin(angle).toFloat()
            drawLine(color,center+androidx.compose.ui.geometry.Offset(dx*radius*0.25f,dy*radius*0.25f),center+androidx.compose.ui.geometry.Offset(dx*radius,dy*radius),size.minDimension*0.085f,cap=androidx.compose.ui.graphics.StrokeCap.Round)
        }
        drawCircle(color,size.minDimension*0.08f)
    }
}
@Composable fun BrandHeader(onSettings: (() -> Unit)?=null) {
    Row(Modifier.fillMaxWidth().padding(horizontal=24.dp,vertical=12.dp),verticalAlignment=Alignment.CenterVertically) {
        AsterMark();Spacer(Modifier.width(10.dp))
        Text("aster",style=MaterialTheme.typography.headlineSmall,modifier=Modifier.weight(1f))
        onSettings?.let { IconButton(onClick=it) { Icon(Icons.Outlined.Settings,"Buka setelan") } }
    }
}
@Composable fun PageHeading(title: String,subtitle: String,modifier: Modifier=Modifier) {
    Column(modifier) { Text(title,style=MaterialTheme.typography.headlineLarge);Spacer(Modifier.height(8.dp));Text(subtitle,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant) }
}
@Composable fun SectionTitle(title: String,modifier: Modifier=Modifier,action: (@Composable () -> Unit)?=null) {
    Row(modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically) {
        Text(title,style=MaterialTheme.typography.titleMedium,modifier=Modifier.weight(1f));action?.invoke()
    }
}
@Composable fun BackHeader(title: String,onBack: ()->Unit,actions: @Composable RowScope.()->Unit={}) {
    Row(Modifier.fillMaxWidth().padding(horizontal=8.dp,vertical=4.dp),verticalAlignment=Alignment.CenterVertically) {
        IconButton(onClick=onBack) { Icon(Icons.AutoMirrored.Outlined.ArrowBack,"Kembali") }
        Text(title,style=MaterialTheme.typography.titleMedium,modifier=Modifier.weight(1f),maxLines=1,overflow=TextOverflow.Ellipsis)
        actions()
    }
}
@Composable fun EmptyState(title: String,body: String,icon: ImageVector=Icons.Outlined.EditNote,action: (@Composable ()->Unit)?=null) {
    Column(Modifier.fillMaxWidth().padding(vertical=32.dp,horizontal=12.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(12.dp)) {
        Surface(shape=RoundedCornerShape(16.dp),color=MaterialTheme.colorScheme.primaryContainer) { Icon(icon,null,Modifier.padding(20.dp).size(32.dp),tint=MaterialTheme.colorScheme.onPrimaryContainer) }
        Text(title,style=MaterialTheme.typography.headlineSmall,textAlign=androidx.compose.ui.text.style.TextAlign.Center)
        Text(body,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant,textAlign=androidx.compose.ui.text.style.TextAlign.Center)
        action?.invoke()
    }
}
@Composable fun ErrorNotice(message: String,retry: ()->Unit) {
    Surface(color=MaterialTheme.colorScheme.errorContainer,shape=RoundedCornerShape(12.dp),modifier=Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Text(message,color=MaterialTheme.colorScheme.onErrorContainer,style=MaterialTheme.typography.bodyMedium,modifier=Modifier.semantics { liveRegion=LiveRegionMode.Polite })
            TextButton(onClick=retry) { Text("Coba lagi") }
        }
    }
}
fun dateLabel(timestamp: Long): String {
    val date=Instant.ofEpochMilli(timestamp).atZone(ZoneId.systemDefault()).toLocalDate()
    return when(date) { LocalDate.now()->"Hari ini";LocalDate.now().minusDays(1)->"Kemarin";else->date.format(DateTimeFormatter.ofPattern("d MMM yyyy",Locale.forLanguageTag("id-ID"))) }
}
fun noteIcon(n: Note) = when(n.kind) { "checklist"->Icons.Outlined.Checklist;"reflection"->Icons.Outlined.AutoAwesome;else->Icons.Outlined.Description }
fun kindLabel(kind: String) = when(kind) { "checklist"->"Checklist";"reflection"->"Refleksi";else->"Catatan" }

@Composable fun NoteCard(note: Note,folder: String?,onClick: ()->Unit) {
    Card(onClick=onClick,shape=RoundedCornerShape(16.dp),colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surface),modifier=Modifier.fillMaxWidth()) {
        Column(Modifier.padding(20.dp),verticalArrangement=Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                Icon(noteIcon(note),null,Modifier.size(18.dp),tint=MaterialTheme.colorScheme.primary)
                Text(kindLabel(note.kind),style=MaterialTheme.typography.labelMedium,color=MaterialTheme.colorScheme.onSurfaceVariant,modifier=Modifier.weight(1f))
                if(note.pinned) Icon(Icons.Outlined.PushPin,"Disematkan",Modifier.size(16.dp),tint=MaterialTheme.colorScheme.primary)
                if(note.favorite) Icon(Icons.Outlined.Star,"Favorit",Modifier.size(16.dp),tint=MaterialTheme.colorScheme.primary)
            }
            Text(note.displayTitle,style=if(note.kind=="reflection") MaterialTheme.typography.headlineSmall else MaterialTheme.typography.titleMedium,maxLines=2,overflow=TextOverflow.Ellipsis)
            if(note.kind=="checklist" && note.items.isNotEmpty()) {
                note.items.take(2).forEach { item -> Row(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalAlignment=Alignment.CenterVertically) {
                    Icon(if(item.done) Icons.Outlined.CheckBox else Icons.Outlined.CheckBoxOutlineBlank,null,Modifier.size(16.dp),tint=MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(item.text,style=MaterialTheme.typography.bodyMedium,maxLines=1,overflow=TextOverflow.Ellipsis,color=MaterialTheme.colorScheme.onSurfaceVariant)
                } }
            } else if(note.body.isNotBlank()) Text(note.body,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant,maxLines=3,overflow=TextOverflow.Ellipsis)
            Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                val metadata=listOfNotNull(dateLabel(note.updatedAt),folder,note.mood?.let { moodLabel(it) },note.tags.firstOrNull()?.let { "#$it" })
                Text(metadata.joinToString(" · "),style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant,modifier=Modifier.weight(1f),maxLines=1,overflow=TextOverflow.Ellipsis)
                if(note.image!=null) Icon(Icons.Outlined.Image,"Memiliki gambar",Modifier.size(16.dp),tint=MaterialTheme.colorScheme.onSurfaceVariant)
                if(note.kind=="checklist") Text("${note.items.count { it.done }}/${note.items.size}",style=MaterialTheme.typography.labelMedium,color=MaterialTheme.colorScheme.primary)
            }
        }
    }
}
fun moodLabel(key: String) = when(key) { "great"->"Hebat";"good"->"Baik";"okay"->"Biasa";"meh"->"Kurang";else->"Berat" }
fun moodIcon(key: String) = when(key) { "great"->Icons.Outlined.SentimentVerySatisfied;"good"->Icons.Outlined.SentimentSatisfied;"okay"->Icons.Outlined.SentimentNeutral;"meh"->Icons.Outlined.SentimentDissatisfied;else->Icons.Outlined.SentimentVeryDissatisfied }
@Composable fun MoodPicker(mood: String?,enabled: Boolean=true,onMood: (String?)->Unit) {
    Column(verticalArrangement=Arrangement.spacedBy(8.dp)) {
        Text("Bagaimana perasaanmu?",style=MaterialTheme.typography.titleSmall)
        Text("Boleh dilewati. Semua perasaan punya ruang.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
        FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp)) {
            listOf("great","good","okay","meh","hard").forEach { key ->
                FilterChip(enabled=enabled,selected=mood==key,onClick={onMood(if(mood==key) null else key)},label={Text(moodLabel(key))},leadingIcon={Icon(moodIcon(key),null,Modifier.size(20.dp))},modifier=Modifier.heightIn(min=48.dp))
            }
        }
    }
}
@Composable fun NotePhoto(data: String) {
    val bitmap by produceState<android.graphics.Bitmap?>(null,data) { value=withContext(Dispatchers.IO) { Photos.bitmap(data) } }
    bitmap?.let { Image(it.asImageBitmap(),"Gambar terlampir",modifier=Modifier.fillMaxWidth().heightIn(max=320.dp),contentScale=androidx.compose.ui.layout.ContentScale.Fit) }
}
