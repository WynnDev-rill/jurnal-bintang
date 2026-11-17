import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Check, Image as ImageIcon, Pin, Plus, RotateCcw, Star, Tag, Trash2, X } from "lucide-react";
import { useStore, type Note, type NoteType } from "@/lib/store";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1280;
const MAX_STORED_IMAGE_BYTES = 700 * 1024;

async function compressImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Gambar terlalu besar. Pilih gambar berukuran maksimal 6 MB.");
  const source = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    source.close();
    throw new Error("Gambar tidak dapat diproses di perangkat ini.");
  }

  for (const [scaleFactor, quality] of [[1, 0.76], [0.78, 0.68], [0.6, 0.6]] as const) {
    const scale = Math.min(1, (MAX_IMAGE_EDGE * scaleFactor) / Math.max(source.width, source.height));
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL("image/jpeg", quality);
    if (Math.ceil(compressed.length * 0.75) <= MAX_STORED_IMAGE_BYTES) {
      source.close();
      return compressed;
    }
  }
  source.close();
  throw new Error("Gambar terlalu rumit untuk penyimpanan lokal. Pilih gambar yang lebih sederhana atau kecil.");
}

export function NoteEditor({ note, isNew = false, onClose }: { note: Note; isNew?: boolean; onClose: () => void }) {
  const { state, storageIssue, updateNote, deleteNote, trashNote, archiveNote, restoreNote, togglePin, toggleFavorite } = useStore();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [items, setItems] = useState(note.items);
  const [tags, setTags] = useState(note.tags);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(note.image);
  const [folderId, setFolderId] = useState<string | null>(note.folderId?.startsWith("sys-") ? note.folderId : note.folderId);
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);

  const typeLabel: Record<NoteType, string> = { note: "Catatan", checklist: "Checklist", journal: "Jurnal" };
  const inTrash = note.folderId === "sys-trash";
  const inArchive = note.folderId === "sys-archive";
  const personalFolders = state.folders.filter((f) => !f.system);

  const dirty = useMemo(() =>
    title !== note.title || body !== note.body || JSON.stringify(items) !== JSON.stringify(note.items) || JSON.stringify(tags) !== JSON.stringify(note.tags) || image !== note.image || folderId !== note.folderId,
    [title, body, items, tags, image, folderId, note],
  );

  const persistChanges = useCallback(() => {
    const cleanedItems = items.map((item) => ({ ...item, text: item.text.trim() })).filter((item) => item.text.length > 0);
    const cleanedTags = [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    const hasContent = title.trim() || body.trim() || cleanedItems.length > 0 || image;
    if (!hasContent && isNew) return false;
    updateNote(note.id, {
      title: title.trim() || (hasContent ? "Tanpa Judul" : ""),
      body: body.trim(),
      items: cleanedItems,
      tags: cleanedTags,
      image,
      folderId,
    });
    return true;
  }, [body, folderId, image, isNew, items, note.id, tags, title, updateNote]);

  useEffect(() => {
    if (!dirty || processingImage) return;
    const timer = window.setTimeout(persistChanges, 400);
    return () => window.clearTimeout(timer);
  }, [dirty, persistChanges, processingImage]);

  const closeEditor = () => {
    const hasContent = title.trim() || body.trim() || items.some((item) => item.text.trim()) || tags.length > 0 || image;
    if (isNew && !hasContent) deleteNote(note.id);
    else persistChanges();
    onClose();
  };

  const save = () => {
    closeEditor();
  };

  const removeNote = () => {
    if (isNew) {
      deleteNote(note.id);
      onClose();
      return;
    }
    if (inTrash) {
      if (!window.confirm(`Hapus ${typeLabel[note.type].toLowerCase()} ini secara permanen? Tindakan ini tidak dapat dibatalkan.`)) return;
      deleteNote(note.id);
    } else {
      if (!window.confirm(`Pindahkan ${typeLabel[note.type].toLowerCase()} ini ke Sampah?`)) return;
      trashNote(note.id);
    }
    onClose();
  };

  const handleArchive = () => {
    if (inArchive) restoreNote(note.id);
    else archiveNote(note.id);
    onClose();
  };

  const addItem = () => setItems((current) => [...current, { id: crypto.randomUUID(), text: "", done: false }]);
  const addTag = () => {
    const tag = tagInput.trim().toLocaleLowerCase("id-ID");
    if (tag && !tags.includes(tag)) setTags((current) => [...current, tag]);
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
      <header className="flex shrink-0 items-center gap-1 border-b border-border bg-card px-2 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button onClick={closeEditor} aria-label="Tutup editor" className="press grid h-10 w-10 place-items-center rounded-full hover:bg-muted"><X className="h-[18px] w-[18px]" /></button>
        <div className="min-w-0 flex-1 text-center"><p className="truncate text-sm font-semibold">{isNew ? "Buat" : "Edit"} {typeLabel[note.type]}</p><p className={`text-[10px] ${storageIssue ? "text-destructive" : "text-muted-foreground"}`}>{storageIssue ? "Belum tersimpan aman" : "Disimpan otomatis"}</p></div>

        {!isNew && inTrash ? (
          <button onClick={() => { restoreNote(note.id); onClose(); }} aria-label="Pulihkan dari Sampah" className="press grid h-10 w-10 place-items-center rounded-full text-primary hover:bg-primary/10"><RotateCcw className="h-[18px] w-[18px]" /></button>
        ) : !isNew ? (
          <>
            <button onClick={() => togglePin(note.id)} aria-label={note.pinned ? "Lepas sematan" : "Sematkan"} className={`press grid h-10 w-10 place-items-center rounded-full hover:bg-muted ${note.pinned ? "text-primary" : "text-muted-foreground"}`}><Pin className={`h-[18px] w-[18px] ${note.pinned ? "fill-current" : ""}`} /></button>
            <button onClick={() => toggleFavorite(note.id)} aria-label={note.favorite ? "Hapus dari favorit" : "Tandai favorit"} className={`press grid h-10 w-10 place-items-center rounded-full hover:bg-muted ${note.favorite ? "text-amber-500" : "text-muted-foreground"}`}><Star className={`h-[18px] w-[18px] ${note.favorite ? "fill-current" : ""}`} /></button>
            <button onClick={handleArchive} aria-label={inArchive ? "Keluarkan dari Arsip" : "Arsipkan"} className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-muted">{inArchive ? <RotateCcw className="h-[18px] w-[18px]" /> : <Archive className="h-[18px] w-[18px]" />}</button>
          </>
        ) : null}

        <button onClick={removeNote} aria-label={inTrash ? `Hapus permanen ${typeLabel[note.type]}` : `Pindahkan ${typeLabel[note.type]} ke Sampah`} className="press grid h-10 w-10 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-[18px] w-[18px]" /></button>
        <button onClick={save} aria-label="Selesai" disabled={processingImage} className="press grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-[18px] w-[18px]" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+40px)] pt-4">
        {(inTrash || inArchive) && (
          <div className="mb-3 rounded-xl bg-secondary px-3 py-2 text-[12px] text-muted-foreground">
            {inTrash ? "Catatan ini berada di Sampah. Pulihkan untuk mengembalikannya ke Catatan." : "Catatan ini berada di Arsip dan tidak muncul di beranda Catatan."}
          </div>
        )}

        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul" autoFocus={note.type !== "checklist"} className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60" />

        {note.type === "checklist" ? (
          <div className="mt-4 space-y-2 stagger">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
                <button onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))} aria-label={item.done ? "Tandai belum selesai" : "Tandai selesai"} className={`press grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors ${item.done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{item.done && <Check className="h-3.5 w-3.5" />}</button>
                <input value={item.text} autoFocus={index === items.length - 1 && !item.text} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, text: event.target.value } : entry))} onKeyDown={(event) => { if (event.key === "Enter" && item.text.trim()) addItem(); }} placeholder="Tulis item…" className={`flex-1 bg-transparent text-sm outline-none ${item.done ? "text-muted-foreground line-through" : ""}`} />
                <button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Hapus item" className="press grid h-8 w-8 place-items-center rounded-full text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={addItem} className="press flex min-h-11 w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"><Plus className="h-4 w-4" /> Tambah item</button>
          </div>
        ) : (
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={note.type === "journal" ? "Tuliskan harimu…" : "Mulai menulis catatanmu…"} rows={12} className="mt-3 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/60" />
        )}

        {!inTrash && !inArchive && (
          <div className="mt-5">
            <label htmlFor="note-folder" className="text-[11.5px] font-medium text-muted-foreground">Folder</label>
            <select id="note-folder" value={folderId ?? ""} onChange={(event) => setFolderId(event.target.value || null)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-secondary/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15">
              <option value="">Tanpa folder</option>
              {personalFolders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
            </select>
          </div>
        )}

        {image && (
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-border animate-pop">
            <img src={image} alt="Lampiran catatan" className="max-h-[420px] w-full object-contain" />
            <button onClick={() => setImage(null)} aria-label="Hapus gambar" className="press absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-background/85 shadow-sm"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="flex min-h-9 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary animate-pop">#{tag}<button onClick={() => setTags((current) => current.filter((entry) => entry !== tag))} aria-label={`Hapus tag ${tag}`} className="grid h-7 w-7 place-items-center"><X className="h-3 w-3" /></button></span>
          ))}
          <div className="flex min-h-10 items-center gap-1 rounded-full border border-dashed border-border px-3 py-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="tag" aria-label="Tambah tag" className="w-20 bg-transparent text-xs outline-none" />
          </div>
        </div>

        <label className="press mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />{processingImage ? "Memproses gambar…" : image ? "Ganti gambar" : "Tambah gambar"}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={processingImage} className="hidden" onChange={async (event) => {
            const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
            setImageError(""); setProcessingImage(true);
            try { setImage(await compressImage(file)); } catch (error) { setImageError(error instanceof Error ? error.message : "Gambar gagal diproses."); } finally { setProcessingImage(false); }
          }} />
        </label>
        {imageError && <p className="mt-2 text-center text-xs text-destructive">{imageError}</p>}
      </div>
    </div>
  );
}
