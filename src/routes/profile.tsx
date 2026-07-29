import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Download,
  Fingerprint,
  Info,
  LogOut,
  Moon,
  Palette,
  RotateCcw,
  Shield,
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
      { property: "og:description", content: "Pengaturan akun, tampilan, pengingat, dan keamanan." },
    ],
  }),
  component: ProfilePage,
});

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={on}
      className={`press relative h-6 w-11 rounded-full transition-colors duration-300 ${
        on ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function ProfilePage() {
  const { state, updateProfile, resetAll } = useStore();
  const p = state.profile;

  return (
    <Screen>
      <TopBar title="Akun" subtitle="Pengaturan & preferensi" />

      <div className="px-4 pt-4 animate-fade-up">
        <div className="soft-card flex items-center gap-4 rounded-3xl p-5">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/12 text-primary">
            <AsterFlower className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <input
              value={p.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full bg-transparent font-display text-lg outline-none"
            />
            <input
              value={p.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full bg-transparent text-[12px] text-muted-foreground outline-none"
            />
            <input
              value={p.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              className="mt-1 w-full bg-transparent text-[12px] text-muted-foreground outline-none"
            />
          </div>
        </div>
      </div>

      <SectionTitle>Preferensi</SectionTitle>
      <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl stagger">
        <Row Icon={Palette} label="Tampilan" hint="Tema lembut Aster">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Row>
        <Row Icon={Moon} label="Mode Gelap" hint="Nyaman untuk malam hari">
          <Toggle on={p.darkMode} onChange={() => updateProfile({ darkMode: !p.darkMode })} />
        </Row>
        <Row Icon={Bell} label="Pengingat" hint="Ingatkan menulis tiap hari">
          <Toggle on={p.reminders} onChange={() => updateProfile({ reminders: !p.reminders })} />
        </Row>
        <Row Icon={Star} label="Ringkasan Mingguan" hint="Kirim rekap tiap Minggu">
          <Toggle
            on={p.weeklyDigest}
            onChange={() => updateProfile({ weeklyDigest: !p.weeklyDigest })}
          />
        </Row>
        <Row Icon={Fingerprint} label="Kunci Biometrik" hint="Buka dengan sidik jari">
          <Toggle on={p.biometric} onChange={() => updateProfile({ biometric: !p.biometric })} />
        </Row>
        <Row Icon={Shield} label="Kata Sandi & Keamanan" hint="Kelola akses akun">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
          <Download className="h-4 w-4 text-primary" />
          <span className="flex-1 text-sm font-medium">Ekspor Data</span>
        </button>
        <button
          onClick={() => resetAll()}
          className="press flex w-full items-center gap-3 p-4 text-left text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="flex-1 text-sm font-medium">Atur Ulang Data</span>
        </button>
        <button className="press flex w-full items-center gap-3 p-4 text-left text-destructive">
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-sm font-medium">Keluar</span>
        </button>
      </div>

      <SectionTitle>Tentang</SectionTitle>
      <div className="mx-4 soft-card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Aster Journal · v1.0</p>
            <p className="text-[11px] text-muted-foreground">
              Dibuat dengan tenang · <span className="font-semibold">By Wynn</span>
            </p>
          </div>
        </div>
      </div>
      <p className="py-6 text-center text-[11px] text-muted-foreground">Aster Journal — By Wynn</p>
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
    <div className="flex items-center gap-3 p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </span>
      {children}
    </div>
  );
}
