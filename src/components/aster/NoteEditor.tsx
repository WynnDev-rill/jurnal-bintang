import { useState } from "react";
import { Check, Image as ImageIcon, Plus, Tag, Trash2, X } from "lucide-react";
import { useStore, type Note, type NoteType } from "@/lib/store";

export function NoteEditor({
  note,
  onClose,
}: {
  note: Note;
  onClose: () => void;
}) {
  const { updateNote, deleteNote } = useStore();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [items, setItems] = useState(note.items);
  const [tags, setTags] = useState(note.tags);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(note.image);

  const typeLabel: Record<NoteType, string> = {
    note: "Catatan",
    checklist: "Checklist",
    journal: "Jurnal",
  };

  const save = () => {
    updateNote(note.id, { title: title.trim() || "Tanpa Judul", body, items, tags, image });
    onClose();
  };

  const addItem = () =>
    setItems((s) => [...s, { id: Math.random().toString(36).slice(2, 9), text: "", done: false }]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((s) => [...s, t]);
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
      <header className="flex items-center gap-2 border-b border-border px-3 py-3">
        <button onClick={onClose} className="press grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
          <X className="h-[18px] w-[18px]" />
        </button>
        <p className="flex-1 text-center text-sm font-semibold">Edit {typeLabel[note.type]}</p>
        <button
          onClick={() => {
            deleteNote(note.id);
            onClose();
          }}
          className="press grid h-9 w-9 place-items-center rounded-full text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={save}
          className="press grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="h-[18px] w-[18px]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60"
        />

        {note.type === "checklist" ? (
          <div className="mt-4 space-y-2 stagger">
            {items.map((it, idx) => (
              <div key={it.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
                <button
                  onClick={() =>
                    setItems((s) => s.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))
                  }
                  className={`press grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                    it.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {it.done && <Check className="h-3.5 w-3.5" />}
                </button>
                <input
                  value={it.text}
                  autoFocus={idx === items.length - 1 && !it.text}
                  onChange={(e) =>
                    setItems((s) =>
                      s.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)),
                    )
                  }
                  placeholder="Tulis item…"
                  className={`flex-1 bg-transparent text-sm outline-none ${
                    it.done ? "text-muted-foreground line-through" : ""
                  }`}
                />
                <button
                  onClick={() => setItems((s) => s.filter((x) => x.id !== it.id))}
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
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              note.type === "journal" ? "Tuliskan harimu…" : "Mulai menulis catatanmu…"
            }
            rows={12}
            className="mt-3 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/60"
          />
        )}

        {image && (
          <div className="relative mt-3 overflow-hidden rounded-2xl animate-pop">
            <img src={image} alt="Lampiran catatan" className="w-full object-cover" />
            <button
              onClick={() => setImage(null)}
              className="press absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary animate-pop"
            >
              #{t}
              <button onClick={() => setTags((s) => s.filter((x) => x !== t))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="tag"
              className="w-16 bg-transparent text-xs outline-none"
            />
          </div>
        </div>

        <label className="press mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" /> Tambah gambar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => setImage(String(reader.result));
              reader.readAsDataURL(f);
            }}
          />
        </label>
      </div>
    </div>
  );
}
