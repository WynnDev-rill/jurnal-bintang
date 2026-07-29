import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Flame, NotebookPen, Sparkles } from "lucide-react";
import { Screen, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { MOODS, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insight & Kalender Aktivitas — Aster Journal" },
      {
        name: "description",
        content:
          "Lihat statistik menulis, streak jurnal, distribusi mood, tag teratas, dan kalender aktivitas harian.",
      },
      { property: "og:title", content: "Insight — Aster Journal" },
      { property: "og:description", content: "Statistik menulis, mood, dan kalender aktivitas." },
    ],
  }),
  component: InsightsPage,
});

const dayKey = (d: Date | string) => new Date(d).toDateString();

function InsightsPage() {
  const { state } = useStore();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  const stats = useMemo(() => {
    const notes = state.notes.length;
    const refl = state.reflections.filter((r) => r.body).length;
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = dayKey(new Date(Date.now() - i * 86400000));
      const has =
        state.notes.some((n) => dayKey(n.updatedAt) === d) ||
        state.reflections.some((r) => dayKey(r.createdAt) === d);
      if (has) streak++;
      else if (i > 0) break;
    }
    return { notes, refl, streak };
  }, [state]);

  const week = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        const k = dayKey(d);
        const c =
          state.notes.filter((n) => dayKey(n.updatedAt) === k).length +
          state.reflections.filter((r) => dayKey(r.createdAt) === k).length;
        return { label: d.toLocaleDateString("id-ID", { weekday: "narrow" }), count: c };
      }),
    [state],
  );
  const maxWeek = Math.max(1, ...week.map((w) => w.count));

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    state.notes.forEach((n) => n.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    state.reflections.forEach((r) => r.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [state]);

  const moodCount = useMemo(() => {
    const m = new Map<string, number>();
    state.reflections.forEach((r) => r.mood && m.set(r.mood, (m.get(r.mood) ?? 0) + 1));
    return m;
  }, [state]);
  const moodTotal = Math.max(1, [...moodCount.values()].reduce((a, b) => a + b, 0));

  const grid = useMemo(() => {
    const y = cursor.getFullYear();
    const mo = cursor.getMonth();
    const first = new Date(y, mo, 1);
    const start = (first.getDay() + 6) % 7;
    const days = new Date(y, mo + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: start }, () => null);
    for (let i = 1; i <= days; i++) cells.push(new Date(y, mo, i));
    return cells;
  }, [cursor]);

  const dayData = (d: Date) => {
    const k = dayKey(d);
    const notes = state.notes.filter((n) => dayKey(n.updatedAt) === k);
    const refls = state.reflections.filter((r) => dayKey(r.createdAt) === k);
    return { notes, refls, total: notes.length + refls.length };
  };

  const sel = dayData(selected);

  return (
    <Screen>
      <TopBar title="Insight" subtitle="Ringkasan perjalanan menulismu · By Wynn" />

      <div className="grid grid-cols-3 gap-2 px-4 pt-4 stagger">
        {[
          { label: "Catatan Dibuat", value: stats.notes, Icon: NotebookPen },
          { label: "Streak Jurnal", value: `${stats.streak} hari`, Icon: Flame },
          { label: "Refleksi", value: stats.refl, Icon: Sparkles },
        ].map((s) => (
          <div key={s.label} className="soft-card rounded-2xl p-3 text-center">
            <s.Icon className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1.5 font-display text-xl">{s.value}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <SectionTitle>Aktivitas 7 Hari</SectionTitle>
      <div className="mx-4 soft-card rounded-2xl p-4">
        <div className="flex h-28 items-end justify-between gap-2">
          {week.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-primary/85 animate-grow"
                  style={{
                    height: `${Math.max(6, (w.count / maxWeek) * 100)}%`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Kalender Aktivitas</SectionTitle>
      <div className="mx-4 soft-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="press grid h-8 w-8 place-items-center rounded-full bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-display text-[15px]">
            {cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="press grid h-8 w-8 place-items-center rounded-full bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((d, i) =>
            d ? (
              (() => {
                const info = dayData(d);
                const isSel = dayKey(d) === dayKey(selected);
                const intensity = Math.min(1, info.total / 3);
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(d)}
                    className={`press relative aspect-square rounded-lg text-[11px] transition-all ${
                      isSel ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      backgroundColor: info.total
                        ? `color-mix(in oklch, var(--color-primary) ${12 + intensity * 55}%, transparent)`
                        : "var(--color-muted)",
                      color: intensity > 0.6 ? "var(--color-primary-foreground)" : undefined,
                    }}
                  >
                    {d.getDate()}
                  </button>
                );
              })()
            ) : (
              <span key={i} />
            ),
          )}
        </div>
      </div>

      <SectionTitle>Ringkasan {formatDate(selected.toISOString())}</SectionTitle>
      <div className="mx-4 soft-card rounded-2xl p-4 animate-fade-up" key={selected.toDateString()}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-display text-xl">{sel.notes.length}</p>
            <p className="text-[10px] text-muted-foreground">Catatan</p>
          </div>
          <div>
            <p className="font-display text-xl">{sel.refls.filter((r) => r.body).length}</p>
            <p className="text-[10px] text-muted-foreground">Refleksi</p>
          </div>
          <div>
            <p className="text-xl">
              {MOODS.find((m) => m.key === sel.refls.find((r) => r.mood)?.mood)?.emoji ?? "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Mood</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {sel.notes.slice(0, 4).map((n) => (
            <p key={n.id} className="truncate rounded-lg bg-muted px-3 py-2 text-[12px]">
              📝 {n.title || "Tanpa Judul"}
            </p>
          ))}
          {sel.refls
            .filter((r) => r.body)
            .slice(0, 3)
            .map((r) => (
              <p key={r.id} className="truncate rounded-lg bg-muted px-3 py-2 text-[12px]">
                ✨ {r.prompt}
              </p>
            ))}
          {sel.total === 0 && (
            <p className="py-4 text-center text-[12px] text-muted-foreground">
              Tidak ada aktivitas pada tanggal ini.
            </p>
          )}
        </div>
      </div>

      <SectionTitle>Distribusi Mood</SectionTitle>
      <div className="mx-4 soft-card space-y-2 rounded-2xl p-4">
        {MOODS.map((m) => {
          const c = moodCount.get(m.key) ?? 0;
          return (
            <div key={m.key} className="flex items-center gap-3">
              <span className="w-6 text-lg">{m.emoji}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(c / moodTotal) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-[11px] text-muted-foreground">{c}</span>
            </div>
          );
        })}
      </div>

      <SectionTitle>Tag Teratas</SectionTitle>
      <div className="flex flex-wrap gap-2 px-4 stagger">
        {tags.map(([t, c]) => (
          <span key={t} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">
            #{t} · {c}
          </span>
        ))}
        {tags.length === 0 && <p className="text-sm text-muted-foreground">Belum ada tag.</p>}
      </div>
    </Screen>
  );
}
