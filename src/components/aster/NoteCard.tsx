import { CheckSquare, FileText, NotebookPen, Pin, Star } from "lucide-react";
import { relativeDate, useStore, type Note } from "@/lib/store";

const typeMeta: Record<
  Note["type"],
  { label: string; Icon: typeof FileText; icon: string; tile: string }
> = {
  note: {
    label: "Catatan",
    Icon: FileText,
    icon: "bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300",
    tile: "tile-blue",
  },
  checklist: {
    label: "Tugas",
    Icon: CheckSquare,
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
    tile: "tile-green",
  },
  journal: {
    label: "Jurnal",
    Icon: NotebookPen,
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
    tile: "tile-violet",
  },
};

export function noteStamp(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  if (isToday)
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  return relativeDate(iso);
}

/** Pinned tile — soft tinted card, two-per-row. */
export function NoteTile({ note, onOpen }: { note: Note; onOpen: (n: Note) => void }) {
  const { togglePin, toggleItem } = useStore();
  const meta = typeMeta[note.type];
  const done = note.items.filter((i) => i.done).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(note)}
      className={`press soft-card relative flex min-h-[168px] cursor-pointer flex-col rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 ${meta.tile}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePin(note.id);
        }}
        aria-label="Sematkan"
        className={`press absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full ${
          note.pinned ? "text-primary" : "text-muted-foreground/60"
        }`}
      >
        <Pin className={`h-4 w-4 ${note.pinned ? "fill-current" : ""}`} />
      </button>

      <p className="pr-7 font-display text-[16px] leading-snug tracking-tight-display">
        {note.title || "Tanpa Judul"}
      </p>

      {note.type === "checklist" ? (
        <div className="mt-2.5 flex-1 space-y-1.5">
          {note.items.slice(0, 3).map((it) => (
            <div key={it.id} className="flex items-start gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(note.id, it.id);
                }}
                aria-label={it.text}
                className={`press mt-[2px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border transition-colors ${
                  it.done ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}
              >
                {it.done && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-primary-foreground">
                    <path
                      d="M2.5 6.2 L5 8.6 L9.5 3.6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`text-[12.5px] leading-snug ${
                  it.done ? "text-muted-foreground line-through" : "text-foreground/85"
                }`}
              >
                {it.text}
              </span>
            </div>
          ))}
          {note.items.length > 0 && (
            <div className="!mt-3 h-1 overflow-hidden rounded-full bg-foreground/8">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${(done / note.items.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 line-clamp-4 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">
          {note.body}
        </p>
      )}

      {note.tags[0] && (
        <span className="mt-2 w-fit rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          #{note.tags[0]}
        </span>
      )}
      <p className="mt-2 text-[10.5px] text-muted-foreground/80">{noteStamp(note.updatedAt)}</p>
    </div>
  );
}

/** Recent list row — icon square, title, snippet, stamp + star. */
export function NoteRow({ note, onOpen }: { note: Note; onOpen: (n: Note) => void }) {
  const { toggleFavorite } = useStore();
  const meta = typeMeta[note.type];
  const preview =
    note.type === "checklist"
      ? note.items.map((i) => i.text).filter(Boolean).join(", ")
      : note.body;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(note)}
      className="press soft-card flex cursor-pointer gap-3 rounded-2xl p-3.5 transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.icon}`}>
        <meta.Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 truncate font-display text-[15px] leading-snug tracking-tight-display">
            {note.title || "Tanpa Judul"}
          </p>
          <span className="shrink-0 pt-0.5 text-[10.5px] text-muted-foreground">
            {noteStamp(note.updatedAt)}
          </span>
        </div>
        {preview && (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {preview}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          {note.tags[0] && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              #{note.tags[0]}
            </span>
          )}
          <span className="flex-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(note.id);
            }}
            aria-label="Favorit"
            className={`press grid h-7 w-7 place-items-center rounded-full ${
              note.favorite ? "text-primary animate-wiggle" : "text-muted-foreground/60"
            }`}
          >
            <Star className={`h-[17px] w-[17px] ${note.favorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NoteCard({ note, onOpen }: { note: Note; onOpen: (n: Note) => void }) {
  return <NoteRow note={note} onOpen={onOpen} />;
}
