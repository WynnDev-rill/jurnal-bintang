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

export const MOODS: {
  key: MoodKey;
  label: string;
  emoji: string;
  tint: string;
  ring: string;
  text: string;
}[] = [
  {
    key: "great",
    label: "Hebat",
    emoji: "🌞",
    tint: "bg-amber-100/70 dark:bg-amber-400/15",
    ring: "ring-amber-300 dark:ring-amber-400/60",
    text: "text-amber-600 dark:text-amber-300",
  },
  {
    key: "good",
    label: "Baik",
    emoji: "😊",
    tint: "bg-emerald-100/70 dark:bg-emerald-400/15",
    ring: "ring-emerald-300 dark:ring-emerald-400/60",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  {
    key: "okay",
    label: "Biasa",
    emoji: "😌",
    tint: "bg-sky-100/70 dark:bg-sky-400/15",
    ring: "ring-sky-300 dark:ring-sky-400/60",
    text: "text-sky-600 dark:text-sky-300",
  },
  {
    key: "meh",
    label: "Kurang",
    emoji: "😕",
    tint: "bg-violet-100/70 dark:bg-violet-400/15",
    ring: "ring-violet-300 dark:ring-violet-400/60",
    text: "text-violet-600 dark:text-violet-300",
  },
  {
    key: "hard",
    label: "Berat",
    emoji: "😔",
    tint: "bg-rose-100/70 dark:bg-rose-400/15",
    ring: "ring-rose-300 dark:ring-rose-400/60",
    text: "text-rose-600 dark:text-rose-300",
  },
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

/** System folders that always exist. No demo content is ever injected. */
export const SYSTEM_FOLDERS: Folder[] = [
  { id: "sys-archive", name: "Arsip", color: "#a8b4c8", system: true },
  { id: "sys-trash", name: "Sampah", color: "#c8a8a8", system: true },
];

export const GUEST_PROFILE: Profile = {
  name: "Pengguna Aster",
  email: "",
  bio: "",
  darkMode: false,
  reminders: false,
  weeklyDigest: false,
  biometric: false,
};

/** Fresh install state — completely empty, only system folders. */
function emptyState(): AsterState {
  return {
    folders: SYSTEM_FOLDERS.map((f) => ({ ...f })),
    notes: [],
    reflections: [],
    favoritePrompts: [],
    profile: { ...GUEST_PROFILE },
  };
}

/** Merge stored data safely: never drop real user data, only add missing defaults. */
function migrate(raw: string): AsterState {
  const base = emptyState();
  let saved: Partial<AsterState> = {};
  try {
    saved = JSON.parse(raw) as Partial<AsterState>;
  } catch {
    return base;
  }

  const folders = Array.isArray(saved.folders) ? [...saved.folders] : [];
  for (const sys of SYSTEM_FOLDERS) {
    if (!folders.some((f) => f.id === sys.id || (f.system && f.name === sys.name))) {
      folders.push({ ...sys });
    }
  }

  return {
    folders,
    notes: Array.isArray(saved.notes) ? saved.notes : [],
    reflections: Array.isArray(saved.reflections) ? saved.reflections : [],
    favoritePrompts: Array.isArray(saved.favoritePrompts) ? saved.favoritePrompts : [],
    profile: { ...base.profile, ...(saved.profile ?? {}), darkMode: false },
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
  const [state, setState] = useState<AsterState>(() => emptyState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(migrate(raw));
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

  const resetAll = useCallback(() => setState(emptyState()), []);

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
