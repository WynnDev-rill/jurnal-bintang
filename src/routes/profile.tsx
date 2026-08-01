import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CloudUpload,
  Download,
  Fingerprint,
  HelpCircle,
  Info,
  LayoutGrid,
  Moon,
  Palette,
  Pencil,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { AsterFlower } from "@/components/aster/Logo";
import { useStore } from "@/lib/store";
import { setDailyReminder, setWeeklyDigest } from "@/lib/nativeNotifications";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil & Pengaturan — Aster Journal" },
      {
        name: "description",
        content:
          "Atur profil, tampilan, pengingat harian, keamanan, dan cadangan data Aster Journal milikmu.",
      },
      { property: "og:title", content: "Profil & Pengaturan — Aster Journal" },
      { property: "og:description", content: "Kelola profil, preferensi, dan data Aster Journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function Toggle({
  on,
  onChange,
  label,
  disabled = false,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`press relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50 ${
        on ? "bg-primary" : "bg-muted-foreground/25"
      }`}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-card shadow-md transition-all duration-300 ${
          on ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function ProfilePage() {
  const { state, updateProfile, resetAll } = useStore();
  const p = state.profile;
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleReminder = async () => {
    setBusy(true);
    try {
      const result = await setDailyReminder(!p.reminders);
      if (!result.supported) {
        toast.info("Pengingat native hanya tersedia di APK Android.");
        return;
      }
      if (result.denied) {
        updateProfile({ reminders: false });
        toast.error("Izin notifikasi ditolak. Aktifkan dari pengaturan aplikasi.");
        return;
      }
      updateProfile({ reminders: result.enabled });
      toast.success(
        result.enabled ? "Pengingat harian aktif pukul 20.00." : "Pengingat harian dimatikan.",
      );
    } catch {
      toast.error("Pengingat tidak dapat diubah pada perangkat ini.");
    } finally {
      setBusy(false);
    }
  };

  const toggleWeekly = async () => {
    setBusy(true);
    try {
      const result = await setWeeklyDigest(!p.weeklyDigest);
      if (!result.supported) {
        toast.info("Ringkasan native hanya tersedia di APK Android.");
        return;
      }
      if (result.denied) {
        updateProfile({ weeklyDigest: false });
        toast.error("Izin notifikasi ditolak.");
        return;
      }
      updateProfile({ weeklyDigest: result.enabled });
      toast.success(
        result.enabled
          ? "Ringkasan mingguan aktif setiap Minggu pukul 19.00."
          : "Ringkasan mingguan dimatikan.",
      );
    } catch {
      toast.error("Ringkasan mingguan tidak dapat diubah.");
    } finally {
      setBusy(false);
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aster-journal.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Screen>
      <TopBar title="Profil" subtitle="Akun & pengaturan" showDefaultActions={false} />

      <Scroll>
        <div className="px-4 pt-4 animate-fade-up">
          <div className="soft-card flex items-center gap-4 rounded-3xl p-4">
            <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-primary/8">
              <AsterFlower className="h-12 w-12" />
            </span>
            <div className="min-w-0 flex-1">
              {edit ? (
                <div className="space-y-1.5">
                  <input
                    autoFocus
                    value={p.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    aria-label="Nama"
                    placeholder="Nama tampilan"
                    className="w-full rounded-lg bg-secondary/70 px-2.5 py-1.5 font-display text-[17px] outline-none"
                  />
                  <input
                    value={p.bio}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    aria-label="Catatan singkat"
                    placeholder="Catatan singkat (opsional)"
                    className="w-full rounded-lg bg-secondary/70 px-2.5 py-1.5 text-[12px] text-muted-foreground outline-none"
                  />
                </div>
              ) : (
                <>
                  <p className="truncate font-display text-[19px] tracking-tight-display">
                    {p.name || "Pengguna Aster"}
                  </p>
                  <p className="truncate text-[12.5px] text-muted-foreground">
                    {p.bio || "Belum masuk · data tersimpan di perangkat"}
                  </p>
                </>
              )}
              <button
                onClick={() => setEdit((v) => !v)}
                className="press mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary"
              >
                <Pencil className="h-3.5 w-3.5" /> {edit ? "Selesai" : "Edit Profil"}
              </button>
            </div>
          </div>
        </div>

        <SectionTitle>Preferensi</SectionTitle>
        <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl stagger">
          <Row Icon={Palette} label="Tampilan" hint="Tema terang Aster">
            <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-muted-foreground">
              {p.darkMode ? "Gelap" : "Terang"}
              <ChevronRight className="h-4 w-4" />
            </span>
          </Row>
          <Row Icon={Moon} label="Mode Gelap" hint="Opsional, desain utama terang">
            <Toggle
              label="Mode gelap"
              on={p.darkMode}
              onChange={() => updateProfile({ darkMode: !p.darkMode })}
            />
          </Row>
          <Row Icon={Bell} label="Pengingat" hint="Setiap hari pukul 20.00">
            <Toggle label="Pengingat" on={p.reminders} onChange={toggleReminder} disabled={busy} />
          </Row>
          <Row Icon={Star} label="Ringkasan Mingguan" hint="Setiap Minggu pukul 19.00">
            <Toggle
              label="Ringkasan mingguan"
              on={p.weeklyDigest}
              onChange={toggleWeekly}
              disabled={busy}
            />
          </Row>
          <Row Icon={Shield} label="Kata Sandi & Keamanan" hint="Belum tersedia">
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Belum tersedia
            </span>
          </Row>
          <Row Icon={Fingerprint} label="Kunci Biometrik" hint="Belum tersedia">
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Belum tersedia
            </span>
          </Row>
          <Row Icon={CloudUpload} label="Cadangkan & Sinkron" hint="Ekspor manual ke berkas JSON">
            <span className="shrink-0 text-[12.5px] text-muted-foreground">Lokal</span>
          </Row>
          <Row Icon={LayoutGrid} label="Tampilan Default" hint="Daftar catatan saat aplikasi dibuka">
            <span className="shrink-0 text-[12.5px] text-muted-foreground">Daftar</span>
          </Row>
        </div>

        <SectionTitle>Data</SectionTitle>
        <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
          <button
            onClick={exportData}
            className="press flex w-full items-center gap-3 p-4 text-left"
          >
            <Download className="h-[18px] w-[18px] shrink-0 text-primary" />
            <span className="flex-1 text-[14px] font-medium">Ekspor Data</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm("Hapus semua catatan, refleksi, folder, dan pengaturan Aster Journal?")
              )
                resetAll();
            }}
            className="press flex w-full items-center gap-3 p-4 text-left text-destructive"
          >
            <RotateCcw className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-[14px] font-medium">Atur Ulang Data</span>
          </button>
        </div>

        <SectionTitle>Tentang</SectionTitle>
        <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
          <Row Icon={HelpCircle} label="Bantuan" hint="Semua catatan tersimpan otomatis di perangkat">
            <span className="w-0" />
          </Row>
          <Row Icon={Sparkles} label="Apa yang Baru" hint="Tampilan terang baru & kalender aktivitas">
            <span className="w-0" />
          </Row>
          <Row Icon={Info} label="Tentang Aster Journal" hint="Versi 1.0 · by Wynn">
            <span className="w-0" />
          </Row>
        </div>

        <p className="py-6 text-center font-display text-[11.5px] italic text-muted-foreground">
          Aster Journal — by Wynn
        </p>
      </Scroll>
    </Screen>
  );
}

function Row({
  Icon,
  label,
  hint,
  children,
}: {
  Icon: typeof Bell;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium">{label}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{hint}</span>
      </span>
      {children}
    </div>
  );
}
