import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Database,
  Download,
  FileDown,
  HelpCircle,
  Import,
  LayoutGrid,
  List,
  Moon,
  Pencil,
  RotateCcw,
  Shield,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { AsterFlower } from "@/components/aster/Logo";
import { useStore } from "@/lib/store";
import { sendNotificationPreview, setDailyReminder, setWeeklyDigest } from "@/lib/nativeNotifications";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil & Pengaturan — Aster Journal" },
      { name: "description", content: "Atur tampilan, pengingat, privasi, dan cadangan data Aster Journal." },
      { property: "og:title", content: "Profil & Pengaturan — Aster Journal" },
      { property: "og:description", content: "Kelola profil, preferensi, dan data Aster Journal." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProfilePage,
});

function Toggle({ on, onChange, label, disabled = false }: { on: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled} role="switch" aria-checked={on} aria-label={label} className={`press relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50 ${on ? "bg-primary" : "bg-muted-foreground/25"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-card shadow-md transition-all duration-300 ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ProfilePage() {
  const { state, storageIssue, updateProfile, importData, resetAll } = useStore();
  const p = state.profile;
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const storageBytes = new Blob([JSON.stringify(state)]).size;
  const storageLabel = storageBytes < 1024 * 1024 ? `${Math.max(1, Math.round(storageBytes / 1024))} KB` : `${(storageBytes / 1024 / 1024).toFixed(1)} MB`;

  const toggleReminder = async () => {
    setBusy(true);
    try {
      const result = await setDailyReminder(!p.reminders, p.reminderTime);
      if (!result.supported) { toast.info("Pengingat native hanya tersedia di APK Android."); return; }
      if (result.denied) { updateProfile({ reminders: false }); toast.error("Izin notifikasi ditolak. Aktifkan dari pengaturan aplikasi."); return; }
      updateProfile({ reminders: result.enabled });
      toast.success(result.enabled ? `Pengingat harian aktif pukul ${p.reminderTime}.` : "Pengingat harian dimatikan.");
    } catch { toast.error("Pengingat tidak dapat diubah pada perangkat ini."); }
    finally { setBusy(false); }
  };

  const changeReminderTime = async (time: string) => {
    updateProfile({ reminderTime: time });
    if (!p.reminders) return;
    try {
      const result = await setDailyReminder(true, time);
      if (result.supported && result.enabled) toast.success(`Pengingat dipindah ke pukul ${time}.`);
    } catch { toast.error("Jam pengingat tersimpan, tetapi jadwal native gagal diperbarui."); }
  };

  const toggleWeekly = async () => {
    setBusy(true);
    try {
      const result = await setWeeklyDigest(!p.weeklyDigest);
      if (!result.supported) { toast.info("Ringkasan native hanya tersedia di APK Android."); return; }
      if (result.denied) { updateProfile({ weeklyDigest: false }); toast.error("Izin notifikasi ditolak."); return; }
      updateProfile({ weeklyDigest: result.enabled });
      toast.success(result.enabled ? "Ringkasan mingguan aktif setiap Minggu pukul 19.00." : "Ringkasan mingguan dimatikan.");
    } catch { toast.error("Ringkasan mingguan tidak dapat diubah."); }
    finally { setBusy(false); }
  };

  const previewNotification = async () => {
    try {
      const result = await sendNotificationPreview();
      if (!result.supported) toast.info("Tes notifikasi hanya tersedia di APK Android.");
      else if (result.denied) toast.error("Izin notifikasi ditolak.");
      else toast.success("Notifikasi tes akan muncul sebentar lagi.");
    } catch { toast.error("Notifikasi tes gagal dijadwalkan."); }
  };

  const exportJson = () => {
    const backup = { app: "Aster Journal", schema: 3, exportedAt: new Date().toISOString(), data: state };
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`aster-journal-backup-${stamp}.json`, JSON.stringify(backup, null, 2), "application/json");
    toast.success("Cadangan JSON dibuat.");
  };

  const exportMarkdown = () => {
    const parts: string[] = ["# Aster Journal", "", `Diekspor: ${new Date().toLocaleString("id-ID")}`, ""];
    const notes = [...state.notes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    for (const note of notes) {
      parts.push(`## ${note.title || "Tanpa Judul"}`, "", `- Tipe: ${note.type}`, `- Tanggal: ${new Date(note.createdAt).toLocaleString("id-ID")}`);
      if (note.tags.length) parts.push(`- Tag: ${note.tags.map((t) => `#${t}`).join(" ")}`);
      parts.push("");
      if (note.body) parts.push(note.body, "");
      if (note.items.length) {
        parts.push(...note.items.map((item) => `- [${item.done ? "x" : " "}] ${item.text}`), "");
      }
    }
    if (state.reflections.some((r) => r.body.trim())) {
      parts.push("# Refleksi", "");
      state.reflections.filter((r) => r.body.trim()).forEach((r) => {
        parts.push(`## ${r.prompt}`, "", `_${new Date(r.createdAt).toLocaleString("id-ID")}_`, "", r.body, "");
      });
    }
    downloadText(`aster-journal-${new Date().toISOString().slice(0, 10)}.md`, parts.join("\n"), "text/markdown;charset=utf-8");
    toast.success("Ekspor Markdown dibuat.");
  };

  const handleImport = async (file: File) => {
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error("Berkas cadangan terlalu besar. Pilih JSON Aster Journal yang berukuran maksimal 8 MB.");
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!window.confirm("Impor akan mengganti data Aster Journal yang ada di perangkat ini. Lanjutkan?")) return;
      importData(parsed);
      toast.success("Cadangan berhasil dipulihkan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Berkas cadangan tidak dapat dibaca.");
    }
  };

  return (
    <Screen>
      <TopBar title="Profil" subtitle="Privasi, data & preferensi" showDefaultActions={false} />
      <Scroll>
        <div className="px-4 pt-4 animate-fade-up">
          <div className="soft-card flex items-center gap-4 rounded-3xl p-4">
            <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-primary/8"><AsterFlower className="h-12 w-12" /></span>
            <div className="min-w-0 flex-1">
              {edit ? (
                <div className="space-y-1.5">
                  <input autoFocus value={p.name} onChange={(e) => updateProfile({ name: e.target.value })} aria-label="Nama" placeholder="Nama tampilan" className="w-full rounded-lg bg-secondary/70 px-2.5 py-1.5 font-display text-[17px] outline-none" />
                  <input value={p.bio} onChange={(e) => updateProfile({ bio: e.target.value })} aria-label="Catatan singkat" placeholder="Catatan singkat (opsional)" className="w-full rounded-lg bg-secondary/70 px-2.5 py-1.5 text-[12px] text-muted-foreground outline-none" />
                </div>
              ) : (
                <><p className="truncate font-display text-[19px] tracking-tight-display">{p.name || "Pengguna Aster"}</p><p className="truncate text-[12.5px] text-muted-foreground">{p.bio || "Data jurnal tetap lokal di perangkat"}</p></>
              )}
              <button onClick={() => setEdit((v) => !v)} className="press mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary"><Pencil className="h-3.5 w-3.5" /> {edit ? "Selesai" : "Edit Profil"}</button>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3">
          <div className="rounded-2xl border border-primary/15 bg-primary/6 p-4">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Shield className="h-[18px] w-[18px]" /></span><div><p className="text-[13.5px] font-semibold">Local-first</p><p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">Catatan dan refleksi disimpan di perangkat. Tidak ada sinkronisasi cloud yang diklaim atau diaktifkan dari layar ini.</p></div></div>
          </div>
        </div>

        {storageIssue && <div role="alert" className="mx-4 mt-3 rounded-2xl border border-destructive/20 bg-destructive/8 p-3 text-[12px] leading-relaxed text-destructive">{storageIssue} Buat cadangan JSON sebelum menghapus data atau keluar dari aplikasi.</div>}

        <SectionTitle>Preferensi</SectionTitle>
        <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
          <Row Icon={Moon} label="Mode Gelap" hint="Pilihan tersimpan setelah aplikasi dibuka ulang"><Toggle label="Mode gelap" on={p.darkMode} onChange={() => updateProfile({ darkMode: !p.darkMode })} /></Row>
          <Row Icon={Bell} label="Pengingat Harian" hint={p.reminders ? `Aktif pukul ${p.reminderTime}` : "Tidak aktif"}><Toggle label="Pengingat harian" on={p.reminders} onChange={toggleReminder} disabled={busy} /></Row>
          <Row Icon={Bell} label="Jam Pengingat" hint="Atur waktu yang nyaman untuk menulis"><input type="time" value={p.reminderTime} onChange={(e) => changeReminderTime(e.target.value)} aria-label="Jam pengingat" className="min-h-10 rounded-lg border border-border bg-secondary/60 px-2 text-[12px] outline-none" /></Row>
          <Row Icon={Star} label="Ringkasan Mingguan" hint="Minggu pukul 19.00"><Toggle label="Ringkasan mingguan" on={p.weeklyDigest} onChange={toggleWeekly} disabled={busy} /></Row>
          <Row Icon={LayoutGrid} label="Tampilan Catatan" hint="Tampilan awal saat membuka Catatan"><div className="flex rounded-xl bg-muted p-1"><button onClick={() => updateProfile({ defaultView: "list" })} aria-pressed={p.defaultView === "list"} className={`press grid h-9 w-9 place-items-center rounded-lg ${p.defaultView === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><List className="h-4 w-4" /></button><button onClick={() => updateProfile({ defaultView: "grid" })} aria-pressed={p.defaultView === "grid"} className={`press grid h-9 w-9 place-items-center rounded-lg ${p.defaultView === "grid" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><LayoutGrid className="h-4 w-4" /></button></div></Row>
        </div>

        <SectionTitle>Data</SectionTitle>
        <div className="mx-4 mb-2 grid grid-cols-3 gap-2">
          <MiniStat label="Catatan" value={state.notes.length} /><MiniStat label="Refleksi" value={state.reflections.filter((r) => r.body.trim()).length} /><MiniStat label="Ukuran" value={storageLabel} />
        </div>
        <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
          <ActionRow Icon={Download} label="Cadangkan JSON" hint="Cadangan lengkap untuk dipulihkan" onClick={exportJson} />
          <label className="press flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><Import className="h-[17px] w-[17px]" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">Pulihkan Cadangan</span><span className="block text-[11.5px] text-muted-foreground">Impor berkas JSON Aster</span></span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void handleImport(file); }} />
          </label>
          <ActionRow Icon={FileDown} label="Ekspor Markdown" hint="Salinan mudah dibaca di aplikasi lain" onClick={exportMarkdown} />
          <ActionRow Icon={Bell} label="Tes Notifikasi" hint="Periksa izin dan ikon notifikasi APK" onClick={previewNotification} />
          <button onClick={() => { if (window.confirm("Hapus semua catatan, refleksi, folder, dan pengaturan Aster Journal?")) resetAll(); }} className="press flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left text-destructive"><span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/8"><RotateCcw className="h-[18px] w-[18px]" /></span><span className="flex-1 text-[14px] font-medium">Atur Ulang Semua Data</span></button>
        </div>

        <SectionTitle>Privasi & Cadangan</SectionTitle>
        <div className="mx-4 soft-card space-y-3 rounded-2xl p-4">
          <InfoLine Icon={Database} title="Disimpan di perangkat" description={`Data saat ini sekitar ${storageLabel}. Tidak ada sinkronisasi cloud otomatis.`} />
          <InfoLine Icon={Download} title="Cadangkan sebelum ganti perangkat" description="Gunakan Cadangkan JSON agar catatan, draf refleksi, folder, dan pengaturan bisa dipulihkan." />
          <InfoLine Icon={HelpCircle} title="Hapus dengan aman" description="Catatan masuk ke Sampah terlebih dahulu. Hapus permanen hanya dari koleksi Sampah." />
        </div>
        <p className="py-6 text-center font-display text-[11.5px] italic text-muted-foreground">Aster Journal</p>
      </Scroll>
    </Screen>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return <div className="soft-card rounded-2xl px-3 py-3 text-center"><p className="font-display text-[18px]">{value}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p></div>;
}

function ActionRow({ Icon, label, hint, onClick }: { Icon: typeof Bell; label: string; hint: string; onClick: () => void }) {
  return <button onClick={onClick} className="press flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="h-[17px] w-[17px]" /></span><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{label}</span><span className="block text-[11.5px] text-muted-foreground">{hint}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /></button>;
}

function Row({ Icon, label, hint, children }: { Icon: typeof Bell; label: string; hint: string; children: React.ReactNode }) {
  return <div className="flex min-h-16 items-center gap-3 px-4 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="h-[17px] w-[17px]" /></span><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{label}</span><span className="block text-[11.5px] leading-snug text-muted-foreground">{hint}</span></span>{children}</div>;
}

function InfoLine({ Icon, title, description }: { Icon: typeof Bell; title: string; description: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="h-[17px] w-[17px]" /></span><span><span className="block text-[13px] font-semibold">{title}</span><span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted-foreground">{description}</span></span></div>;
}
