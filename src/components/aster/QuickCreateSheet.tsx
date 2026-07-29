import { BookHeart, CheckSquare, Download, FileText, LayoutTemplate } from "lucide-react";
import type { NoteType } from "@/lib/store";

export function QuickCreateSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (type: NoteType) => void;
}) {
  if (!open) return null;

  const options: { type: NoteType; label: string; desc: string; Icon: typeof FileText }[] = [
    { type: "note", label: "Catatan Baru", desc: "Tulis bebas tanpa format", Icon: FileText },
    { type: "checklist", label: "Checklist Baru", desc: "Daftar tugas yang bisa dicentang", Icon: CheckSquare },
    { type: "journal", label: "Entri Jurnal Baru", desc: "Refleksi harian yang lebih panjang", Icon: BookHeart },
  ];

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[520px]">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] animate-in fade-in"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-5 pb-8 shadow-2xl animate-slide-up">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="font-display text-lg">Buat Cepat</h2>
        <div className="mt-3 space-y-2 stagger">
          {options.map(({ type, label, desc, Icon }) => (
            <button
              key={type}
              onClick={() => onCreate(type)}
              className="press flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left hover:bg-muted"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onCreate("note")}
            className="press flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-medium"
          >
            <LayoutTemplate className="h-4 w-4" /> Template
          </button>
          <button
            onClick={() => onCreate("note")}
            className="press flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Impor
          </button>
        </div>
      </div>
    </div>
  );
}
