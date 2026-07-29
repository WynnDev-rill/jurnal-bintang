import { Pin, Star } from "lucide-react";
import { relativeDate, useStore, type Note } from "@/lib/store";

const typeBadge: Record<Note["type"], string> = {
  note: "Catatan",
  checklist: "Checklist",
  journal: "Jurnal",
};

export function NoteCard({ note, onOpen }: { note: Note; onOpen: (n: Note) => void }) {
  const { togglePin, toggleFavorite, toggleItem } = useStore();
  const done = note.items.filter((i) => i.done).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(note)}
      className="press soft-card w-full cursor-pointer rounded-2xl p-4 text-left hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] leading-snug">
            {note.title || "Tanpa Judul"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {typeBadge[note.type]} · {relativeDate(note.updatedAt)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePin(note.id);
          }}
          className={`press grid h-7 w-7 place-items-center rounded-full ${
            note.pinned ? "bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
          aria-label="Sematkan"
        >
          <Pin className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(note.id);
          }}
          className={`press grid h-7 w-7 place-items-center rounded-full ${
            note.favorite ? "bg-amber-400/15 text-amber-500" : "text-muted-foreground"
          }`}
          aria-label="Favorit"
        >
          <Star className={`h-3.5 w-3.5 ${note.favorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {note.type === "checklist" ? (
        <div className="mt-3 space-y-1.5">
          {note.items.slice(0, 3).map((it) => (
            <div key={it.id} className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(note.id, it.id);
                }}
                className={`press h-4 w-4 shrink-0 rounded-[5px] border transition-colors ${
                  it.done ? "border-primary bg-primary" : "border-border"
                }`}
                aria-label={it.text}
              />
              <span
                className={`truncate text-[13px] ${
                  it.done ? "text-muted-foreground line-through" : "text-foreground/80"
                }`}
              >
                {it.text}
              </span>
            </div>
          ))}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${note.items.length ? (done / note.items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      ) : (
        note.body && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {note.body}
          </p>
        )
      )}

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
