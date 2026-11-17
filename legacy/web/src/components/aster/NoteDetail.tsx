import { ArrowLeft, CalendarDays, Check, Pencil, Pin, Star } from "lucide-react";
import { useStore, type Note, type NoteType } from "@/lib/store";

const typeLabel: Record<NoteType, string> = {
  note: "Catatan",
  checklist: "Checklist",
  journal: "Jurnal",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Read-only detail view (separate from the editor), opened from the notes list. */
export function NoteDetail({
  note,
  onClose,
  onEdit,
}: {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { togglePin, toggleFavorite, toggleItem } = useStore();
  const done = note.items.filter((i) => i.done).length;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
      <header className="flex shrink-0 items-center gap-1 border-b border-border/70 bg-card px-2 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          onClick={onClose}
          aria-label="Kembali"
          className="press grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-[19px] w-[19px]" />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-[13.5px] font-semibold text-muted-foreground">
          {typeLabel[note.type]}
        </p>
        <button
          onClick={() => togglePin(note.id)}
          aria-label={note.pinned ? "Lepas sematan" : "Sematkan"}
          className={`press grid h-10 w-10 place-items-center rounded-full hover:bg-muted ${
            note.pinned ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Pin className={`h-[18px] w-[18px] ${note.pinned ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={() => toggleFavorite(note.id)}
          aria-label={note.favorite ? "Hapus dari favorit" : "Tandai favorit"}
          className={`press grid h-10 w-10 place-items-center rounded-full hover:bg-muted ${
            note.favorite ? "text-amber-500" : "text-muted-foreground"
          }`}
        >
          <Star className={`h-[18px] w-[18px] ${note.favorite ? "fill-current" : ""}`} />
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-32 pt-4">
        <h1 className="font-display text-[26px] leading-snug tracking-tight-display animate-fade-up">
          {note.title || "Tanpa Judul"}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {fmt(note.updatedAt)}
          </span>
          {note.items.length > 0 && (
            <span>
              {done}/{note.items.length} selesai
            </span>
          )}
        </div>

        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-[11.5px] font-medium text-primary"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {note.image && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border animate-pop">
            <img
              src={note.image}
              alt={`Lampiran ${note.title || "catatan"}`}
              className="w-full object-contain"
            />
          </div>
        )}

        {note.items.length > 0 && (
          <div className="mt-4 space-y-2 stagger">
            {note.items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(note.id, item.id)}
                className="press flex w-full items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5 text-left"
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                    item.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {item.done && <Check className="h-3.5 w-3.5" />}
                </span>
                <span
                  className={`min-w-0 flex-1 text-[14px] ${
                    item.done ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        )}

        {note.body && (
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90 animate-fade-up">
            {note.body}
          </p>
        )}

        {!note.body && note.items.length === 0 && !note.image && (
          <p className="mt-6 text-[13px] text-muted-foreground">Catatan ini masih kosong.</p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]">
        <button
          onClick={onEdit}
          aria-label="Edit catatan"
          className="press-lg pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/35"
        >
          <Pencil className="h-[22px] w-[22px]" />
        </button>
      </div>
    </div>
  );
}
