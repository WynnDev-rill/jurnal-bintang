package com.wynn.jurnalbintang.data

/** Read compressed headers only; never allocate a bitmap to validate an imported image. */
fun checkedImageSize(bytes: ByteArray): Pair<Int,Int> {
    fun u(i: Int)=bytes[i].toInt() and 255
    fun be16(i: Int)=(u(i) shl 8) or u(i+1)
    fun le16(i: Int)=u(i) or (u(i+1) shl 8)
    fun be32(i: Int)=(u(i) shl 24) or (u(i+1) shl 16) or (u(i+2) shl 8) or u(i+3)
    fun le24(i: Int)=u(i) or (u(i+1) shl 8) or (u(i+2) shl 16)
    fun ascii(i: Int,n: Int)=String(bytes,i,n,Charsets.US_ASCII)
    require(bytes.size>=12) { "Data gambar tidak lengkap." }
    val dimensions: Pair<Int,Int> = when {
        bytes.size>=24 && bytes.take(8).toByteArray().contentEquals(byteArrayOf(0x89.toByte(),80,78,71,13,10,26,10)) -> be32(16) to be32(20)
        u(0)==255 && u(1)==216 -> {
            var pos=2;var found:Pair<Int,Int>?=null
            while(pos<bytes.size && found==null) {
                require(u(pos)==255) { "Header JPEG tidak valid." }
                while(pos<bytes.size && u(pos)==255) pos++
                require(pos<bytes.size)
                val marker=u(pos++)
                if(marker in 208..217 || marker==1) continue
                require(marker!=218 && pos+2<=bytes.size) { "Ukuran JPEG tidak ditemukan." }
                val length=be16(pos)
                require(length>=2 && pos+length<=bytes.size)
                if(marker in listOf(192,193,194,195,197,198,199,201,202,203,205,206,207)) {
                    require(length>=8);found=be16(pos+5) to be16(pos+3)
                }
                pos+=length
            }
            requireNotNull(found) { "Ukuran JPEG tidak ditemukan." }
        }
        bytes.size>=30 && ascii(0,4)=="RIFF" && ascii(8,4)=="WEBP" -> when(ascii(12,4)) {
            "VP8X" -> (le24(24)+1) to (le24(27)+1)
            "VP8 " -> { require(u(23)==157 && u(24)==1 && u(25)==42); (le16(26) and 16383) to (le16(28) and 16383) }
            "VP8L" -> { require(u(20)==47);val bits=u(21).toLong() or (u(22).toLong() shl 8) or (u(23).toLong() shl 16) or (u(24).toLong() shl 24); ((bits and 16383)+1).toInt() to (((bits shr 14) and 16383)+1).toInt() }
            else -> throw IllegalArgumentException("Header WebP belum didukung.")
        }
        else -> throw IllegalArgumentException("Data gambar tidak valid.")
    }
    require(dimensions.first in 1..4096 && dimensions.second in 1..4096 && dimensions.first.toLong()*dimensions.second<=8_388_608L) { "Dimensi gambar terlalu besar. Gunakan gambar maksimal 4096 piksel dan 8 megapiksel." }
    return dimensions
}
