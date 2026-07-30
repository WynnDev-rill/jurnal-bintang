import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, FileText, LayoutGrid, NotebookPen, Plus, Search, Star, X } from "lucide-react";
import { LinkAction, Screen, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { NoteRow, NoteTile } from "@/components/aster/NoteCard";
import { NoteEditor } from "@/components/aster/NoteEditor";
import { QuickCreateSheet } from "@/components/aster/QuickCreateSheet";
import { useStore, type Note, type NoteType } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aster Journal — Catatan, Jurnal & Refleksi Harian" },
      {
        name: "description",
        content:
          "Aster Journal: aplikasi catatan, checklist, jurnal, refleksi, dan insight harian dengan tampilan lembut dan animasi halus.",
      },
      { property: "og:title", content: "Aster Journal — Catatan & Refleksi Harian" },
      {
        property: "og:description",
        content: "Tulis catatan, checklist, dan jurnal harian. Lacak mood dan lihat insight.",
      },
    ],
  }),
  component: Index,
});

const FILTERS = [
  { key: "all", label: "Semua", Icon: LayoutGrid },
  { key: "note", label: "Catatan", Icon: FileText },
  { key: "checklist", label: "Tugas", Icon: CheckSquare },
  { key: "journal", label: "Jurnal", Icon: NotebookPen },
  { key: "favorite", label: "Favorit", Icon: Star },
] as const;

function Index() {
  const { state, addNote } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [editing, setEditing] = useState<Note | null>(null);
  const [editingNew, setEditingNew] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [expandPinned, setExpandPinned] = useState(false);
  const [expandRecent, setExpandRecent] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("id-ID");
    const list = state.notes.filter((n) => {
      const matchQ =
        !term ||
        n.title.toLocaleLowerCase("id-ID").includes(term) ||
        n.body.toLocaleLowerCase("id-ID").includes(term) ||
        n.tags.some((t) => t.toLocaleLowerCase("id-ID").includes(term)) ||
        n.items.some((i) => i.text.toLocaleLowerCase("id-ID").includes(term));
      const matchF =
        filter === "all" ? true : filter === "favorite" ? n.favorite : n.type === filter;
      return matchQ && matchF;
    });
    return [...list].sort((a, b) =>
      sortAsc
        ? +new Date(a.updatedAt) - +new Date(b.updatedAt)
        : +new Date(b.updatedAt) - +new Date(a.updatedAt),
    );
  }, [state.notes, q, filter, sortAsc]);

  const pinned = filtered.filter((n) => n.pinned);
  const recent = filtered.filter((n) => !n.pinned);
  const shownPinned = expandPinned ? pinned : pinned.slice(0, 2);
  const shownRecent = expandRecent ? recent : recent.slice(0, 6);

  const openExisting = (note: Note) => {
    setEditingNew(false);
    setEditing(note);
  };

  const create = (type: NoteType) => {
    const n = addNote({
      type,
      title: "",
      items: type === "checklist" ? [{ id: crypto.randomUUID(), text: "", done: false }] : [],
    });
    setSheet(false);
    setEditingNew(true);
    setEditing(n);
  };

  return (
    <Screen>
      <TopBar subtitle="Ruang tenang untuk pikiranmu" onSort={() => setSortAsc((s) => !s)} />

      <section className="sticky top-[calc(env(safe-area-inset-top)+76px)] z-20 border-b border-border/45 bg-background/94 pb-3 pt-1 shadow-[0_10px_24px_rgba(7,13,24,0.08)] backdrop-blur-xl">
        <div className="px-4 animate-fade-up">
          <div className="flex items-center gap-2.5 rounded-2xl bg-muted px-4 py-3 transition-shadow duration-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/25">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari catatan…"
              aria-label="Cari catatan"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Bersihkan" className="press animate-pop">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f, i) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{ animationDelay: `${i * 45}ms` }}
                className={`press flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-[7px] text-[13px] font-medium transition-all duration-300 animate-fade-up ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "border-border bg-card text-foreground/75 hover:bg-muted"
                }`}
              >
                <f.Icon className={`h-[15px] w-[15px] ${active ? "" : "text-muted-foreground"}`} />
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {pinned.length > 0 && (
        <>
          <SectionTitle
            action={
              pinned.length > 2 ? (
                <LinkAction onClick={() => setExpandPinned((v) => !v)}>
                  {expandPinned ? "Ringkas" : "Lihat semua"}
                </LinkAction>
              ) : undefined
            }
          >
            <span className="inline-flex items-center gap-1.5">Disematkan</span>
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3 px-4 stagger">
            {shownPinned.map((n) => (
              <NoteTile key={n.id} note={n} onOpen={openExisting} />
            ))}
          </div>
        </>
      )}

      <SectionTitle
        action={
          recent.length > 6 ? (
            <LinkAction onClick={() => setExpandRecent((v) => !v)}>
              {expandRecent ? "Ringkas" : "Lihat semua"}
            </LinkAction>
          ) : undefined
        }
      >
        Catatan Terbaru
      </SectionTitle>
      <div className="space-y-2.5 px-4 stagger">
        {shownRecent.map((n) => (
          <NoteRow key={n.id} note={n} onOpen={openExisting} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground animate-fade-up">
            Belum ada yang cocok. Buat catatan baru.
          </p>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6.75rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-[520px] justify-end px-5">
        <button
          onClick={() => setSheet(true)}
          aria-label="Buat baru"
          className="press-lg pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/35 animate-bounce-in transition-transform duration-300 hover:rotate-90 hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <QuickCreateSheet open={sheet} onClose={() => setSheet(false)} onCreate={create} />
      {editing && (
        <NoteEditor
          note={editing}
          isNew={editingNew}
          onClose={() => {
            setEditing(null);
            setEditingNew(false);
          }}
        />
      )}
    </Screen>
  );
}
