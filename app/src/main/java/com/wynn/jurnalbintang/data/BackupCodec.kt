package com.wynn.jurnalbintang.data

import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest
import java.time.Instant
import java.util.Base64

// JSON is an explicit portable format, not reflection over Room entities.
data class Backup(val notes: List<Note>, val folders: List<Folder>)
object BackupCodec {
    const val MAX_BYTES = 16 * 1024 * 1024
    const val MAX_NOTE_BYTES = 1_500_000
    const val MAX_BODY = 200_000
    const val MAX_IMAGE_BYTES = 600 * 1024
    fun validateNote(note: Note) {
        require(noteJson(note).toString().toByteArray().size <= MAX_NOTE_BYTES) { "Catatan ini terlalu besar untuk disimpan dengan aman. Kurangi gambar atau pindahkan sebagian isi ke catatan baru." }
    }
    fun encode(backup: Backup): String {
        backup.notes.forEach(::validateNote)
        val data = JSONObject().put("notes", JSONArray(backup.notes.map(::noteJson)))
            .put("folders", JSONArray(backup.folders.map { JSONObject().put("id",it.id).put("name",it.name) }))
        return JSONObject().put("app","Aster Journal").put("schema",4)
            .put("exportedAt",Instant.now().toString()).put("data",data).toString(2)
            .also { require(it.toByteArray().size <= MAX_BYTES) { "Cadangan melebihi 16 MB. Ekspor Markdown untuk salinan teks." } }
    }
    fun noteJson(n: Note): JSONObject = JSONObject().put("id",n.id).put("kind",n.kind)
        .put("title",n.title).put("body",n.body).put("items",JSONArray(n.items.map { JSONObject().put("id",it.id).put("text",it.text).put("done",it.done) }))
        .put("tags",JSONArray(n.tags)).put("folderId",n.folderId ?: JSONObject.NULL)
        .put("pinned",n.pinned).put("favorite",n.favorite).put("archived",n.archived).put("trashed",n.trashed)
        .put("prompt",n.prompt).put("mood",n.mood ?: JSONObject.NULL).put("image",n.image ?: JSONObject.NULL)
        .put("createdAt",n.createdAt).put("updatedAt",n.updatedAt)

