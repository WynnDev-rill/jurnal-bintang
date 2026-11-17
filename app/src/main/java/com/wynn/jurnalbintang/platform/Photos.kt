package com.wynn.jurnalbintang.platform

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.wynn.jurnalbintang.data.BackupCodec
import com.wynn.jurnalbintang.data.checkedImageSize
import java.io.ByteArrayOutputStream
import java.util.Base64

object Photos {
    fun read(context: Context,uri: Uri): String {
        val resolver=context.contentResolver
        val bytes=resolver.openInputStream(uri)?.use { readBounded(it,12*1024*1024) } ?: throw IllegalArgumentException("Gambar tidak dapat dibuka.")
        require(bytes.size<=12*1024*1024) { "Pilih gambar maksimal 12 MB." }
        val bounds=BitmapFactory.Options().apply { inJustDecodeBounds=true }
        BitmapFactory.decodeByteArray(bytes,0,bytes.size,bounds)
        require(bounds.outWidth>0 && bounds.outHeight>0) { "Berkas bukan gambar yang didukung." }
        var sample=1
        while(bounds.outWidth/sample>1600 || bounds.outHeight/sample>1600) sample*=2
        val bitmap=BitmapFactory.decodeByteArray(bytes,0,bytes.size,BitmapFactory.Options().apply { inSampleSize=sample }) ?: throw IllegalArgumentException("Gambar tidak dapat diproses.")
        try {
            for(quality in listOf(85,65,45)) {
                val out=ByteArrayOutputStream()
                require(bitmap.compress(Bitmap.CompressFormat.JPEG,quality,out))
                if(out.size()<=BackupCodec.MAX_IMAGE_BYTES) return "data:image/jpeg;base64,"+Base64.getEncoder().encodeToString(out.toByteArray())
            }
            throw IllegalArgumentException("Gambar terlalu rumit. Pilih gambar berukuran lebih kecil.")
        } finally { bitmap.recycle() }
    }
    fun bitmap(data: String): Bitmap? = runCatching {
        val bytes=Base64.getDecoder().decode(data.substringAfter(','))
        val (width,height)=checkedImageSize(bytes)
        var sample=1
        while(width/sample>1600 || height/sample>1600) sample*=2
        BitmapFactory.decodeByteArray(bytes,0,bytes.size,BitmapFactory.Options().apply { inSampleSize=sample })
    }.getOrNull()
}
