package com.wynn.jurnalbintang.platform

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.wynn.jurnalbintang.data.*
import java.io.ByteArrayOutputStream
import java.io.InputStream

fun readBounded(input: InputStream,max: Int): ByteArray {
    val output=ByteArrayOutputStream()
    val buffer=ByteArray(8192)
    while(true) {
        val count=input.read(buffer)
        if(count<0) break
        require(output.size()+count<=max) { "Berkas terlalu besar untuk diproses dengan aman." }
        output.write(buffer,0,count)
    }
    return output.toByteArray()
}
object Documents {
    fun read(context: Context,uri: Uri): Backup {
        val backup=context.contentResolver.openInputStream(uri)?.use { BackupCodec.decode(String(readBounded(it,BackupCodec.MAX_BYTES),Charsets.UTF_8)) }
            ?: throw IllegalArgumentException("Berkas tidak dapat dibuka. Pilih cadangan lain.")
        for(note in backup.notes) note.image?.let { data ->
            val image=Photos.bitmap(data) ?: throw IllegalArgumentException("Gambar dalam cadangan rusak atau terlalu besar. Data saat ini tidak diubah.")
            image.recycle()
        }
        return backup
    }
    fun write(context: Context,uri: Uri,text: String) {
        val stream=context.contentResolver.openOutputStream(uri,"wt") ?: throw IllegalArgumentException("Tujuan penyimpanan tidak dapat dibuka.")
        stream.use { it.write(text.toByteArray(Charsets.UTF_8));it.flush() }
    }
    fun share(context: Context,note: Note) {
        val text=BackupCodec.markdown(Backup(listOf(note),emptyList()))
        val intent=Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT,note.displayTitle).putExtra(Intent.EXTRA_TEXT,if(text.length<=80_000) text else text.take(80_000)+"\n\n[Bagian akhir dipotong untuk berbagi. Ekspor Markdown untuk tulisan lengkap.]")
        context.startActivity(Intent.createChooser(intent,"Bagikan tulisan"))
    }
}