    fun decode(text: String): Backup {
        require(text.toByteArray().size <= MAX_BYTES) { "Berkas terlalu besar. Batas cadangan 16 MB." }
        try {
            val root = JSONObject(text)
            val wrapped = root.has("data")
            if (wrapped) require(root.optString("app") == "Aster Journal") { "Bukan cadangan Aster Journal." }
            val schema = if(wrapped) root.optInt("schema",3) else 3
            require(schema in 1..4) { "Versi cadangan belum didukung." }
            val d = if(wrapped) root.getJSONObject("data") else root
            val notes = d.getJSONArray("notes")
            require(notes.length() <= 10_000) { "Terlalu banyak catatan." }
            if(schema < 4) require(d.has("reflections")) { "Cadangan lama tidak lengkap." }
            val folders = array(d,"folders")
            require(folders.length() <= 1000)
            val fs = (0 until folders.length()).map { folders.getJSONObject(it) }
                .filterNot { schema < 4 && (it.optBoolean("system") || it.optString("id") in listOf("sys-trash","sys-archive")) }
                .map { Folder(str(it,"id",160,true),str(it,"name",80,true)) }
            val ns = (0 until notes.length()).map { parseNote(notes.getJSONObject(it),schema) }.toMutableList()
            if(schema < 4) {
                val reflections = array(d,"reflections")
                require(reflections.length() + ns.size <= 10_000)
                for(i in 0 until reflections.length()) ns += parseReflection(reflections.getJSONObject(i),false)
                if(d.has("reflectionDraft") && !d.isNull("reflectionDraft")) {
                    val draft=parseReflection(d.getJSONObject("reflectionDraft"),true)
                    if(draft.hasContent()) ns += draft
                }
            }
            ns.forEach(::validateNote)
            require(ns.map { it.id }.distinct().size == ns.size) { "ID catatan berulang di cadangan." }
            require(fs.map { it.id }.distinct().size == fs.size) { "ID folder berulang di cadangan." }
            val reserved=setOf("all","archive","trash","favorites","new")
            val remap=fs.associate { it.id to if(it.id in reserved || it.id.startsWith("sys-")) "folder-import-${fingerprint(it.id)}" else it.id }
            val normalized=fs.map { it.copy(id=remap.getValue(it.id)) }
            require(normalized.map { it.id }.distinct().size==normalized.size) { "ID folder bertabrakan." }
            return Backup(ns.map { it.copy(folderId=it.folderId?.let(remap::get)) },normalized)
        } catch(e: IllegalArgumentException) { throw e }
        catch(_: Exception) { throw IllegalArgumentException("Cadangan tidak valid atau tidak lengkap. Pilih JSON Aster Journal.") }
    }
    private fun parseNote(o: JSONObject, schema: Int): Note {
        val kind = str(o,if(schema==4) "kind" else "type",20).ifBlank { "note" }
        require(kind in listOf("note","checklist","journal","reflection")) { "Jenis catatan tidak dikenal." }
        val created = timestamp(o,"createdAt")
        val items=array(o,"items")
        require(items.length()<=500) { "Checklist terlalu panjang." }
        val parsedItems=(0 until items.length()).map { idx ->
            val item=items.getJSONObject(idx)
            CheckItem(str(item,"id",160).ifBlank { "item-$idx" },str(item,"text",2000),bool(item,"done"))
        }
        require(parsedItems.map { it.id }.distinct().size==parsedItems.size)
        val folder=nullable(o,"folderId",160)
        val image=nullable(o,"image",1_200_000)
        if(image!=null) validateImage(image)
        return Note(id=str(o,"id",160,true), kind=if(kind=="journal") "note" else kind,
            title=str(o,"title",500),body=str(o,"body",MAX_BODY),items=parsedItems,tags=tags(o),
            folderId=folder?.takeUnless { schema<4 && it in listOf("sys-trash","sys-archive") },pinned=bool(o,"pinned"),favorite=bool(o,"favorite"),
            archived=bool(o,"archived") || (schema<4 && folder=="sys-archive"),trashed=bool(o,"trashed") || (schema<4 && folder=="sys-trash"),
            prompt=str(o,"prompt",2000),mood=nullable(o,"mood",20)?.also(::validateMood),image=image,
            createdAt=created,updatedAt=if(o.has("updatedAt")) timestamp(o,"updatedAt") else created)
    }
    private fun parseReflection(o: JSONObject,draft: Boolean): Note {
        val created=timestamp(o,if(draft) "updatedAt" else "createdAt")
        return Note(id=if(draft) "legacy-draft-${fingerprint(o.toString())}" else str(o,"id",160,true),
            kind="reflection",prompt=str(o,"prompt",2000),body=str(o,"body",MAX_BODY),tags=tags(o),
            mood=nullable(o,"mood",20)?.also(::validateMood),createdAt=created,updatedAt=created)
    }
    private fun array(o: JSONObject,key: String): JSONArray = if(o.has(key)) o.getJSONArray(key) else JSONArray()
    private fun str(o: JSONObject,key: String,limit: Int,required: Boolean=false): String {
        if(!o.has(key) || o.isNull(key)) { require(!required) { "$key tidak tersedia." }; return "" }
        require(o.get(key) is String) { "$key harus berupa teks." }
        return o.getString(key).also { require(it.length<=limit && '\u0000' !in it && (!required || it.isNotBlank())) { "$key tidak valid atau terlalu panjang." } }
    }
    private fun nullable(o: JSONObject,key: String,limit: Int): String? = if(!o.has(key) || o.isNull(key)) null else str(o,key,limit)
    private fun bool(o: JSONObject,key: String): Boolean {
        if(!o.has(key)) return false
        require(o.get(key) is Boolean) { "$key harus berupa boolean." }
        return o.getBoolean(key)
    }
    private fun timestamp(o: JSONObject,key: String): Long {
        if(!o.has(key)) return 0
        val raw=o.get(key)
        val value=if(raw is Number) {
            require(raw.toDouble()==raw.toLong().toDouble()); raw.toLong()
        } else Instant.parse(raw as String).toEpochMilli()
        require(value in 0..253402300799999L) { "Tanggal tidak valid." }
        return value
    }
    private fun tags(o: JSONObject): List<String> {
        val a=array(o,"tags");require(a.length()<=50)
        return (0 until a.length()).map { require(a.get(it) is String); a.getString(it).also { t -> require(t.length<=80) } }.distinct()
    }
    private fun validateMood(mood: String) { require(mood in listOf("great","good","okay","meh","hard")) { "Mood tidak dikenal." } }
    fun validateImage(image: String) {
        require(image.startsWith("data:image/jpeg;base64,") || image.startsWith("data:image/png;base64,") || image.startsWith("data:image/webp;base64,")) { "Format gambar tidak didukung." }
        val bytes=Base64.getDecoder().decode(image.substringAfter(','))
        // Legacy photos were capped at 700 KiB; keep them without expanding new imports.
        require(bytes.size in 12..(700*1024)) { "Gambar terlalu besar." }
        checkedImageSize(bytes)
    }
    fun markdown(backup: Backup): String = buildString {
        append("# Aster Journal\n\n")
        for(n in backup.notes.sortedByDescending { it.createdAt }) {
            append("## ${n.displayTitle}\n\n")
            append("${Instant.ofEpochMilli(n.createdAt)}")
            if(n.trashed) append(" · Sampah") else if(n.archived) append(" · Arsip")
            n.mood?.let { append(" · $it") };append("\n\n")
            if(n.tags.isNotEmpty()) append(n.tags.joinToString(" ") { "#$it" }+"\n\n")
            append(n.body+"\n\n")
            n.items.forEach { append("- [${if(it.done) "x" else " "}] ${it.text}\n") }
            if(n.image!=null) append("\n_Gambar disertakan dalam cadangan JSON._\n")
            append("\n---\n\n")
        }
    }
}
private fun fingerprint(value: String): String = MessageDigest.getInstance("SHA-256").digest(value.toByteArray()).take(10).joinToString("") { "%02x".format(it) }

fun mergeBackups(current: Backup,incoming: Backup): Backup {
    val folders=current.folders.associateBy { it.id }.toMutableMap()
    val remap=mutableMapOf<String,String>()
    for(f in incoming.folders) {
        var id=f.id;var attempt=0
        val base="import-folder-${fingerprint(f.id+"\n"+f.name)}"
        while(folders[id]?.let { it!=f.copy(id=id) }==true) {
            id=base+if(attempt==0) "" else "-$attempt";attempt++
        }
        remap[f.id]=id
        folders.putIfAbsent(id,f.copy(id=id))
    }
    val notes=current.notes.associateBy { it.id }.toMutableMap()
    for(original in incoming.notes) {
        val n=original.copy(folderId=original.folderId?.let { remap[it] ?: it })
        var id=n.id;var attempt=0
        val base="import-note-${fingerprint(BackupCodec.noteJson(n).toString())}"
        while(notes[id]?.let { it!=n.copy(id=id) }==true) {
            id=base+if(attempt==0) "" else "-$attempt";attempt++
        }
        notes.putIfAbsent(id,n.copy(id=id))
    }
    return Backup(notes.values.toList(),folders.values.toList())
}
