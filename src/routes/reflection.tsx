import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dices, Heart, Pencil, Sparkles, Trash2, X } from "lucide-react";
import { EmptyState, Screen, Scroll, SectionTitle } from "@/components/aster/Screen";
import { TopBar } from "@/components/aster/TopBar";
import { ReflectionScene } from "@/components/aster/Logo";
import { MOODS, PROMPTS, relativeDate, useStore, type MoodKey } from "@/lib/store";

export const Route = createFileRoute("/reflection")({
  head: () => ({
    meta: [
      { title: "Refleksi Harian — Aster Journal" },
      {
        name: "description",
        content:
          "Tulis refleksi harian dengan prompt acak, catat mood, dan simpan kembali momen penting harimu.",
      },
      { property: "og:title", content: "Refleksi Harian — Aster Journal" },
      {
        property: "og:description",
        content: "Prompt refleksi, mood tracker, dan riwayat refleksi harian.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReflectionPage,
});

function ReflectionPage() {
  const { state, addReflection, deleteReflection, togglePromptFavorite, setMoodToday } = useStore();
  const [promptIdx, setPromptIdx] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [spin, setSpin] = useState(0);
  const [composer, setComposer] = useState(false);
  const [list, setList] = useState(false);
  const [tab, setTab] = useState<"all" | "fav" | "history">("all");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [favoriteDraft, setFavoriteDraft] = useState(false);

  const prompt = PROMPTS[promptIdx];
  const todayMood = useMemo(() => {
    const today = new Date().toDateString();
    return state.reflections.find(
      (r) => new Date(r.createdAt).toDateString() === today && r.mood,
    )?.mood;
  }, [state.reflections]);

  const saved = state.reflections.filter((r) => r.body.trim());

  /** Never repeat a prompt while unseen prompts remain. */
  const shuffle = () => {
    const pool = PROMPTS.map((_, i) => i).filter((i) => !seen.includes(i));
    const candidates = pool.length > 0 ? pool : PROMPTS.map((_, i) => i).filter((i) => i !== promptIdx);
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    setPromptIdx(next);
    setSeen(pool.length > 0 ? [...seen, next] : [next]);
    setSpin((s) => s + 1);
  };

  const listed =
    tab === "fav"
      ? PROMPTS.filter((p) => state.favoritePrompts.includes(p))
      : tab === "history"
        ? Array.from(new Set(saved.map((r) => r.prompt)))
        : PROMPTS;

  const openComposer = () => {
    setBody("");
    setMood(todayMood ?? null);
    setTags([]);
    setTagInput("");
    setFavoriteDraft(state.favoritePrompts.includes(prompt));
    setComposer(true);
  };

  const addTag = () => {
    const t = tagInput.trim().toLocaleLowerCase("id-ID");
    if (t && !tags.includes(t)) setTags((c) => [...c, t]);
    setTagInput("");
  };

  const saveReflection = () => {
    if (body.trim()) {
      addReflection({ prompt, body: body.trim(), mood, tags });
      if (favoriteDraft && !state.favoritePrompts.includes(prompt)) togglePromptFavorite(prompt);
    }
    setComposer(false);
    setBody("");
    setMood(null);
    setTags([]);
  };

  return (
    <Screen>
      <TopBar title="Refleksi" subtitle="Satu pertanyaan, satu jeda" showDefaultActions={false} />

      <Scroll>
        <div className="px-4 pt-4 animate-fade-up">
          <div className="soft-card overflow-hidden rounded-3xl">
            <ReflectionScene className="h-40 w-full" />
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Prompt refleksi hari ini
              </p>
              <p
                key={promptIdx}
                className="mt-2 font-display text-[20px] leading-snug animate-fade-up"
              >
                {prompt}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={openComposer}
                  className="press flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  <Pencil className="h-4 w-4 shrink-0" /> Tulis Refleksi
                </button>
                <button
                  key={spin}
                  onClick={shuffle}
                  aria-label="Acak prompt"
                  className="press grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-foreground animate-dice"
                >
                  <Dices className="h-5 w-5" />
                </button>
                <button
                  onClick={() => togglePromptFavorite(prompt)}
                  aria-label="Favoritkan prompt"
                  className={`press grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                    state.favoritePrompts.includes(prompt)
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${state.favoritePrompts.includes(prompt) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <SectionTitle>Bagaimana perasaanmu?</SectionTitle>
        <div className="grid grid-cols-5 gap-2 px-4 stagger">
          {MOODS.map((m, i) => {
            const active = todayMood === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMoodToday(m.key)}
                aria-pressed={active}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`press flex flex-col items-center gap-1.5 rounded-2xl py-3 ring-2 transition-all duration-300 ${m.tint} ${
                  active ? `${m.ring} scale-[1.04] shadow-md` : "ring-transparent"
                }`}
              >
                <span className="emoji text-[22px]" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className={`text-[10.5px] font-semibold ${m.text}`}>{m.label}</span>
              </button>
            );
          })}
        </div>

        <SectionTitle
          action={
            <button onClick={() => setList(true)} className="press shrink-0 text-[12.5px] font-semibold text-primary">
              Semua prompt
            </button>
          }
        >
          Refleksi Terbaru
        </SectionTitle>
        <div className="space-y-3 px-4 stagger">
          {saved.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-7 w-7" />}
              title="Belum ada refleksi"
              description="Mulai dari prompt di atas. Tulis beberapa kalimat, catat mood, dan lihat perjalananmu tumbuh."
              action={
                <button
                  onClick={openComposer}
                  className="press rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Tulis refleksi pertama
                </button>
              }
            />
          ) : (
            saved.map((r) => (
              <div key={r.id} className="soft-card rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug">{r.prompt}</p>
                  <button
                    onClick={() => deleteReflection(r.id)}
                    className="press shrink-0 text-muted-foreground"
                    aria-label="Hapus refleksi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
                {r.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="emoji" aria-hidden="true">
                    {MOODS.find((m) => m.key === r.mood)?.emoji ?? "·"}
                  </span>
                  <span>{relativeDate(r.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Scroll>

      {composer && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
          <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
            <button
              onClick={() => setComposer(false)}
              aria-label="Tutup"
              className="press grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold">Refleksi Baru</p>
            <button
              onClick={() => setFavoriteDraft((v) => !v)}
              aria-label="Favoritkan prompt"
              className={`press grid h-9 w-9 place-items-center rounded-full ${
                favoriteDraft ? "text-rose-500" : "text-muted-foreground"
              }`}
            >
              <Heart className={`h-[18px] w-[18px] ${favoriteDraft ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={saveReflection}
              className="press rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Simpan
            </button>
          </header>
          <div className="no-scrollbar flex-1 overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <div className="rounded-2xl bg-primary/8 p-4">
              <p className="font-display text-[17px] leading-snug">{prompt}</p>
            </div>
            <textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Tulis apa pun yang terlintas…"
              className="mt-4 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/60"
            />

            <p className="mt-2 text-[11.5px] font-medium text-muted-foreground">Mood</p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  aria-label={m.label}
                  className={`press rounded-xl py-2 ring-2 transition-all duration-300 ${m.tint} ${
                    mood === m.key ? `${m.ring} scale-105` : "ring-transparent"
                  }`}
                >
                  <span className="emoji text-[20px]" aria-hidden="true">
                    {m.emoji}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-[11.5px] font-medium text-muted-foreground">Tag</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary animate-pop"
                >
                  #{t}
                  <button
                    onClick={() => setTags((c) => c.filter((x) => x !== t))}
                    aria-label={`Hapus tag ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="tambah tag"
                aria-label="Tambah tag"
                className="w-24 rounded-full border border-dashed border-border px-3 py-1 text-xs outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {list && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
          <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
            <button
              onClick={() => setList(false)}
              aria-label="Tutup"
              className="press grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold">Prompt Refleksi</p>
            <span className="w-9" />
          </header>
          <div className="flex shrink-0 gap-2 px-4 py-3">
            {(
              [
                ["all", "Semua"],
                ["fav", "Favorit"],
                ["history", "Riwayat"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`press rounded-full px-4 py-1.5 text-[13px] font-medium ${
                  tab === k
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 pb-8 stagger">
            {listed.map((p) => (
              <div key={p} className="soft-card flex items-center gap-3 rounded-2xl p-4">
                <button
                  onClick={() => {
                    const i = PROMPTS.indexOf(p);
                    if (i >= 0) {
                      setPromptIdx(i);
                      setSeen((s) => (s.includes(i) ? s : [...s, i]));
                    }
                    setList(false);
                  }}
                  className="min-w-0 flex-1 text-left text-[14px] leading-snug"
                >
                  {p}
                </button>
                <button
                  onClick={() => togglePromptFavorite(p)}
                  className={`press shrink-0 ${
                    state.favoritePrompts.includes(p) ? "text-rose-500" : "text-muted-foreground"
                  }`}
                  aria-label="Favoritkan"
                >
                  <Heart
                    className={`h-4 w-4 ${state.favoritePrompts.includes(p) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            ))}
            {listed.length === 0 && (
              <EmptyState
                compact
                icon={<Heart className="h-6 w-6" />}
                title={tab === "fav" ? "Belum ada prompt favorit" : "Belum ada riwayat"}
                description={
                  tab === "fav"
                    ? "Tandai prompt dengan ikon hati agar mudah ditemukan kembali."
                    : "Riwayat akan terisi setelah kamu menyimpan refleksi pertama."
                }
              />
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}
