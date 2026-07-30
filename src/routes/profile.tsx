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
  LogOut,
  Moon,
  Palette,
  Pencil,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { Screen, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { AsterFlower } from "@/components/aster/Logo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Akun & Pengaturan — Aster Journal" },
      {
        name: "description",
        content:
          "Kelola akun, tampilan, pengingat, keamanan, dan data Aster Journal dalam satu halaman.",
      },
      { property: "og:title", content: "Akun & Pengaturan — Aster Journal" },
      {
        property: "og:description",
        content: "Pengaturan akun, tampilan, pengingat, dan keamanan.",
      },
    ],
  }),
  component: ProfilePage,
});

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`press relative h-[26px] w-[46px] rounded-full transition-colors duration-300 ${
        on ? "bg-primary" : "bg-muted-foreground/30"
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

  return (
    <Screen>
      <TopBar title="Profil" subtitle="Akun & pengaturan" showDefaultActions={false} />

      <div className="px-4 animate-fade-up">
        <div className="soft-card flex items-center gap-4 rounded-3xl p-4">
          <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-primary/10 animate-float-slow">
            <AsterFlower className="h-12 w-12" />
          </span>
          <div className="min-w-0 flex-1">
            {edit ? (
              <div className="space-y-1.5 animate-fade">
                <input
                  autoFocus
                  value={p.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  aria-label="Nama"
                  className="w-full rounded-lg bg-muted px-2.5 py-1.5 font-display text-[17px] outline-none"
                />
                <input
                  value={p.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  aria-label="Email"
                  className="w-full rounded-lg bg-muted px-2.5 py-1.5 text-[12px] text-muted-foreground outline-none"
                />
                <input
                  value={p.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  aria-label="Bio"
                  className="w-full rounded-lg bg-muted px-2.5 py-1.5 text-[12px] text-muted-foreground outline-none"
                />
              </div>
            ) : (
              <>
                <p className="truncate font-display text-[19px] tracking-tight-display">{p.name}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">{p.email}</p>
                <p className="truncate text-[11.5px] text-muted-foreground/80">{p.bio}</p>
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
        <Row Icon={Palette} label="Tampilan" hint="Tema lembut Aster">
          <span className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
            {p.darkMode ? "Gelap" : "Terang"}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Row>
        <Row Icon={Moon} label="Mode Gelap" hint="Nyaman untuk malam hari">
          <Toggle
            label="Mode gelap"
            on={p.darkMode}
            onChange={() => updateProfile({ darkMode: !p.darkMode })}
          />
        </Row>
        <Row Icon={Bell} label="Pengingat" hint="Ingatkan menulis tiap hari">
          <Toggle
            label="Pengingat"
            on={p.reminders}
            onChange={() => updateProfile({ reminders: !p.reminders })}
          />
        </Row>
        <Row Icon={Star} label="Ringkasan Mingguan" hint="Kirim rekap tiap Minggu">
          <Toggle
            label="Ringkasan mingguan"
            on={p.weeklyDigest}
            onChange={() => updateProfile({ weeklyDigest: !p.weeklyDigest })}
          />
        </Row>
        <Row Icon={Fingerprint} label="Kunci Biometrik" hint="Buka dengan sidik jari">
          <Toggle
            label="Kunci biometrik"
            on={p.biometric}
            onChange={() => updateProfile({ biometric: !p.biometric })}
          />
        </Row>
        <Row Icon={Shield} label="Kata Sandi & Keamanan" hint="Kelola akses akun">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Row>
        <Row Icon={CloudUpload} label="Cadangkan & Sinkron" hint="Data tersimpan di perangkat">
          <span className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
            Lokal
            <ChevronRight className="h-4 w-4" />
          </span>
        </Row>
      </div>

      <SectionTitle>Data</SectionTitle>
      <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "aster-journal.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="press flex w-full items-center gap-3 p-4 text-left"
        >
          <Download className="h-[18px] w-[18px] text-primary" />
          <span className="flex-1 text-[14px] font-medium">Ekspor Data</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => resetAll()}
          className="press flex w-full items-center gap-3 p-4 text-left text-destructive"
        >
          <RotateCcw className="h-[18px] w-[18px]" />
          <span className="flex-1 text-[14px] font-medium">Atur Ulang Data</span>
        </button>
        <button className="press flex w-full items-center gap-3 p-4 text-left text-destructive">
          <LogOut className="h-[18px] w-[18px]" />
          <span className="flex-1 text-[14px] font-medium">Keluar</span>
        </button>
      </div>

      <SectionTitle>Tentang</SectionTitle>
      <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl stagger">
        <Row Icon={HelpCircle} label="Bantuan & Dukungan" hint="Panduan singkat memakai Aster">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Row>
        <Row Icon={Sparkles} label="Apa yang Baru" hint="Kalender aktivitas & insight">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Row>
        <Row Icon={Info} label="Tentang Aster Journal" hint="Versi 1.0 · By Wynn">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Row>
      </div>

      <p className="py-6 text-center font-display text-[11.5px] italic text-muted-foreground">
        Aster Journal — by Wynn
      </p>
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
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 hover:scale-110">
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
