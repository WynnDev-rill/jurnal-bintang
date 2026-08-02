import { useMemo, useState } from "react";
import { Check, Image as ImageIcon, Pin, Plus, Star, Tag, Trash2, X } from "lucide-react";
import { useStore, type Note, type NoteType } from "@/lib/store";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;

async function compressImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Gambar terlalu besar. Pilih gambar berukuran maksimal 8 MB.");
  }

  const source = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Gambar tidak dapat diproses di perangkat ini.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function NoteEditor({
  note,
  isNew = false,
  onClose,
}: {
  note: Note;
  isNew?: boolean;
  onClose: () => void;
}) {
  const { updateNote, deleteNote } = useStore();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [items, setItems] = useState(note.items);
  const [tags, setTags] = useState(note.tags);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(note.image);
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);

  const typeLabel: Record<NoteType, string> = {
    note: "Catatan",
    checklist: "Checklist",
    journal: "Jurnal",
  };

  const dirty = useMemo(
    () =>
      title !== note.title ||
      body !== note.body ||
      JSON.stringify(items) !== JSON.stringify(note.items) ||
      JSON.stringify(tags) !== JSON.stringify(note.tags) ||
      image !== note.image,
    [title, body, items, tags, image, note],
  );

  const closeEditor = () => {
    if (isNew) {
      const hasContent =
        title.trim() ||
        body.trim() ||
        items.some((item) => item.text.trim()) ||
        tags.length > 0 ||
        image;
      if (hasContent && !window.confirm("Buang catatan baru yang belum disimpan?")) return;
      deleteNote(note.id);
      onClose();
      return;
    }

    if (dirty && !window.confirm("Perubahan belum disimpan. Tetap keluar?")) return;
    onClose();
  };

  const save = () => {
    const cleanedItems = items
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);
    const cleanedTags = [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    const hasContent = title.trim() || body.trim() || cleanedItems.length > 0 || image;

    if (!hasContent) {
      if (isNew) deleteNote(note.id);
      onClose();
      return;
    }

    updateNote(note.id, {
      title: title.trim() || "Tanpa Judul",
      body: body.trim(),
      items: cleanedItems,
      tags: cleanedTags,
      image,
    });
    onClose();
  };

  const removeNote = () => {
    if (!window.confirm(`Hapus ${typeLabel[note.type].toLowerCase()} ini secara permanen?`)) return;
    deleteNote(note.id);
    onClose();
  };

  const addItem = () =>
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), text: "", done: false },
    ]);

  const addTag = () => {
    const tag = tagInput.trim().toLocaleLowerCase("id-ID");
    if (tag && !tags.includes(tag)) setTags((current) => [...current, tag]);
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          onClick={closeEditor}
          aria-label="Tutup editor"
          className="press grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">
          {isNew ? "Buat" : "Edit"} {typeLabel[note.type]}
        </p>
        {!isNew && (
          <>
            <button
              onClick={() => togglePin(note.id)}
              aria-label={note.pinned ? "Lepas sematan" : "Sematkan"}
              className={`press grid h-9 w-9 place-items-center rounded-full hover:bg-muted ${
                note.pinned ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Pin className={`h-[18px] w-[18px] ${note.pinned ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => toggleFavorite(note.id)}
              aria-label={note.favorite ? "Hapus dari favorit" : "Tandai favorit"}
              className={`press grid h-9 w-9 place-items-center rounded-full hover:bg-muted ${
                note.favorite ? "text-amber-500" : "text-muted-foreground"
              }`}
            >
              <Star className={`h-[18px] w-[18px] ${note.favorite ? "fill-current" : ""}`} />
            </button>
          </>
        )}
        <button
          onClick={removeNote}
          aria-label={`Hapus ${typeLabel[note.type]}`}
          className="press grid h-9 w-9 place-items-center rounded-full text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={save}
          aria-label="Simpan"
          disabled={processingImage}
          className="press grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-[18px] w-[18px]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Judul"
          autoFocus={note.type !== "checklist"}
          className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60"
        />

        {note.type === "checklist" ? (
          <div className="mt-4 space-y-2 stagger">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
                <button
                  onClick={() =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id ? { ...entry, done: !entry.done } : entry,
                      ),
                    )
                  }
                  aria-label={item.done ? "Tandai belum selesai" : "Tandai selesai"}
                  className={`press grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                    item.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {item.done && <Check className="h-3.5 w-3.5" />}
                </button>
                <input
                  value={item.text}
                  autoFocus={index === items.length - 1 && !item.text}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id ? { ...entry, text: event.target.value } : entry,
                      ),
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && item.text.trim()) addItem();
                  }}
                  placeholder="Tulis item…"
                  className={`flex-1 bg-transparent text-sm outline-none ${
                    item.done ? "text-muted-foreground line-through" : ""
                  }`}
                />
                <button
                  onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                  aria-label="Hapus item"
                  className="press text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addItem}
              className="press flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Tambah item
            </button>
          </div>
        ) : (
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={note.type === "journal" ? "Tuliskan harimu…" : "Mulai menulis catatanmu…"}
            rows={12}
            className="mt-3 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/60"
          />
        )}

        {image && (
          <div className="relative mt-3 overflow-hidden rounded-2xl animate-pop">
            <img src={image} alt="Lampiran catatan" className="max-h-[420px] w-full object-cover" />
            <button
              onClick={() => setImage(null)}
              aria-label="Hapus gambar"
              className="press absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary animate-pop"
            >
              #{tag}
              <button onClick={() => setTags((current) => current.filter((entry) => entry !== tag))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder="tag"
              className="w-16 bg-transparent text-xs outline-none"
            />
          </div>
        </div>

        <label className="press mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          {processingImage ? "Memproses gambar…" : image ? "Ganti gambar" : "Tambah gambar"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={processingImage}
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setImageError("");
              setProcessingImage(true);
              try {
                setImage(await compressImage(file));
              } catch (error) {
                setImageError(error instanceof Error ? error.message : "Gambar gagal diproses.");
              } finally {
                setProcessingImage(false);
              }
            }}
          />
        </label>
        {imageError && <p className="mt-2 text-center text-xs text-destructive">{imageError}</p>}
      </div>
    </div>
  );
}
