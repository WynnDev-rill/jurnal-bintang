import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, FolderClosed, Plus, Trash2, X } from "lucide-react";
import { Screen, SectionTitle } from "@/components/aster/Screen";
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

function FoldersPage() {
  const { state, addFolder, renameFolder, deleteFolder } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const count = (id: string) => state.notes.filter((n) => n.folderId === id).length;
  const normal = state.folders.filter((f) => !f.system);
  const system = state.folders.filter((f) => f.system);

  return (
    <Screen>
      <TopBar title="Folder" subtitle={`${state.folders.length} folder tersimpan`} />

      <SectionTitle>Folder Saya</SectionTitle>
      <div className="space-y-2 px-4 stagger">
        {normal.map((f) => (
          <div key={f.id} className="soft-card flex items-center gap-3 rounded-2xl p-3.5">
            <span
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ backgroundColor: `${f.color}26`, color: f.color }}
            >
              <FolderClosed className="h-5 w-5" />
            </span>
            <input
              value={f.name}
              onChange={(e) => renameFolder(f.id, e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
            />
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {count(f.id)}
            </span>
            <button
              onClick={() => deleteFolder(f.id)}
              className="press text-muted-foreground"
              aria-label={`Hapus folder ${f.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <SectionTitle>Sistem</SectionTitle>
      <div className="space-y-2 px-4 stagger">
        {system.map((f) => (
          <div key={f.id} className="soft-card flex items-center gap-3 rounded-2xl p-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Archive className="h-5 w-5" />
            </span>
            <p className="flex-1 text-sm font-medium">{f.name}</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {count(f.id)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5">
        <button
          onClick={() => setOpen(true)}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-3.5 text-sm font-semibold text-primary"
        >
          <Plus className="h-4 w-4" /> Folder Baru
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 mx-auto max-w-[520px]">
          <button
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-5 pb-8 animate-slide-up">
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
              placeholder="Nama folder"
              className="mt-4 w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none"
            />
            <button
              onClick={() => {
                if (name.trim()) addFolder(name.trim());
                setName("");
                setOpen(false);
              }}
              className="press mt-3 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Simpan Folder
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
}
