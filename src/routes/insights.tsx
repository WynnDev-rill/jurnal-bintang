import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { EmptyState, Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { MOODS, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insight & Kalender Aktivitas — Aster Journal" },
      {
        name: "description",
        content:
          "Statistik menulis nyata: catatan dibuat, streak jurnal, refleksi, distribusi mood, tag teratas, dan kalender aktivitas harian.",
      },
      { property: "og:title", content: "Insight — Aster Journal" },
      { property: "og:description", content: "Statistik menulis, mood, dan kalender aktivitas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

const dayKey = (d: Date | string) => new Date(d).toDateString();

function InsightsPage() {
  const { state } = useStore();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  const hasData = state.notes.length > 0 || state.reflections.some((r) => r.body || r.mood);

  /** Hari "menulis": jurnal dibuat/diubah hari itu atau refleksi berisi teks. */
  const journalDays = useMemo(() => {
    const set = new Set<string>();
    state.notes
      .filter((n) => n.type === "journal")
      .forEach((n) => {
        set.add(dayKey(n.createdAt));
        set.add(dayKey(n.updatedAt));
      });
    state.reflections.filter((r) => r.body.trim()).forEach((r) => set.add(dayKey(r.createdAt)));
    return set;
  }, [state]);

  const stats = useMemo(() => {
    const notes = state.notes.length;
    const refl = state.reflections.filter((r) => r.body.trim()).length;
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = dayKey(new Date(Date.now() - i * 86400000));
      if (journalDays.has(d)) streak++;
      else if (i === 0) continue;
      else break;
    }
    return { notes, refl, streak };
  }, [state, journalDays]);

  const week = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        const k = dayKey(d);
        const c =
          state.notes.filter((n) => dayKey(n.createdAt) === k).length +
          state.reflections.filter((r) => dayKey(r.createdAt) === k && r.body.trim()).length;
        return { label: d.toLocaleDateString("id-ID", { weekday: "narrow" }), count: c };
      }),
    [state],
  );
  const maxWeek = Math.max(1, ...week.map((w) => w.count));
  const weekTotal = week.reduce((a, b) => a + b.count, 0);

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
  const moodEntries = [...moodCount.values()].reduce((a, b) => a + b, 0);
  const moodTotal = Math.max(1, moodEntries);

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
    const notes = state.notes.filter((n) => dayKey(n.createdAt) === k);
    const refls = state.reflections.filter((r) => dayKey(r.createdAt) === k);
    return { notes, refls, total: notes.length + refls.filter((r) => r.body.trim()).length };
  };

  const sel = dayData(selected);
  const recent = useMemo(
    () =>
      [...state.notes]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 4),
    [state.notes],
  );

  const cards = [
    {
      label: "Catatan Dibuat",
      value: stats.notes,
      sub: "Total",
      Icon: NotebookPen,
      color: "text-sky-500",
      tint: "tile-blue",
    },
    {
      label: "Streak Jurnal",
      value: stats.streak,
      sub: "Hari menulis",
      Icon: Flame,
      color: "text-amber-500",
      tint: "tile-amber",
    },
    {
      label: "Refleksi",
      value: stats.refl,
      sub: "Tersimpan",
      Icon: Heart,
      color: "text-violet-500",
      tint: "tile-violet",
    },
  ];

  return (
    <Screen>
      <TopBar title="Insight" subtitle="Ringkasan perjalanan menulismu" showDefaultActions={false} />

      <Scroll>
        <div className="grid grid-cols-3 gap-2.5 px-4 pt-4 stagger">
          {cards.map((s) => (
            <div
              key={s.label}
              className={`soft-card relative overflow-hidden rounded-2xl p-3 ${s.tint}`}
            >
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-display text-[26px] leading-none tracking-tight-display">
                {s.value}
              </p>
              <div className="mt-1.5 flex items-end justify-between">
                <p className="text-[10px] leading-tight text-muted-foreground">{s.sub}</p>
                <s.Icon className={`h-[15px] w-[15px] shrink-0 ${s.color}`} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

            </div>
          ))}
        </div>

        {!hasData && (
          <div className="px-4 pt-5">
            <EmptyState
              icon={<BarChart3 className="h-8 w-8" />}
              title="Belum ada data insight"
              description="Statistik, grafik, dan kalender akan terisi otomatis setelah kamu menulis catatan atau refleksi pertama."
            />
          </div>
        )}

        {hasData && (
          <>
            <SectionTitle>Aktivitas 7 Hari</SectionTitle>
            <div className="mx-4 soft-card rounded-2xl p-4">
              {weekTotal === 0 ? (
                <p className="py-6 text-center text-[12.5px] text-muted-foreground">
                  Belum ada aktivitas dalam 7 hari terakhir.
                </p>
              ) : (
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
              )}
            </div>

            <SectionTitle>Kalender Aktivitas</SectionTitle>
            <div className="mx-4 soft-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  aria-label="Bulan sebelumnya"
                  className="press grid h-8 w-8 place-items-center rounded-full bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="font-display text-[15px]">
                  {cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </p>
                <button
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  aria-label="Bulan berikutnya"
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
                    <CalendarCell
                      key={i}
                      date={d}
                      total={dayData(d).total}
                      selected={dayKey(d) === dayKey(selected)}
                      onSelect={() => setSelected(d)}
                    />
                  ) : (
                    <span key={i} />
                  ),
                )}
              </div>
            </div>

            <SectionTitle>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDate(selected.toISOString())}
              </span>
            </SectionTitle>
            <div
              className="mx-4 soft-card rounded-2xl p-4 animate-fade-up"
              key={selected.toDateString()}
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-xl">{sel.notes.length}</p>
                  <p className="text-[10px] text-muted-foreground">Catatan</p>
                </div>
                <div>
                  <p className="font-display text-xl">
                    {sel.refls.filter((r) => r.body.trim()).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Refleksi</p>
                </div>
                <div>
                  <p className="emoji text-xl">
                    {MOODS.find((m) => m.key === sel.refls.find((r) => r.mood)?.mood)?.emoji ?? "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Mood</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {sel.notes.slice(0, 4).map((n) => (
                  <p key={n.id} className="truncate rounded-lg bg-muted px-3 py-2 text-[12px]">
                    {n.title || "Tanpa Judul"}
                  </p>
                ))}
                {sel.refls
                  .filter((r) => r.body.trim())
                  .slice(0, 3)
                  .map((r) => (
                    <p key={r.id} className="truncate rounded-lg bg-muted px-3 py-2 text-[12px]">
                      {r.prompt}
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
              {moodEntries === 0 ? (
                <p className="py-4 text-center text-[12.5px] text-muted-foreground">
                  Belum ada mood tercatat. Pilih mood harianmu di halaman Refleksi.
                </p>
              ) : (
                MOODS.map((m) => {
                  const c = moodCount.get(m.key) ?? 0;
                  return (
                    <div key={m.key} className="flex items-center gap-3">
                      <span className="emoji w-6 text-lg" aria-hidden="true">
                        {m.emoji}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${(c / moodTotal) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[11px] text-muted-foreground">{c}</span>
                    </div>
                  );
                })
              )}
            </div>

            <SectionTitle>Tag Teratas</SectionTitle>
            <div className="px-4">
              {tags.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Tag className="h-6 w-6" />}
                  title="Belum ada tag"
                  description="Tambahkan tag pada catatan atau refleksi agar muncul di sini."
                />
              ) : (
                <div className="flex flex-wrap gap-2 stagger">
                  {tags.map(([t, c]) => (
                    <span
                      key={t}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary"
                    >
                      #{t} · {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {recent.length > 0 && (
              <>
                <SectionTitle>Catatan Terakhir</SectionTitle>
                <div className="mx-4 soft-card divide-y divide-border overflow-hidden rounded-2xl">
                  {recent.map((n) => (
                    <div key={n.id} className="px-4 py-3">
                      <p className="truncate text-[13.5px] font-medium">
                        {n.title || "Tanpa Judul"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(n.updatedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </Scroll>
    </Screen>
  );
}

function CalendarCell({
  date,
  total,
  selected,
  onSelect,
}: {
  date: Date;
  total: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const intensity = Math.min(1, total / 3);
  return (
    <button
      onClick={onSelect}
      className={`press aspect-square rounded-lg text-[11px] transition-all ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      style={{
        backgroundColor: total
          ? `color-mix(in oklch, var(--color-primary) ${12 + intensity * 50}%, transparent)`
          : "var(--color-secondary)",
        color: intensity > 0.7 ? "var(--color-primary-foreground)" : undefined,
      }}
    >
      {date.getDate()}
    </button>
  );
}
