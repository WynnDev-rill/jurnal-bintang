package com.wynn.jurnalbintang.data

data class Backup(val notes: List<Note>, val folders: List<Folder>)
object BackupCodec {
    const val MAX_BYTES = 16 * 1024 * 1024
    fun encode(backup: Backup): String = TODO("encode")
    fun decode(text: String): Backup = TODO("decode")
    fun markdown(backup: Backup): String = TODO("markdown")
}
