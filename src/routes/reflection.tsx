import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dices, Heart, Pencil, Sparkles, Trash2, X } from "lucide-react";
import { Screen, SectionTitle } from "@/components/aster/Screen";
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
    ],
  }),
  component: ReflectionPage,
});

function ReflectionPage() {
  const { state, addReflection, deleteReflection, togglePromptFavorite, setMoodToday } = useStore();
  const [promptIdx, setPromptIdx] = useState(0);
  const [spin, setSpin] = useState(0);
  const [composer, setComposer] = useState(false);
  const [list, setList] = useState(false);
  const [tab, setTab] = useState<"all" | "fav" | "history">("all");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<MoodKey | null>(null);

  const prompt = PROMPTS[promptIdx];
  const todayMood = useMemo(() => {
    const today = new Date().toDateString();
    return state.reflections.find(
      (r) => new Date(r.createdAt).toDateString() === today && r.mood,
    )?.mood;
  }, [state.reflections]);

  const shuffle = () => {
    setPromptIdx((i) => (i + 1 + Math.floor(Math.random() * (PROMPTS.length - 1))) % PROMPTS.length);
    setSpin((s) => s + 1);
  };

  const listed =
    tab === "fav"
      ? PROMPTS.filter((p) => state.favoritePrompts.includes(p))
      : tab === "history"
        ? Array.from(new Set(state.reflections.map((r) => r.prompt)))
        : PROMPTS;

  return (
    <Screen>
      <TopBar title="Refleksi" subtitle="Satu pertanyaan, satu jeda" />

      <div className="px-4 pt-4 animate-fade-up">
        <div className="soft-card overflow-hidden rounded-3xl">
          <ReflectionScene className="h-44 w-full" />
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Prompt hari ini
            </p>
            <p key={promptIdx} className="mt-2 font-display text-[20px] leading-snug animate-fade-up">
              {prompt}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setBody("");
                  setComposer(true);
                }}
                className="press flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
              >
                <Pencil className="h-4 w-4" /> Tulis Refleksi
              </button>
              <button
                key={spin}
                onClick={shuffle}
                aria-label="Acak prompt"
                className="press grid h-12 w-12 place-items-center rounded-2xl bg-muted text-foreground animate-dice"
              >
                <Dices className="h-5 w-5" />
              </button>
              <button
                onClick={() => togglePromptFavorite(prompt)}
                aria-label="Favoritkan prompt"
                className={`press grid h-12 w-12 place-items-center rounded-2xl ${
                  state.favoritePrompts.includes(prompt)
                    ? "bg-rose-500/12 text-rose-500"
                    : "bg-muted text-muted-foreground"
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
        {MOODS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMoodToday(m.key)}
            className={`press flex flex-col items-center gap-1 rounded-2xl border py-3 transition-colors ${
              todayMood === m.key
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <span className="text-2xl transition-transform duration-300 hover:scale-110">
              {m.emoji}
            </span>
            <span className="text-[10px] text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>

      <SectionTitle
        action={
          <button onClick={() => setList(true)} className="press text-xs font-medium text-primary">
            Lihat semua prompt
          </button>
        }
      >
        Refleksi Terbaru
      </SectionTitle>
      <div className="space-y-3 px-4 stagger">
        {state.reflections.filter((r) => r.body).length === 0 && (
          <p className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Belum ada refleksi. Mulai dari prompt di atas.
          </p>
        )}
        {state.reflections
          .filter((r) => r.body)
          .map((r) => (
            <div key={r.id} className="soft-card rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="flex-1 text-[13px] font-medium leading-snug">{r.prompt}</p>
                <button
                  onClick={() => deleteReflection(r.id)}
                  className="press text-muted-foreground"
                  aria-label="Hapus refleksi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{r.body}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{MOODS.find((m) => m.key === r.mood)?.emoji ?? "•"}</span>
                <span>{relativeDate(r.createdAt)}</span>
              </div>
            </div>
          ))}
      </div>

      {composer && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
          <header className="flex items-center gap-2 border-b border-border px-3 py-3">
            <button
              onClick={() => setComposer(false)}
              className="press grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold">Refleksi Baru</p>
            <button
              onClick={() => {
                if (body.trim()) addReflection({ prompt, body, mood });
                setComposer(false);
                setBody("");
                setMood(null);
              }}
              className="press rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Simpan
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-2xl bg-primary/8 p-4">
              <p className="font-display text-[17px] leading-snug">{prompt}</p>
            </div>
            <textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Tulis apa pun yang terlintas…"
              className="mt-4 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none"
            />
            <div className="mt-2 grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`press rounded-xl border py-2 text-xl ${
                    mood === m.key ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {list && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[520px] flex-col bg-background animate-slide-up">
          <header className="flex items-center gap-2 border-b border-border px-3 py-3">
            <button
              onClick={() => setList(false)}
              className="press grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold">Prompt Refleksi</p>
            <span className="w-9" />
          </header>
          <div className="flex gap-2 px-4 py-3">
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
                  tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-8 stagger">
            {listed.map((p) => (
              <div key={p} className="soft-card flex items-center gap-3 rounded-2xl p-4">
                <button
                  onClick={() => {
                    const i = PROMPTS.indexOf(p);
                    if (i >= 0) setPromptIdx(i);
                    setList(false);
                  }}
                  className="flex-1 text-left text-[14px] leading-snug"
                >
                  {p}
                </button>
                <button
                  onClick={() => togglePromptFavorite(p)}
                  className={`press ${
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
              <p className="py-10 text-center text-sm text-muted-foreground">Belum ada di sini.</p>
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}
