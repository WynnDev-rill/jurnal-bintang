import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NoteType = "note" | "checklist" | "journal";

export type ChecklistItem = { id: string; text: string; done: boolean };

export type Note = {
  id: string;
  type: NoteType;
  title: string;
  body: string;
  items: ChecklistItem[];
  tags: string[];
  folderId: string | null;
  pinned: boolean;
  favorite: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Folder = { id: string; name: string; color: string; system?: boolean };

export type MoodKey = "great" | "good" | "okay" | "meh" | "hard";

export type Reflection = {
  id: string;
  prompt: string;
  body: string;
  mood: MoodKey | null;
  tags: string[];
  createdAt: string;
};

export type Profile = {
  name: string;
  email: string;
  bio: string;
  darkMode: boolean;
  reminders: boolean;
  weeklyDigest: boolean;
  biometric: boolean;
};

export type AsterState = {
  notes: Note[];
  folders: Folder[];
  reflections: Reflection[];
  favoritePrompts: string[];
  profile: Profile;
};

export const MOODS: { key: MoodKey; label: string; emoji: string }[] = [
  { key: "great", label: "Hebat", emoji: "😄" },
  { key: "good", label: "Baik", emoji: "🙂" },
  { key: "okay", label: "Biasa", emoji: "😐" },
  { key: "meh", label: "Kurang", emoji: "😕" },
  { key: "hard", label: "Berat", emoji: "😢" },
];

export const PROMPTS: string[] = [
  "Apa hal kecil yang membuatku bersyukur hari ini?",
  "Apa sesuatu yang aku banggakan tapi sering kuabaikan?",
  "Kapan terakhir kali aku merasa benar-benar tenang?",
  "Apa yang ingin kulepaskan minggu ini?",
  "Siapa orang yang paling berpengaruh untukku belakangan ini?",
  "Apa pelajaran terbesar dari kesalahan terakhirku?",
  "Bagaimana aku ingin mengingat hari ini sepuluh tahun lagi?",
  "Apa yang tubuhku coba katakan padaku hari ini?",
  "Apa satu langkah kecil menuju tujuan besarku?",
  "Apa yang membuatku tertawa hari ini?",
];

const KEY = "aster-journal-v1";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

function seed(): AsterState {
  return {
    folders: [
      { id: "f-personal", name: "Pribadi", color: "#7aa7ff" },
      { id: "f-work", name: "Pekerjaan", color: "#f0a868" },
      { id: "f-ideas", name: "Ide", color: "#8fd8b0" },
      { id: "f-journal", name: "Jurnal", color: "#d8a8e8" },
      { id: "f-archive", name: "Arsip", color: "#a8b4c8", system: true },
    ],
    notes: [
      {
        id: uid(),
        type: "journal",
        title: "Jurnal Pagi",
        body: "Udara pagi ini terasa ringan. Aku duduk di beranda, menyeduh teh, dan menyadari betapa jarangnya aku memberi waktu untuk diam. Hari ini aku ingin bergerak lebih pelan.",
        items: [],
        tags: ["pagi", "syukur"],
        folderId: "f-journal",
        pinned: true,
        favorite: true,
        image: null,
        createdAt: daysAgo(0),
        updatedAt: daysAgo(0),
      },
      {
        id: uid(),
        type: "checklist",
        title: "Prinsip Desain",
        body: "",
        items: [
          { id: uid(), text: "Kejelasan sebelum keindahan", done: true },
          { id: uid(), text: "Konsistensi menciptakan kepercayaan", done: true },
          { id: uid(), text: "Beri ruang untuk bernapas", done: false },
          { id: uid(), text: "Gerak harus punya makna", done: false },
        ],
        tags: ["desain", "kerja"],
        folderId: "f-work",
        pinned: true,
        favorite: false,
        image: null,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      {
        id: uid(),
        type: "note",
        title: "Ide Aplikasi Baru",
        body: "Aplikasi yang membantu orang menuliskan satu kalimat setiap hari. Sederhana, tanpa tekanan, hanya satu kalimat.",
        items: [],
        tags: ["ide"],
        folderId: "f-ideas",
        pinned: false,
        favorite: true,
        image: null,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        id: uid(),
        type: "checklist",
        title: "Belanja Mingguan",
        body: "",
        items: [
          { id: uid(), text: "Kopi bubuk", done: false },
          { id: uid(), text: "Roti gandum", done: true },
          { id: uid(), text: "Buah segar", done: false },
        ],
        tags: ["rumah"],
        folderId: "f-personal",
        pinned: false,
        favorite: false,
        image: null,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      {
        id: uid(),
        type: "note",
        title: "Catatan Rapat",
        body: "Tim sepakat memprioritaskan onboarding. Target rilis akhir bulan.",
        items: [],
        tags: ["kerja", "rapat"],
        folderId: "f-work",
        pinned: false,
        favorite: false,
        image: null,
        createdAt: daysAgo(5),
        updatedAt: daysAgo(4),
      },
    ],
    reflections: [
      {
        id: uid(),
        prompt: PROMPTS[0],
        body: "Aku bersyukur untuk kopi hangat dan pesan singkat dari teman lama.",
        mood: "good",
        tags: ["syukur"],
        createdAt: daysAgo(0),
      },
      {
        id: uid(),
        prompt: PROMPTS[3],
        body: "Aku ingin melepas kebiasaan membandingkan progresku dengan orang lain.",
        mood: "okay",
        tags: ["tumbuh"],
        createdAt: daysAgo(1),
      },
      {
        id: uid(),
        prompt: PROMPTS[6],
        body: "Sebagai hari ketika aku memilih istirahat tanpa merasa bersalah.",
        mood: "great",
        tags: ["istirahat"],
        createdAt: daysAgo(3),
      },
    ],
    favoritePrompts: [PROMPTS[1]],
    profile: {
      name: "Emily Carter",
      email: "emily.carter@email.com",
      bio: "Menulis pelan-pelan, setiap hari.",
      darkMode: false,
      reminders: true,
      weeklyDigest: false,
      biometric: false,
    },
  };
}

type Ctx = {
  state: AsterState;
  ready: boolean;
  addNote: (n: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleItem: (noteId: string, itemId: string) => void;
  addFolder: (name: string, color?: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  addReflection: (r: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  togglePromptFavorite: (p: string) => void;
  setMoodToday: (m: MoodKey) => void;
  updateProfile: (p: Partial<Profile>) => void;
  resetAll: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

const COLORS = ["#7aa7ff", "#f0a868", "#8fd8b0", "#d8a8e8", "#f2a5a5", "#9fd0e8"];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsterState>(() => seed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...seed(), ...(JSON.parse(raw) as AsterState) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", state.profile.darkMode);
  }, [state.profile.darkMode, ready]);

  const addNote = useCallback((n: Partial<Note>) => {
    const note: Note = {
      id: uid(),
      type: "note",
      title: "",
      body: "",
      items: [],
      tags: [],
      folderId: null,
      pinned: false,
      favorite: false,
      image: null,
      createdAt: now(),
      updatedAt: now(),
      ...n,
    };
    setState((s) => ({ ...s, notes: [note, ...s.notes] }));
    return note;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now() } : n)),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)),
    }));
  }, []);

  const toggleItem = useCallback((noteId: string, itemId: string) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: now(),
              items: n.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
            }
          : n,
      ),
    }));
  }, []);

  const addFolder = useCallback((name: string, color?: string) => {
    setState((s) => ({
      ...s,
      folders: [
        ...s.folders,
        { id: uid(), name, color: color ?? COLORS[s.folders.length % COLORS.length] },
      ],
    }));
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setState((s) => ({
      ...s,
      folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      folders: s.folders.filter((f) => f.id !== id),
      notes: s.notes.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)),
    }));
  }, []);

  const addReflection = useCallback((r: Partial<Reflection>) => {
    setState((s) => ({
      ...s,
      reflections: [
        {
          id: uid(),
          prompt: r.prompt ?? PROMPTS[0],
          body: r.body ?? "",
          mood: r.mood ?? null,
          tags: r.tags ?? [],
          createdAt: now(),
        },
        ...s.reflections,
      ],
    }));
  }, []);

  const deleteReflection = useCallback((id: string) => {
    setState((s) => ({ ...s, reflections: s.reflections.filter((r) => r.id !== id) }));
  }, []);

  const togglePromptFavorite = useCallback((p: string) => {
    setState((s) => ({
      ...s,
      favoritePrompts: s.favoritePrompts.includes(p)
        ? s.favoritePrompts.filter((x) => x !== p)
        : [...s.favoritePrompts, p],
    }));
  }, []);

  const setMoodToday = useCallback((m: MoodKey) => {
    setState((s) => {
      const today = new Date().toDateString();
      const idx = s.reflections.findIndex(
        (r) => new Date(r.createdAt).toDateString() === today && !r.body,
      );
      if (idx >= 0) {
        const next = [...s.reflections];
        next[idx] = { ...next[idx], mood: m };
        return { ...s, reflections: next };
      }
      return {
        ...s,
        reflections: [
          { id: uid(), prompt: "Mood hari ini", body: "", mood: m, tags: [], createdAt: now() },
          ...s.reflections,
        ],
      };
    });
  }, []);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  }, []);

  const resetAll = useCallback(() => setState(seed()), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      addNote,
      updateNote,
      deleteNote,
      togglePin,
      toggleFavorite,
      toggleItem,
      addFolder,
      renameFolder,
      deleteFolder,
      addReflection,
      deleteReflection,
      togglePromptFavorite,
      setMoodToday,
      updateProfile,
      resetAll,
    }),
    [
      state,
      ready,
      addNote,
      updateNote,
      deleteNote,
      togglePin,
      toggleFavorite,
      toggleItem,
      addFolder,
      renameFolder,
      deleteFolder,
      addReflection,
      deleteReflection,
      togglePromptFavorite,
      setMoodToday,
      updateProfile,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function relativeDate(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) return `${diff} hari lalu`;
  return formatDate(iso);
}
