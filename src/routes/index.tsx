import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckSquare,
  FileText,
  LayoutGrid,
  List,
  NotebookPen,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { EmptyState, Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { NoteRow, NoteTile } from "@/components/aster/NoteCard";
import { NoteEditor } from "@/components/aster/NoteEditor";
import { QuickCreateSheet } from "@/components/aster/QuickCreateSheet";
import { AsterFlower } from "@/components/aster/Logo";
import { useStore, type Note, type NoteType } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aster Journal — Catatan, Jurnal & Refleksi Harian" },
      {
        name: "description",
        content:
          "Aster Journal: aplikasi catatan, checklist, jurnal, refleksi, dan insight harian dengan tampilan putih-biru yang tenang.",
      },
      { property: "og:title", content: "Aster Journal — Catatan & Refleksi Harian" },
      {
        property: "og:description",
        content: "Tulis catatan, checklist, dan jurnal harian. Lacak mood dan lihat insight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingNew, setEditingNew] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [expandPinned, setExpandPinned] = useState(false);
  const [expandRecent, setExpandRecent] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");

  const editing = state.notes.find((n) => n.id === editingId) ?? null;
  const viewing = state.notes.find((n) => n.id === viewingId) ?? null;


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
  const shownRecent = expandRecent ? recent : recent.slice(0, 12);
  const hasNotes = state.notes.length > 0;

  const openExisting = (note: Note) => {
    setEditingNew(false);
    setViewingId(note.id);
  };

  const create = (type: NoteType) => {
    const n = addNote({
      type,
      title: "",
      items: type === "checklist" ? [{ id: crypto.randomUUID(), text: "", done: false }] : [],
    });
    setSheet(false);
    setEditingNew(true);
    setEditingId(n.id);
  };


  return (
    <Screen>
      <TopBar subtitle="Ruang tenang untuk pikiranmu" onSort={() => setSortAsc((s) => !s)} />

      <section className="shrink-0 border-b border-border/60 bg-card pb-3">
        <div className="px-4">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-4 py-3 transition-shadow duration-300 focus-within:border-primary/40 focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15">
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

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f, i) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`press flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-[7px] text-[13px] font-medium transition-all duration-300 animate-fade-up ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "border-border bg-card text-foreground/70 hover:bg-muted"
                }`}
              >
                <f.Icon className={`h-[15px] w-[15px] ${active ? "" : "text-muted-foreground"}`} />
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      <Scroll>
        {!hasNotes ? (
          <div className="px-4 pt-8">
            <EmptyState
              icon={<AsterFlower className="h-9 w-9" />}
              title="Belum ada catatan"
              description="Mulai dengan satu catatan, checklist, atau jurnal singkat. Semuanya tersimpan di perangkatmu."
              action={
                <button
                  onClick={() => setSheet(true)}
                  className="press rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Buat catatan pertama
                </button>
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 pt-8">
            <EmptyState
              compact
              icon={<Search className="h-7 w-7" />}
              title="Tidak ada yang cocok"
              description="Coba kata kunci lain atau ubah filter yang sedang aktif."
            />
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <SectionTitle
                  tight
                  action={
                    pinned.length > 2 ? (
                      <button
                        onClick={() => setExpandPinned((v) => !v)}
                        className="press text-[12.5px] font-semibold text-primary"
                      >
                        {expandPinned ? "Ringkas" : "Lihat semua"}
                      </button>
                    ) : undefined
                  }
                >
                  Disematkan
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
                <div className="flex shrink-0 items-center gap-1">
                  {recent.length > 12 && (
                    <button
                      onClick={() => setExpandRecent((v) => !v)}
                      className="press mr-1 text-[12.5px] font-semibold text-primary"
                    >
                      {expandRecent ? "Ringkas" : "Lihat semua"}
                    </button>
                  )}
                  <button
                    onClick={() => setView("list")}
                    aria-label="Tampilan daftar"
                    className={`press grid h-8 w-8 place-items-center rounded-lg ${
                      view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <List className="h-[17px] w-[17px]" />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    aria-label="Tampilan grid"
                    className={`press grid h-8 w-8 place-items-center rounded-lg ${
                      view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <LayoutGrid className="h-[17px] w-[17px]" />
                  </button>
                </div>
              }
            >
              Catatan Terbaru
            </SectionTitle>

            {recent.length === 0 ? (
              <p className="px-4 text-[12.5px] text-muted-foreground">
                Semua catatanmu sedang disematkan.
              </p>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-3 px-4 stagger">
                {shownRecent.map((n) => (
                  <NoteTile key={n.id} note={n} onOpen={openExisting} />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 px-4 stagger">
                {shownRecent.map((n) => (
                  <NoteRow key={n.id} note={n} onOpen={openExisting} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="pointer-events-none sticky bottom-3 z-30 mt-4 flex justify-end px-5">
          <button
            onClick={() => setSheet(true)}
            aria-label="Buat baru"
            className="press-lg pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/35 transition-transform duration-300 hover:rotate-90 hover:scale-105"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </Scroll>

      <QuickCreateSheet open={sheet} onClose={() => setSheet(false)} onCreate={create} />
      {viewing && !editing && (
        <NoteDetail
          note={viewing}
          onClose={() => setViewingId(null)}
          onEdit={() => {
            setEditingNew(false);
            setEditingId(viewing.id);
          }}
        />
      )}
      {editing && (
        <NoteEditor
          note={editing}
          isNew={editingNew}
          onClose={() => {
            setEditingId(null);
            setEditingNew(false);
          }}
        />
      )}

    </Screen>
  );
}
