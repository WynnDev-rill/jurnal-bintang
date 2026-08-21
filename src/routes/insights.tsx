import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  NotebookPen,
  Tag,
} from "lucide-react";
import { EmptyState, Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { MOODS, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insight & Kalender Aktivitas — Aster Journal" },
      { name: "description", content: "Ringkasan menulis, konsistensi, mood, kata, tag, dan kalender aktivitas Aster Journal." },
      { property: "og:title", content: "Insight — Aster Journal" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InsightsPage,
});

const dayKey = (d: Date | string) => new Date(d).toDateString();
const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

function InsightsPage() {
  const { state } = useStore();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const activeNotes = useMemo(() => state.notes.filter((n) => n.folderId !== "sys-trash"), [state.notes]);
  const writtenReflections = useMemo(() => state.reflections.filter((r) => r.body.trim()), [state.reflections]);
  const hasData = activeNotes.length > 0 || state.reflections.some((r) => r.body || r.mood);

  const journalDays = useMemo(() => {
    const set = new Set<string>();
    activeNotes
      .filter((n) => Boolean(n.title.trim() || n.body.trim() || n.image || n.items.some((item) => item.text.trim())))
      .forEach((n) => { set.add(dayKey(n.createdAt)); set.add(dayKey(n.updatedAt)); });
    writtenReflections.forEach((r) => set.add(dayKey(r.createdAt)));
    return set;
  }, [activeNotes, writtenReflections]);

  const stats = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = dayKey(new Date(Date.now() - i * 86400000));
      if (journalDays.has(d)) streak++;
      else if (i === 0) continue;
      else break;
    }
    return { notes: activeNotes.length, refl: writtenReflections.length, streak };
  }, [activeNotes.length, writtenReflections.length, journalDays]);

  const week = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
    const k = dayKey(d);
    const notes = activeNotes.filter((n) => dayKey(n.createdAt) === k);
    const refls = writtenReflections.filter((r) => dayKey(r.createdAt) === k);
    const moods = state.reflections.filter((r) => dayKey(r.createdAt) === k && r.mood);
    const words = notes.reduce((sum, n) => sum + wordCount(n.body) + n.items.reduce((s, item) => s + wordCount(item.text), 0), 0) + refls.reduce((sum, r) => sum + wordCount(r.body), 0);
    return { date: d, label: d.toLocaleDateString("id-ID", { weekday: "narrow" }), count: notes.length + refls.length, words, mood: moods[0]?.mood ?? null };
  }), [activeNotes, writtenReflections, state.reflections]);

  const previousWeekTotal = useMemo(() => {
    let total = 0;
    for (let i = 7; i < 14; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const k = dayKey(d);
      total += activeNotes.filter((n) => dayKey(n.createdAt) === k).length;
      total += writtenReflections.filter((r) => dayKey(r.createdAt) === k).length;
    }
    return total;
  }, [activeNotes, writtenReflections]);

  const weekTotal = week.reduce((sum, day) => sum + day.count, 0);
  const weekWords = week.reduce((sum, day) => sum + day.words, 0);
  const activeDays = week.filter((day) => day.count > 0).length;
  const maxWeek = Math.max(1, ...week.map((w) => w.count));
  const weekDelta = previousWeekTotal === 0 ? (weekTotal > 0 ? 100 : 0) : Math.round(((weekTotal - previousWeekTotal) / previousWeekTotal) * 100);

  const moodCount = useMemo(() => {
    const map = new Map<string, number>();
    state.reflections.forEach((r) => r.mood && map.set(r.mood, (map.get(r.mood) ?? 0) + 1));
    return map;
  }, [state.reflections]);
  const moodEntries = [...moodCount.values()].reduce((a, b) => a + b, 0);
  const moodTotal = Math.max(1, moodEntries);
  const dominantMood = MOODS.reduce<{ key: string; count: number; emoji: string; label: string } | null>((best, m) => {
    const count = moodCount.get(m.key) ?? 0;
    return !best || count > best.count ? { key: m.key, count, emoji: m.emoji, label: m.label } : best;
  }, null);

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    activeNotes.forEach((n) => n.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    writtenReflections.forEach((r) => r.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [activeNotes, writtenReflections]);

  const grid = useMemo(() => {
    const y = cursor.getFullYear(); const mo = cursor.getMonth(); const first = new Date(y, mo, 1);
    const start = (first.getDay() + 6) % 7; const days = new Date(y, mo + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: start }, () => null);
    for (let i = 1; i <= days; i++) cells.push(new Date(y, mo, i));
    return cells;
  }, [cursor]);

  const dayData = (d: Date) => {
    const k = dayKey(d);
    const notes = activeNotes.filter((n) => dayKey(n.createdAt) === k);
    const refls = state.reflections.filter((r) => dayKey(r.createdAt) === k);
    return { notes, refls, total: notes.length + refls.filter((r) => r.body.trim()).length };
  };
  const sel = dayData(selected);

  const cards = [
    { label: "Catatan", value: stats.notes, sub: "Aktif", Icon: NotebookPen, tint: "tile-blue", color: "text-sky-500" },
    { label: "Streak", value: stats.streak, sub: "Hari menulis", Icon: Flame, tint: "tile-amber", color: "text-amber-500" },
    { label: "Refleksi", value: stats.refl, sub: "Tersimpan", Icon: Heart, tint: "tile-violet", color: "text-violet-500" },
  ];

  return (
    <Screen>
      <TopBar title="Insight" subtitle="Lihat pola tanpa menghakimi harimu" showDefaultActions={false} />
      <Scroll>
        <div className="grid grid-cols-3 gap-2.5 px-4 pt-4 stagger">
          {cards.map((s) => <div key={s.label} className={`soft-card relative overflow-hidden rounded-2xl p-3 ${s.tint}`}><p className="text-[11px] font-medium leading-tight text-muted-foreground">{s.label}</p><p className="mt-1 font-display text-[26px] leading-none tracking-tight-display">{s.value}</p><div className="mt-1.5 flex items-end justify-between"><p className="text-[10px] leading-tight text-muted-foreground">{s.sub}</p><s.Icon className={`h-[15px] w-[15px] ${s.color}`} /></div></div>)}
        </div>

        {!hasData ? (
          <div className="px-4 pt-5"><EmptyState icon={<BarChart3 className="h-8 w-8" />} title="Belum ada data insight" description="Statistik akan terisi otomatis setelah kamu menulis atau mencatat mood. Tidak ada target yang harus dikejar." /></div>
        ) : (
          <>
            <SectionTitle>Minggu Ini</SectionTitle>
            <div className="mx-4 soft-card rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <SummaryCell label="Hari aktif" value={`${activeDays}/7`} />
                <SummaryCell label="Kata ditulis" value={weekWords.toLocaleString("id-ID")} />
                <SummaryCell label="Perubahan aktivitas" value={`${weekDelta > 0 ? "+" : ""}${weekDelta}%`} hint="dibanding 7 hari sebelumnya" />
                <SummaryCell label="Mood terbanyak" value={dominantMood?.count ? `${dominantMood.emoji} ${dominantMood.label}` : "Belum ada"} />
              </div>
            </div>

            <SectionTitle>Aktivitas 7 Hari</SectionTitle>
            <div className="mx-4 soft-card rounded-2xl p-4">
              {weekTotal === 0 ? <p className="py-6 text-center text-[12.5px] text-muted-foreground">Belum ada tulisan dalam 7 hari terakhir.</p> : (
                <div className="flex h-28 items-end justify-between gap-2">
                  {week.map((w, i) => <div key={i} className="flex flex-1 flex-col items-center gap-1.5"><div className="flex h-24 w-full items-end"><div className="w-full rounded-t-lg bg-primary/85 animate-grow" style={{ height: `${Math.max(6, (w.count / maxWeek) * 100)}%`, animationDelay: `${i * 60}ms` }} /></div><span className="text-[10px] text-muted-foreground">{w.label}</span></div>)}
                </div>
              )}
            </div>

            <SectionTitle>Mood 7 Hari</SectionTitle>
            <div className="mx-4 soft-card flex justify-between rounded-2xl p-4">
              {week.map((day, i) => { const m = MOODS.find((entry) => entry.key === day.mood); return <div key={i} className="flex min-w-0 flex-col items-center gap-1"><span className="emoji grid h-9 w-9 place-items-center rounded-full bg-muted text-lg">{m?.emoji ?? "·"}</span><span className="text-[9.5px] text-muted-foreground">{day.label}</span></div>; })}
            </div>

            <SectionTitle>Kalender Aktivitas</SectionTitle>
            <div className="mx-4 soft-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Bulan sebelumnya" className="press grid h-10 w-10 place-items-center rounded-full bg-muted"><ChevronLeft className="h-4 w-4" /></button>
                <p className="font-display text-[15px]">{cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Bulan berikutnya" className="press grid h-10 w-10 place-items-center rounded-full bg-muted"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">{["S", "S", "R", "K", "J", "S", "M"].map((d, i) => <span key={i}>{d}</span>)}</div>
              <div className="mt-1 grid grid-cols-7 gap-1">{grid.map((d, i) => d ? <CalendarCell key={i} date={d} total={dayData(d).total} selected={dayKey(d) === dayKey(selected)} onSelect={() => setSelected(d)} /> : <span key={i} />)}</div>
            </div>

            <SectionTitle><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(selected.toISOString())}</span></SectionTitle>
            <div className="mx-4 soft-card rounded-2xl p-4 animate-fade-up" key={selected.toDateString()}>
              <div className="grid grid-cols-3 gap-2 text-center"><div><p className="font-display text-xl">{sel.notes.length}</p><p className="text-[10px] text-muted-foreground">Catatan</p></div><div><p className="font-display text-xl">{sel.refls.filter((r) => r.body.trim()).length}</p><p className="text-[10px] text-muted-foreground">Refleksi</p></div><div><p className="emoji text-xl">{MOODS.find((m) => m.key === sel.refls.find((r) => r.mood)?.mood)?.emoji ?? "—"}</p><p className="text-[10px] text-muted-foreground">Mood</p></div></div>
              <div className="mt-3 space-y-1.5">{sel.notes.slice(0, 4).map((n) => <p key={n.id} className="truncate rounded-lg bg-muted px-3 py-2 text-[12px]">{n.title || "Tanpa Judul"}</p>)}{sel.refls.filter((r) => r.body.trim()).slice(0, 3).map((r) => <p key={r.id} className="truncate rounded-lg bg-muted px-3 py-2 text-[12px]">{r.prompt}</p>)}{sel.total === 0 && <p className="py-4 text-center text-[12px] text-muted-foreground">Tidak ada aktivitas pada tanggal ini.</p>}</div>
            </div>

            <SectionTitle>Distribusi Mood</SectionTitle>
            <div className="mx-4 soft-card space-y-2 rounded-2xl p-4">
              {moodEntries === 0 ? <p className="py-4 text-center text-[12.5px] text-muted-foreground">Belum ada mood tercatat.</p> : MOODS.map((m) => { const c = moodCount.get(m.key) ?? 0; return <div key={m.key} className="flex items-center gap-3"><span className="emoji w-6 text-lg">{m.emoji}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(c / moodTotal) * 100}%` }} /></div><span className="w-6 text-right text-[11px] text-muted-foreground">{c}</span></div>; })}
            </div>

            <SectionTitle>Tag Teratas</SectionTitle>
            <div className="px-4">{tags.length === 0 ? <EmptyState compact icon={<Tag className="h-6 w-6" />} title="Belum ada tag" description="Tambahkan tag pada catatan atau refleksi untuk melihat tema yang sering muncul." /> : <div className="flex flex-wrap gap-2 stagger">{tags.map(([t, c]) => <span key={t} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">#{t} · {c}</span>)}</div>}</div>
          </>
        )}
        <div className="h-4" />
      </Scroll>
    </Screen>
  );
}

function SummaryCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className="rounded-xl bg-muted/55 p-3"><p className="text-[10.5px] text-muted-foreground">{label}</p><p className="mt-1 font-display text-[18px] leading-tight">{value}</p>{hint && <p className="mt-1 text-[9.5px] leading-tight text-muted-foreground">{hint}</p>}</div>;
}

function CalendarCell({ date, total, selected, onSelect }: { date: Date; total: number; selected: boolean; onSelect: () => void }) {
  const today = dayKey(date) === dayKey(new Date());
  return <button onClick={onSelect} aria-label={`${date.getDate()} ${date.toLocaleDateString("id-ID", { month: "long" })}, ${total} aktivitas`} className={`press relative grid aspect-square min-h-9 place-items-center rounded-lg text-[11px] ${selected ? "bg-primary text-primary-foreground" : total > 0 ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted"}`}>{date.getDate()}{today && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}{total > 1 && !selected && <span className="absolute right-1 top-1 text-[8px] text-primary/70">{total}</span>}</button>;
}
