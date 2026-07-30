import { BookHeart, CheckSquare, Download, FileText, LayoutTemplate, X } from "lucide-react";
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

  const options: {
    type: NoteType;
    label: string;
    desc: string;
    Icon: typeof FileText;
    tint: string;
  }[] = [
    {
      type: "note",
      label: "Catatan Baru",
      desc: "Tulis catatan sederhana",
      Icon: FileText,
      tint: "bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300",
    },
    {
      type: "checklist",
      label: "Checklist Baru",
      desc: "Buat daftar tugas",
      Icon: CheckSquare,
      tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
    },
    {
      type: "journal",
      label: "Entri Jurnal Baru",
      desc: "Refleksikan dan tulis",
      Icon: BookHeart,
      tint: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[520px]">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[3px] animate-fade"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card px-4 pb-7 pt-4 shadow-2xl animate-slide-up">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="text-center font-display text-[18px] tracking-tight-display">Buat Cepat</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border divide-y divide-border stagger">
          {options.map(({ type, label, desc, Icon, tint }) => (
            <button
              key={type}
              onClick={() => onCreate(type)}
              className="press flex w-full items-center gap-3 bg-background px-4 py-3.5 text-left transition-colors hover:bg-muted"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 hover:scale-110 ${tint}`}
              >
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold">{label}</span>
                <span className="block text-[12px] text-muted-foreground">{desc}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[12px] font-medium text-muted-foreground">Tambah dari</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            onClick={() => onCreate("journal")}
            className="press flex items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 py-3 text-left hover:bg-muted"
          >
            <LayoutTemplate className="h-[18px] w-[18px] text-primary" />
            <span>
              <span className="block text-[13px] font-semibold">Template</span>
              <span className="block text-[11px] text-muted-foreground">Pakai template</span>
            </span>
          </button>
          <button
            onClick={() => onCreate("note")}
            className="press flex items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 py-3 text-left hover:bg-muted"
          >
            <Download className="h-[18px] w-[18px] text-primary" />
            <span>
              <span className="block text-[13px] font-semibold">Impor</span>
              <span className="block text-[11px] text-muted-foreground">Dari berkas</span>
            </span>
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="press-lg grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
