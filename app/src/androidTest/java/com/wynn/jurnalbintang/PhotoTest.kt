package com.wynn.jurnalbintang

import android.graphics.Bitmap
import android.media.ExifInterface
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.wynn.jurnalbintang.platform.Photos
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.io.ByteArrayInputStream
import java.util.Base64

@RunWith(AndroidJUnit4::class)
class PhotoTest {
    @Test fun cameraOrientationIsAppliedBeforeMetadataIsStripped() {
        val context=ApplicationProvider.getApplicationContext<android.content.Context>()
        val file=File(context.cacheDir,"orientation-test.jpg")
        val bitmap=Bitmap.createBitmap(8,16,Bitmap.Config.ARGB_8888)
        try {
            file.outputStream().use { bitmap.compress(Bitmap.CompressFormat.JPEG,90,it) }
            ExifInterface(file.path).apply { setAttribute(ExifInterface.TAG_ORIENTATION,"6");saveAttributes() }
            val data=Photos.read(context,Uri.fromFile(file))
            val result=checkNotNull(Photos.bitmap(data))
            assertEquals(16,result.width);assertEquals(8,result.height);result.recycle()
            val bytes=Base64.getDecoder().decode(data.substringAfter(','))
            val orientation=ExifInterface(ByteArrayInputStream(bytes)).getAttributeInt(ExifInterface.TAG_ORIENTATION,ExifInterface.ORIENTATION_UNDEFINED)
            assertTrue(orientation==ExifInterface.ORIENTATION_NORMAL || orientation==ExifInterface.ORIENTATION_UNDEFINED)
        } finally { bitmap.recycle();file.delete() }
    }
}
