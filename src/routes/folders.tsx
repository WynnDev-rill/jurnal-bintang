import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  Briefcase,
  FolderClosed,
  FolderPlus,
  Heart,
  Lightbulb,
  MoreVertical,
  NotebookPen,
  Plane,
  Plus,
  Search,
  Star,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { EmptyState, Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/folders")({
  head: () => ({
    meta: [
      { title: "Folder — Aster Journal" },
      {
        name: "description",
        content: "Buat dan kelola folder untuk merapikan catatan, checklist, dan jurnalmu.",
      },
      { property: "og:title", content: "Folder — Aster Journal" },
      { property: "og:description", content: "Buat, ubah nama, dan hapus folder catatanmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FoldersPage,
});

const ICONS = [User, Briefcase, Lightbulb, NotebookPen, Heart, Plane, Wallet, BookOpen];
const iconFor = (i: number) => ICONS[i % ICONS.length];

function FoldersPage() {
  const { state, addFolder, renameFolder, deleteFolder } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const count = (id: string) => state.notes.filter((n) => n.folderId === id).length;
  const normal = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("id-ID");
    return state.folders
      .filter((f) => !f.system)
      .filter((f) => !term || f.name.toLocaleLowerCase("id-ID").includes(term));
  }, [state.folders, q]);
  const system = state.folders.filter((f) => f.system);
  const favCount = state.notes.filter((n) => n.favorite).length;
  const hasPersonal = state.folders.some((f) => !f.system);

  const submit = () => {
    if (!name.trim()) return;
    addFolder(name.trim());
    setName("");
    setOpen(false);
  };

  return (
    <Screen>
      <TopBar
        title="Folder"
        subtitle={hasPersonal ? `${state.folders.filter((f) => !f.system).length} folder pribadi` : "Rapikan catatanmu"}
        showDefaultActions={false}
        right={
          <button
            onClick={() => setOpen(true)}
            aria-label="Folder baru"
            className="press grid h-9 w-9 place-items-center rounded-full text-primary hover:bg-primary/10"
          >
            <FolderPlus className="h-[19px] w-[19px]" />
          </button>
        }
      />

      <section className="shrink-0 border-b border-border/60 bg-card px-4 pb-3">
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-4 py-3 focus-within:border-primary/40 focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari folder…"
            aria-label="Cari folder"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Bersihkan" className="press">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      <Scroll>
        <SectionTitle
          tight
          action={
            hasPersonal ? (
              <button
                onClick={() => setOpen(true)}
                className="press inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[12.5px] font-semibold text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Folder Baru
              </button>
            ) : undefined
          }
        >
          Folder Saya
        </SectionTitle>

        {!hasPersonal ? (
          <div className="px-4">
            <EmptyState
              compact
              icon={<FolderClosed className="h-7 w-7" />}
              title="Belum ada folder"
              description="Buat folder untuk mengelompokkan catatan, tugas, dan jurnal sesuai kebutuhanmu."
              action={
                <button
                  onClick={() => setOpen(true)}
                  className="press rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Folder Baru
                </button>
              }
            />
          </div>
        ) : normal.length === 0 ? (
          <p className="px-4 text-[12.5px] text-muted-foreground">
            Tidak ada folder yang cocok dengan pencarianmu.
          </p>
        ) : (
          <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl stagger">
            {normal.map((f, i) => {
              const Icon = iconFor(i);
              return (
                <div key={f.id} className="relative flex items-center gap-3 px-3.5 py-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: `${f.color}22`, color: f.color }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {editingId === f.id ? (
                      <input
                        autoFocus
                        value={f.name}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                        onChange={(e) => renameFolder(f.id, e.target.value)}
                        className="w-full rounded-md bg-muted px-2 py-1 text-[14px] font-semibold outline-none"
                      />
                    ) : (
                      <p className="truncate text-[14px] font-semibold">{f.name}</p>
                    )}
                    <p className="text-[11.5px] text-muted-foreground">{count(f.id)} catatan</p>
                  </div>
                  <button
                    onClick={() => setMenu(menu === f.id ? null : f.id)}
                    aria-label={`Opsi ${f.name}`}
                    className="press grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <MoreVertical className="h-[18px] w-[18px]" />
                  </button>

                  {menu === f.id && (
                    <div className="absolute right-3 top-12 z-20 w-40 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-pop">
                      <button
                        onClick={() => {
                          setEditingId(f.id);
                          setMenu(null);
                        }}
                        className="press flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] hover:bg-muted"
                      >
                        <NotebookPen className="h-4 w-4" /> Ubah nama
                      </button>
                      <button
                        onClick={() => {
                          deleteFolder(f.id);
                          setMenu(null);
                        }}
                        className="press flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" /> Hapus folder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <SectionTitle>Koleksi Sistem</SectionTitle>
        <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
          <div className="flex items-center gap-3 px-3.5 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-400/15">
              <Star className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Favorit</p>
              <p className="text-[11.5px] text-muted-foreground">{favCount} catatan</p>
            </div>
          </div>
          {system.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-3.5 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                {f.name === "Sampah" ? (
                  <Trash2 className="h-[18px] w-[18px]" />
                ) : (
                  <Archive className="h-[18px] w-[18px]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold">{f.name}</p>
                <p className="text-[11.5px] text-muted-foreground">{count(f.id)} catatan</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none sticky bottom-3 z-30 mt-5 flex justify-end px-5">
          <button
            onClick={() => setOpen(true)}
            aria-label="Folder baru"
            className="press-lg pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/35 transition-transform duration-300 hover:rotate-90"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </Scroll>

      {open && (
        <div className="fixed inset-0 z-50 mx-auto max-w-[520px]">
          <button
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px] animate-fade"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-card p-5 pb-[calc(env(safe-area-inset-bottom)+24px)] shadow-2xl animate-slide-up">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Folder Baru</h2>
              <button onClick={() => setOpen(false)} className="press text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Nama folder"
              className="mt-4 w-full rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={submit}
              className="press mt-3 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
            >
              Simpan Folder
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
}
