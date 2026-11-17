package com.wynn.jurnalbintang.platform

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import java.io.ByteArrayInputStream
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
        val decoded=BitmapFactory.decodeByteArray(bytes,0,bytes.size,BitmapFactory.Options().apply { inSampleSize=sample }) ?: throw IllegalArgumentException("Gambar tidak dapat diproses.")
        val orientation=runCatching { ExifInterface(ByteArrayInputStream(bytes)).getAttributeInt(ExifInterface.TAG_ORIENTATION,ExifInterface.ORIENTATION_NORMAL) }.getOrDefault(ExifInterface.ORIENTATION_NORMAL)
        val matrix=Matrix().apply {
            when(orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> setRotate(90f)
                ExifInterface.ORIENTATION_ROTATE_180 -> setRotate(180f)
                ExifInterface.ORIENTATION_ROTATE_270 -> setRotate(270f)
                ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> setScale(-1f,1f)
                ExifInterface.ORIENTATION_FLIP_VERTICAL -> setScale(1f,-1f)
                ExifInterface.ORIENTATION_TRANSPOSE -> { setRotate(90f);postScale(-1f,1f) }
                ExifInterface.ORIENTATION_TRANSVERSE -> { setRotate(-90f);postScale(-1f,1f) }
            }
        }
        val bitmap=if(matrix.isIdentity) decoded else Bitmap.createBitmap(decoded,0,0,decoded.width,decoded.height,matrix,true).also { if(it!==decoded) decoded.recycle() }
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
        checkedImageSize(bytes)
        val bounds=BitmapFactory.Options().apply { inJustDecodeBounds=true }
        BitmapFactory.decodeByteArray(bytes,0,bytes.size,bounds)
        val width=bounds.outWidth;val height=bounds.outHeight
        require(width in 1..4096 && height in 1..4096 && width.toLong()*height<=8_388_608L)
        var sample=1
        while(width/sample>1600 || height/sample>1600) sample*=2
        BitmapFactory.decodeByteArray(bytes,0,bytes.size,BitmapFactory.Options().apply { inSampleSize=sample })
    }.getOrNull()
}
