import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  Briefcase,
  FolderClosed,
  Heart,
  Lightbulb,
  MoreVertical,
  NotebookPen,
  Plane,
  Plus,
  Star,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { LinkAction, Screen, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/folders")({
  head: () => ({
    meta: [
      { title: "Folder — Aster Journal" },
      {
        name: "description",
        content: "Kelola folder Pribadi, Pekerjaan, Ide, dan Jurnal untuk merapikan catatanmu.",
      },
      { property: "og:title", content: "Folder — Aster Journal" },
      { property: "og:description", content: "Buat, ubah nama, dan hapus folder catatanmu." },
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

  const count = (id: string) => state.notes.filter((n) => n.folderId === id).length;
  const normal = state.folders.filter((f) => !f.system);
  const system = state.folders.filter((f) => f.system);
  const favCount = state.notes.filter((n) => n.favorite).length;

  return (
    <Screen>
      <TopBar title="Folder" subtitle={`${state.folders.length} folder tersimpan`} />

      <SectionTitle
        action={
          <LinkAction onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
              <Plus className="h-3.5 w-3.5" /> Folder Baru
            </span>
          </LinkAction>
        }
      >
        Folder Saya
      </SectionTitle>

      <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl stagger">
        {normal.map((f, i) => {
          const Icon = iconFor(i);
          return (
            <div key={f.id} className="relative flex items-center gap-3 px-3.5 py-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 hover:scale-110"
                style={{ backgroundColor: `${f.color}26`, color: f.color }}
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
                className="press grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
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

      <SectionTitle>Koleksi</SectionTitle>
      <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl stagger">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-400/15">
            <Star className="h-[18px] w-[18px]" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold">Favorit</p>
            <p className="text-[11.5px] text-muted-foreground">{favCount} catatan</p>
          </div>
        </div>
        {system.map((f) => (
          <div key={f.id} className="flex items-center gap-3 px-3.5 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Archive className="h-[18px] w-[18px]" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">{f.name}</p>
              <p className="text-[11.5px] text-muted-foreground">{count(f.id)} catatan</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5 animate-fade-up">
        <div className="soft-card sheen relative flex items-center gap-3 overflow-hidden rounded-2xl bg-primary/5 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] tracking-tight-display">Rapikan dengan mudah</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Gunakan folder dan tag agar catatanmu selalu mudah ditemukan.
            </p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary animate-float-slow">
            <FolderClosed className="h-7 w-7" />
          </span>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-[520px] justify-end px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Folder baru"
          className="press-lg pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/35 animate-bounce-in transition-transform duration-300 hover:rotate-90"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 mx-auto max-w-[520px]">
          <button
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] animate-fade"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-5 pb-8 shadow-2xl animate-slide-up">
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  addFolder(name.trim());
                  setName("");
                  setOpen(false);
                }
              }}
              placeholder="Nama folder"
              className="mt-4 w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={() => {
                if (name.trim()) addFolder(name.trim());
                setName("");
                setOpen(false);
              }}
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
