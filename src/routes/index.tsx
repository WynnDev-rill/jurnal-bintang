import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Plus, Search } from "lucide-react";
import { Screen, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { NoteCard } from "@/components/aster/NoteCard";
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
  { key: "all", label: "Semua" },
  { key: "note", label: "Catatan" },
  { key: "checklist", label: "Tugas" },
  { key: "journal", label: "Jurnal" },
  { key: "favorite", label: "Favorit" },
] as const;

function Index() {
  const { state, addNote } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [editing, setEditing] = useState<Note | null>(null);
  const [sheet, setSheet] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.notes.filter((n) => {
      const matchQ =
        !term ||
        n.title.toLowerCase().includes(term) ||
        n.body.toLowerCase().includes(term) ||
        n.tags.some((t) => t.includes(term)) ||
        n.items.some((i) => i.text.toLowerCase().includes(term));
      const matchF =
        filter === "all" ? true : filter === "favorite" ? n.favorite : n.type === filter;
      return matchQ && matchF;
    });
  }, [state.notes, q, filter]);

  const pinned = filtered.filter((n) => n.pinned);
  const recent = filtered.filter((n) => !n.pinned);

  const create = (type: NoteType) => {
    const n = addNote({
      type,
      title: "",
      items: type === "checklist" ? [{ id: "i1", text: "", done: false }] : [],
    });
    setSheet(false);
    setEditing(n);
  };

  return (
    <Screen>
      <TopBar
        subtitle="Ruang tenang untuk pikiranmu"
        right={
          <button className="press grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
            <Bell className="h-[18px] w-[18px]" />
          </button>
        }
      />

      <div className="px-4 pt-4 animate-fade-up">
        <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari catatan, tugas, jurnal…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`press shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {pinned.length > 0 && (
        <>
          <SectionTitle>Disematkan</SectionTitle>
          <div className="space-y-3 px-4 stagger">
            {pinned.map((n) => (
              <NoteCard key={n.id} note={n} onOpen={setEditing} />
            ))}
          </div>
        </>
      )}

      <SectionTitle>Catatan Terbaru</SectionTitle>
      <div className="space-y-3 px-4 stagger">
        {recent.map((n) => (
          <NoteCard key={n.id} note={n} onOpen={setEditing} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground animate-fade-up">
            Belum ada yang cocok. Buat catatan baru.
          </p>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-[520px] justify-end px-4">
        <button
          onClick={() => setSheet(true)}
          aria-label="Buat baru"
          className="press pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 animate-pop"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <QuickCreateSheet open={sheet} onClose={() => setSheet(false)} onCreate={create} />
      {editing && <NoteEditor note={editing} onClose={() => setEditing(null)} />}
    </Screen>
  );
}
