import { BookHeart, CheckSquare, FileText, X } from "lucide-react";
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
      label: "Jurnal Baru",
      desc: "Refleksikan dan tulis harimu",
      Icon: BookHeart,
      tint: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[520px]">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[3px] animate-fade"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+22px)] pt-4 shadow-2xl animate-slide-up">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="text-center font-display text-[18px] tracking-tight-display">Buat Cepat</h2>

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border stagger">
          {options.map(({ type, label, desc, Icon, tint }) => (
            <button
              key={type}
              onClick={() => onCreate(type)}
              className="press flex w-full items-center gap-3 bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}>
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{label}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{desc}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="press-lg grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
