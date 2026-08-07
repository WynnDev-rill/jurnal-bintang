import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Dices,
  Heart,
  History,
  Leaf,
  ListChecks,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { EmptyState, Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { ReflectionScene } from "@/components/aster/Logo";
import { MOODS, PROMPTS, relativeDate, useStore, type MoodKey } from "@/lib/store";

export const Route = createFileRoute("/reflection")({
  head: () => ({
    meta: [
      { title: "Refleksi Harian — Aster Journal" },
      { name: "description", content: "Prompt refleksi harian, mood, dan catatan singkat untuk membantu memulai menulis tanpa halaman kosong." },
      { property: "og:title", content: "Refleksi Harian — Aster Journal" },
      { property: "og:description", content: "Satu pertanyaan, satu jeda, satu catatan yang berarti." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReflectionPage,
});

const daySeed = () => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return Math.abs(d.getFullYear() * 367 + day) % PROMPTS.length;
};

const QUICK_GUIDES = [
  {
    label: "3 Hal Baik",
    Icon: ListChecks,
    prompt: "Apa tiga hal baik yang terjadi hari ini, dan mengapa itu berarti bagiku?",
    body: "1. \n2. \n3. ",
    tags: ["syukur"],
  },
  {
    label: "Jernihkan Pikiran",
    Icon: Sparkles,
    prompt: "Apa yang paling memenuhi pikiranku sekarang?",
    body: "",
    tags: ["pikiran"],
  },
  {
    label: "Lepaskan",
    Icon: Leaf,
    prompt: "Apa yang tidak perlu kubawa sampai besok?",
    body: "",
    tags: ["melepas"],
  },
] as const;

function ReflectionPage() {
  const { state, addReflection, deleteReflection, togglePromptFavorite, setMoodToday } = useStore();
  const [promptIdx, setPromptIdx] = useState(daySeed);
  const [seen, setSeen] = useState<number[]>(() => [daySeed()]);
  const [composer, setComposer] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(() => PROMPTS[daySeed()]);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [allPrompts, setAllPrompts] = useState(false);
  const [promptSearch, setPromptSearch] = useState("");
  const [allReflections, setAllReflections] = useState(false);

  const prompt = PROMPTS[promptIdx];
  const isFavorite = state.favoritePrompts.includes(prompt);
  const saved = useMemo(() => state.reflections.filter((r) => r.body.trim()), [state.reflections]);
  const recent = allReflections ? saved : saved.slice(0, 4);
  const todayKey = new Date().toDateString();
  const todayMood = state.reflections.find((r) => new Date(r.createdAt).toDateString() === todayKey && r.mood)?.mood ?? null;

  const filteredPrompts = useMemo(() => {
    const q = promptSearch.trim().toLocaleLowerCase("id-ID");
    return PROMPTS.filter((p) => !q || p.toLocaleLowerCase("id-ID").includes(q));
  }, [promptSearch]);

  const memories = useMemo(() => {
    const now = new Date();
    const sameDay = (iso: string) => {
      const d = new Date(iso);
      return d.getFullYear() < now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    };
    const reflectionMemories = state.reflections
      .filter((r) => r.body.trim() && sameDay(r.createdAt))
      .map((r) => ({ id: `r-${r.id}`, title: r.prompt, body: r.body, date: r.createdAt }));
    const journalMemories = state.notes
      .filter((n) => n.type === "journal" && n.body.trim() && sameDay(n.createdAt))
      .map((n) => ({ id: `n-${n.id}`, title: n.title || "Jurnal", body: n.body, date: n.createdAt }));
    return [...reflectionMemories, ...journalMemories].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 4);
  }, [state.notes, state.reflections]);

  const shuffle = () => {
    let choices = PROMPTS.map((_, i) => i).filter((i) => !seen.includes(i));
    let nextSeen = seen;
    if (choices.length === 0) {
      choices = PROMPTS.map((_, i) => i).filter((i) => i !== promptIdx);
      nextSeen = [];
    }
    const next = choices[Math.floor(Math.random() * choices.length)] ?? 0;
    setPromptIdx(next);
    setSeen([...nextSeen, next]);
  };

  const openComposer = (nextPrompt = prompt, nextBody = "", nextTags: readonly string[] = []) => {
    setDraftPrompt(nextPrompt);
    setBody(nextBody);
    setTags([...nextTags]);
    setMood(todayMood);
    setTagInput("");
    setComposer(true);
  };

  const addTag = () => {
    const t = tagInput.trim().toLocaleLowerCase("id-ID");
    if (t && !tags.includes(t)) setTags((current) => [...current, t]);
    setTagInput("");
  };

  const saveReflection = () => {
    const text = body.trim();
    if (!text) return;
    addReflection({ prompt: draftPrompt, body: text, mood, tags });
    setBody("");
    setTags([]);
    setMood(null);
    setComposer(false);
  };

  return (
    <Screen>
      <TopBar title="Refleksi" subtitle="Satu pertanyaan, satu jeda" showDefaultActions={false} />
      <Scroll>
        <div className="px-4 pt-4">
          <div className="soft-card overflow-hidden rounded-3xl animate-fade-up">
            <div className="h-[170px] w-full overflow-hidden bg-sky-tint/40">
              <ReflectionScene className="block h-full w-full" />
            </div>
            <div className="p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Prompt refleksi hari ini</p>
              <h1 className="mt-2 font-display text-[23px] leading-tight tracking-tight-display">{prompt}</h1>
              <div className="mt-5 flex items-center gap-2">
                <button onClick={() => openComposer()} className="press flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground shadow-lg shadow-primary/25"><Pencil className="h-[18px] w-[18px]" />Tulis Refleksi</button>
                <button onClick={shuffle} aria-label="Ganti prompt" className="press grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground"><Dices className="h-[19px] w-[19px]" /></button>
                <button onClick={() => togglePromptFavorite(prompt)} aria-label={isFavorite ? "Hapus prompt dari favorit" : "Favoritkan prompt"} aria-pressed={isFavorite} className={`press grid h-12 w-12 place-items-center rounded-full bg-secondary ${isFavorite ? "text-rose-500" : "text-muted-foreground"}`}><Heart className={`h-[19px] w-[19px] ${isFavorite ? "fill-current" : ""}`} /></button>
              </div>
            </div>
          </div>
        </div>

        <SectionTitle>Mulai Cepat</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5 px-4">
          {QUICK_GUIDES.map((guide) => (
            <button key={guide.label} onClick={() => openComposer(guide.prompt, guide.body, guide.tags)} className="press soft-card flex min-h-[104px] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><guide.Icon className="h-[18px] w-[18px]" /></span>
              <span className="mt-2 text-[11.5px] font-semibold leading-tight">{guide.label}</span>
            </button>
          ))}
        </div>

        <SectionTitle>Bagaimana perasaanmu?</SectionTitle>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
          {MOODS.map((m) => {
            const active = todayMood === m.key;
            return (
              <button key={m.key} onClick={() => setMoodToday(m.key)} aria-pressed={active} className={`press flex min-w-[82px] min-h-[88px] flex-col items-center justify-center rounded-2xl px-2 ${m.tint} ${active ? `ring-2 ${m.ring}` : ""}`}>
                <span className="emoji text-[27px]" aria-hidden="true">{m.emoji}</span>
                <span className={`mt-2 text-[11.5px] font-semibold ${m.text}`}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {memories.length > 0 && (
          <>
            <SectionTitle><span className="inline-flex items-center gap-1.5"><History className="h-4 w-4 text-primary" />Pada Hari Ini</span></SectionTitle>
            <div className="space-y-2 px-4">
              {memories.map((memory) => (
                <div key={memory.id} className="soft-card rounded-2xl p-4">
                  <p className="text-[10.5px] font-medium text-muted-foreground">{new Date(memory.date).getFullYear()}</p>
                  <p className="mt-1 font-display text-[15px] leading-snug">{memory.title}</p>
                  <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-muted-foreground">{memory.body}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <SectionTitle action={<button onClick={() => setAllPrompts(true)} className="press min-h-10 px-1 text-[12.5px] font-semibold text-primary">Semua prompt</button>}>Refleksi Terbaru</SectionTitle>
        {saved.length === 0 ? (
          <div className="px-4"><EmptyState compact icon={<Sparkles className="h-7 w-7" />} title="Belum ada refleksi" description="Jawaban refleksimu akan tersimpan di sini. Mood tetap bisa dicatat tanpa harus menulis." /></div>
        ) : (
          <div className="space-y-2.5 px-4">
            {recent.map((r) => {
              const m = MOODS.find((entry) => entry.key === r.mood);
              return (
                <div key={r.id} className="soft-card rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><span className="text-[10.5px] text-muted-foreground">{relativeDate(r.createdAt)}</span>{m && <span className="emoji text-base" aria-label={`Mood ${m.label}`}>{m.emoji}</span>}</div>
                      <p className="mt-1 font-display text-[14.5px] leading-snug">{r.prompt}</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/80">{r.body}</p>
                      {r.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{r.tags.map((tag) => <span key={tag} className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] text-primary">#{tag}</span>)}</div>}
                    </div>
                    <button onClick={() => { if (window.confirm("Hapus refleksi ini?")) deleteReflection(r.id); }} aria-label="Hapus refleksi" className="press grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
            {saved.length > 4 && <button onClick={() => setAllReflections((v) => !v)} className="press min-h-11 w-full rounded-xl text-[12.5px] font-semibold text-primary">{allReflections ? "Ringkas" : `Lihat semua ${saved.length} refleksi`}</button>}
          </div>
        )}
        <div className="h-4" />
      </Scroll>

      {composer && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
          <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
            <button onClick={() => setComposer(false)} aria-label="Tutup refleksi" className="press grid h-10 w-10 place-items-center rounded-full"><X className="h-[19px] w-[19px]" /></button>
            <p className="flex-1 text-center text-sm font-semibold">Tulis Refleksi</p>
            <button onClick={saveReflection} disabled={!body.trim()} className="press min-h-10 rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-40">Simpan</button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+32px)] pt-5">
            <p className="font-display text-[21px] leading-snug">{draftPrompt}</p>
            <textarea autoFocus value={body} onChange={(e) => setBody(e.target.value)} rows={12} placeholder="Tulis apa adanya…" className="mt-4 w-full resize-none rounded-2xl border border-border bg-card p-4 text-[15px] leading-relaxed outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
            <p className="mt-4 text-[11.5px] font-medium text-muted-foreground">Mood (opsional)</p>
            <div className="mt-2 flex gap-2">
              {MOODS.map((m) => <button key={m.key} onClick={() => setMood(m.key)} aria-label={m.label} aria-pressed={mood === m.key} className={`press grid h-11 flex-1 place-items-center rounded-xl ${m.tint} ${mood === m.key ? `ring-2 ${m.ring}` : ""}`}><span className="emoji text-xl">{m.emoji}</span></button>)}
            </div>
            <p className="mt-4 text-[11.5px] font-medium text-muted-foreground">Tag (opsional)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="flex min-h-9 items-center rounded-full bg-primary/10 px-3 text-xs text-primary">#{tag}<button onClick={() => setTags((current) => current.filter((x) => x !== tag))} aria-label={`Hapus tag ${tag}`} className="ml-1 grid h-7 w-7 place-items-center"><X className="h-3 w-3" /></button></span>)}
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="Tambah tag" className="min-h-10 w-28 rounded-full border border-dashed border-border bg-transparent px-3 text-xs outline-none" />
            </div>
          </div>
        </div>
      )}

      {allPrompts && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
          <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
            <button onClick={() => setAllPrompts(false)} aria-label="Tutup daftar prompt" className="press grid h-10 w-10 place-items-center rounded-full"><X className="h-[19px] w-[19px]" /></button>
            <div className="flex-1"><p className="text-sm font-semibold">Semua Prompt</p><p className="text-[10.5px] text-muted-foreground">{PROMPTS.length} pertanyaan</p></div>
            <BookOpen className="h-5 w-5 text-primary" />
          </header>
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5"><Search className="h-4 w-4 text-muted-foreground" /><input value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} placeholder="Cari prompt…" className="w-full bg-transparent text-sm outline-none" /></div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3">
            <div className="space-y-2">
              {filteredPrompts.map((p) => {
                const favorite = state.favoritePrompts.includes(p);
                return <div key={p} className="soft-card flex items-center gap-2 rounded-2xl p-3"><button onClick={() => { const idx = PROMPTS.indexOf(p); setPromptIdx(idx); setSeen((s) => s.includes(idx) ? s : [...s, idx]); setAllPrompts(false); }} className="press min-h-11 flex-1 text-left font-display text-[14px] leading-snug">{p}</button><button onClick={() => togglePromptFavorite(p)} aria-label={favorite ? "Hapus dari favorit" : "Favoritkan prompt"} className={`press grid h-10 w-10 shrink-0 place-items-center rounded-full ${favorite ? "text-rose-500" : "text-muted-foreground"}`}><Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} /></button></div>;
              })}
              {filteredPrompts.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Tidak ada prompt yang cocok.</p>}
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
