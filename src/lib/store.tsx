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

/** A locally persisted reflection that has not yet been committed to history. */
export type ReflectionDraft = {
  prompt: string;
  body: string;
  mood: MoodKey | null;
  tags: string[];
  updatedAt: string;
};

export type Profile = {
  name: string;
  email: string;
  bio: string;
  darkMode: boolean;
  reminders: boolean;
  reminderTime: string;
  weeklyDigest: boolean;
  biometric: boolean;
  defaultView: "list" | "grid";
};

export type AsterState = {
  notes: Note[];
  folders: Folder[];
  reflections: Reflection[];
  reflectionDraft: ReflectionDraft | null;
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
  { key: "great", label: "Hebat", emoji: "😄", tint: "bg-amber-100/70 dark:bg-amber-400/15", ring: "ring-amber-300 dark:ring-amber-400/60", text: "text-amber-600 dark:text-amber-300" },
  { key: "good", label: "Baik", emoji: "😊", tint: "bg-emerald-100/70 dark:bg-emerald-400/15", ring: "ring-emerald-300 dark:ring-emerald-400/60", text: "text-emerald-600 dark:text-emerald-300" },
  { key: "okay", label: "Biasa", emoji: "😌", tint: "bg-sky-100/70 dark:bg-sky-400/15", ring: "ring-sky-300 dark:ring-sky-400/60", text: "text-sky-600 dark:text-sky-300" },
  { key: "meh", label: "Kurang", emoji: "😕", tint: "bg-violet-100/70 dark:bg-violet-400/15", ring: "ring-violet-300 dark:ring-violet-400/60", text: "text-violet-600 dark:text-violet-300" },
  { key: "hard", label: "Berat", emoji: "😔", tint: "bg-rose-100/70 dark:bg-rose-400/15", ring: "ring-rose-300 dark:ring-rose-400/60", text: "text-rose-600 dark:text-rose-300" },
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
  "Apa tiga hal yang berjalan lebih baik dari perkiraanku hari ini?",
  "Apa yang paling banyak menghabiskan energiku belakangan ini?",
  "Hal apa yang sebenarnya bisa kukendalikan hari ini?",
  "Apa yang sedang kuhindari, dan kenapa?",
  "Kapan hari ini aku merasa paling menjadi diriku sendiri?",
  "Apa keputusan kecil hari ini yang ingin kuulangi besok?",
  "Apa yang kupelajari tentang diriku dari percakapan terakhir yang penting?",
  "Apa kebutuhan yang belum kuberi ruang hari ini?",
  "Apa hal sederhana yang ingin kulakukan lebih pelan?",
  "Apa satu kekhawatiran yang bisa kutaruh dulu untuk malam ini?",
  "Apa yang membuat hari ini berbeda dari kemarin?",
  "Jika hari ini punya judul, apa judulnya?",
  "Apa satu momen yang ingin kusimpan lebih lama?",
  "Apa yang kukira penting pagi tadi tetapi terasa kurang penting sekarang?",
  "Apa batas yang perlu kujaga lebih baik?",
  "Apa yang membuatku merasa dekat dengan seseorang akhir-akhir ini?",
  "Apa bentuk kebaikan kecil yang kuterima hari ini?",
  "Apa bentuk kebaikan kecil yang kuberikan hari ini?",
  "Apa yang ingin kukatakan kepada diriku yang seminggu lalu?",
  "Apa satu hal yang bisa kubuat lebih mudah untuk diriku besok?",
  "Apa yang sedang tumbuh dalam hidupku meski pelan?",
  "Apa yang belum selesai tetapi tidak harus kuselesaikan malam ini?",
  "Apa yang membuat pikiranku terasa penuh sekarang?",
  "Apa yang paling ingin kupahami, bukan langsung kuperbaiki?",
  "Apa yang hari ini mengubah pendapatku sedikit saja?",
  "Apa satu hal yang layak dirayakan meski kecil?",
];

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
  reminderTime: "20:00",
  weeklyDigest: false,
  biometric: false,
  defaultView: "list",
};

const KEY = "aster-journal-v2";
const PREVIOUS_KEY = "aster-journal-v1";
const uid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const isMood = (value: unknown): value is MoodKey => ["great", "good", "okay", "meh", "hard"].includes(String(value));

function emptyState(): AsterState {
  return {
    folders: SYSTEM_FOLDERS.map((f) => ({ ...f })),
    notes: [],
    reflections: [],
    reflectionDraft: null,
    favoritePrompts: [],
    profile: { ...GUEST_PROFILE },
  };
}

function normalizeNote(value: unknown): Note | null {
  if (!value || typeof value !== "object") return null;
  const n = value as Partial<Note>;
  const type: NoteType = n.type === "checklist" || n.type === "journal" ? n.type : "note";
  const createdAt = typeof n.createdAt === "string" ? n.createdAt : now();
  return {
    id: typeof n.id === "string" && n.id ? n.id : uid(),
    type,
    title: typeof n.title === "string" ? n.title : "",
    body: typeof n.body === "string" ? n.body : "",
    items: Array.isArray(n.items)
      ? n.items
          .filter((item): item is ChecklistItem => Boolean(item && typeof item === "object"))
          .map((item) => ({ id: typeof item.id === "string" ? item.id : uid(), text: typeof item.text === "string" ? item.text : "", done: Boolean(item.done) }))
      : [],
    tags: Array.isArray(n.tags) ? n.tags.filter((tag): tag is string => typeof tag === "string") : [],
    folderId: typeof n.folderId === "string" ? n.folderId : null,
    pinned: Boolean(n.pinned),
    favorite: Boolean(n.favorite),
    image: typeof n.image === "string" ? n.image : null,
    createdAt,
    updatedAt: typeof n.updatedAt === "string" ? n.updatedAt : createdAt,
  };
}

function normalizeReflection(value: unknown): Reflection | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Partial<Reflection>;
  return {
    id: typeof r.id === "string" && r.id ? r.id : uid(),
    prompt: typeof r.prompt === "string" ? r.prompt : PROMPTS[0],
    body: typeof r.body === "string" ? r.body : "",
    mood: isMood(r.mood) ? r.mood : null,
    tags: Array.isArray(r.tags) ? r.tags.filter((tag): tag is string => typeof tag === "string") : [],
    createdAt: typeof r.createdAt === "string" ? r.createdAt : now(),
  };
}

function normalizeReflectionDraft(value: unknown): ReflectionDraft | null {
  if (!value || typeof value !== "object") return null;
  const draft = value as Partial<ReflectionDraft>;
  const body = typeof draft.body === "string" ? draft.body : "";
  const tags = Array.isArray(draft.tags) ? draft.tags.filter((tag): tag is string => typeof tag === "string") : [];
  const prompt = typeof draft.prompt === "string" ? draft.prompt : PROMPTS[0];
  const mood = isMood(draft.mood) ? draft.mood : null;
  if (!body.trim() && tags.length === 0 && !mood) return null;
  return { prompt, body, tags, mood, updatedAt: typeof draft.updatedAt === "string" ? draft.updatedAt : now() };
}

function migrate(raw: string): AsterState {
  const base = emptyState();
  let saved: Partial<AsterState> = {};
  try {
    const parsed = JSON.parse(raw) as Partial<AsterState> | { data?: Partial<AsterState> };
    saved = parsed && typeof parsed === "object" && "data" in parsed && parsed.data ? parsed.data : parsed as Partial<AsterState>;
  } catch {
    return base;
  }

  const folders: Folder[] = Array.isArray(saved.folders)
    ? saved.folders
        .filter((f): f is Folder => Boolean(f && typeof f === "object" && typeof (f as Folder).name === "string"))
        .map((f) => ({ id: typeof f.id === "string" && f.id ? f.id : uid(), name: f.name, color: typeof f.color === "string" ? f.color : "#9fd0e8", system: Boolean(f.system) }))
    : [];
  for (const sys of SYSTEM_FOLDERS) {
    if (!folders.some((f) => f.id === sys.id || (f.system && f.name === sys.name))) folders.push({ ...sys });
  }

  const profileInput = saved.profile ?? {};
  const reminderTime = typeof profileInput.reminderTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(profileInput.reminderTime)
    ? profileInput.reminderTime
    : GUEST_PROFILE.reminderTime;
  const defaultView = profileInput.defaultView === "grid" ? "grid" : "list";

  return {
    folders,
    notes: Array.isArray(saved.notes) ? saved.notes.map(normalizeNote).filter((n): n is Note => Boolean(n)) : [],
    reflections: Array.isArray(saved.reflections) ? saved.reflections.map(normalizeReflection).filter((r): r is Reflection => Boolean(r)) : [],
    reflectionDraft: normalizeReflectionDraft(saved.reflectionDraft),
    favoritePrompts: Array.isArray(saved.favoritePrompts) ? saved.favoritePrompts.filter((p): p is string => typeof p === "string") : [],
    profile: { ...base.profile, ...profileInput, reminderTime, defaultView },
  };
}

type Ctx = {
  state: AsterState;
  ready: boolean;
  storageIssue: string | null;
  addNote: (n: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  trashNote: (id: string) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleItem: (noteId: string, itemId: string) => void;
  addFolder: (name: string, color?: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  addReflection: (r: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  saveReflectionDraft: (draft: Omit<ReflectionDraft, "updatedAt">) => void;
  clearReflectionDraft: () => void;
  togglePromptFavorite: (p: string) => void;
  setMoodToday: (m: MoodKey) => void;
  updateProfile: (p: Partial<Profile>) => void;
  importData: (data: unknown) => void;
  resetAll: () => void;
};

const StoreContext = createContext<Ctx | null>(null);
const COLORS = ["#7aa7ff", "#f0a868", "#8fd8b0", "#d8a8e8", "#f2a5a5", "#9fd0e8"];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsterState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const [storageIssue, setStorageIssue] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(PREVIOUS_KEY);
      if (raw) setState(migrate(raw));
    } catch {
      setStorageIssue("Aster tidak dapat membuka penyimpanan perangkat. Jangan tutup aplikasi sebelum membuat cadangan.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setStorageIssue(null);
    } catch {
      setStorageIssue("Ruang penyimpanan perangkat penuh atau tidak tersedia. Perubahan terakhir belum aman setelah aplikasi ditutup.");
    }
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", state.profile.darkMode);
  }, [state.profile.darkMode, ready]);

  const addNote = useCallback((n: Partial<Note>) => {
    const note: Note = { id: uid(), type: "note", title: "", body: "", items: [], tags: [], folderId: null, pinned: false, favorite: false, image: null, createdAt: now(), updatedAt: now(), ...n };
    setState((s) => ({ ...s, notes: [note, ...s.notes] }));
    return note;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now() } : n)) }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const trashNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => n.id === id ? { ...n, folderId: "sys-trash", pinned: false, updatedAt: now() } : n) }));
  }, []);

  const archiveNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => n.id === id ? { ...n, folderId: "sys-archive", pinned: false, updatedAt: now() } : n) }));
  }, []);

  const restoreNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => n.id === id ? { ...n, folderId: null, updatedAt: now() } : n) }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)) }));
  }, []);

  const toggleItem = useCallback((noteId: string, itemId: string) => {
    setState((s) => ({ ...s, notes: s.notes.map((n) => n.id === noteId ? { ...n, updatedAt: now(), items: n.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) } : n) }));
  }, []);

  const addFolder = useCallback((name: string, color?: string) => {
    setState((s) => ({ ...s, folders: [...s.folders, { id: uid(), name, color: color ?? COLORS[s.folders.length % COLORS.length] }] }));
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setState((s) => ({ ...s, folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)) }));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setState((s) => ({ ...s, folders: s.folders.filter((f) => f.id !== id), notes: s.notes.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)) }));
  }, []);

  const addReflection = useCallback((r: Partial<Reflection>) => {
    setState((s) => ({ ...s, reflections: [{ id: uid(), prompt: r.prompt ?? PROMPTS[0], body: r.body ?? "", mood: r.mood ?? null, tags: r.tags ?? [], createdAt: now() }, ...s.reflections] }));
  }, []);

  const deleteReflection = useCallback((id: string) => {
    setState((s) => ({ ...s, reflections: s.reflections.filter((r) => r.id !== id) }));
  }, []);

  const saveReflectionDraft = useCallback((draft: Omit<ReflectionDraft, "updatedAt">) => {
    setState((s) => ({ ...s, reflectionDraft: { ...draft, updatedAt: now() } }));
  }, []);

  const clearReflectionDraft = useCallback(() => {
    setState((s) => (s.reflectionDraft ? { ...s, reflectionDraft: null } : s));
  }, []);

  const togglePromptFavorite = useCallback((p: string) => {
    setState((s) => ({ ...s, favoritePrompts: s.favoritePrompts.includes(p) ? s.favoritePrompts.filter((x) => x !== p) : [...s.favoritePrompts, p] }));
  }, []);

  const setMoodToday = useCallback((m: MoodKey) => {
    setState((s) => {
      const today = new Date().toDateString();
      const idx = s.reflections.findIndex((r) => new Date(r.createdAt).toDateString() === today && !r.body);
      if (idx >= 0) {
        const next = [...s.reflections];
        next[idx] = { ...next[idx], mood: m };
        return { ...s, reflections: next };
      }
      return { ...s, reflections: [{ id: uid(), prompt: "Mood hari ini", body: "", mood: m, tags: [], createdAt: now() }, ...s.reflections] };
    });
  }, []);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  }, []);

  const importData = useCallback((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Berkas cadangan tidak valid.");
    const raw = JSON.stringify(data);
    const candidate = migrate(raw);
    const source = data as { data?: unknown; notes?: unknown; reflections?: unknown };
    const payload = source.data && typeof source.data === "object" ? source.data as Record<string, unknown> : source as Record<string, unknown>;
    if (!Array.isArray(payload.notes) || !Array.isArray(payload.reflections)) throw new Error("Berkas ini bukan cadangan Aster Journal yang valid.");
    setState(candidate);
  }, []);

  const resetAll = useCallback(() => setState(emptyState()), []);

  const value = useMemo<Ctx>(() => ({ state, ready, storageIssue, addNote, updateNote, deleteNote, trashNote, archiveNote, restoreNote, togglePin, toggleFavorite, toggleItem, addFolder, renameFolder, deleteFolder, addReflection, deleteReflection, saveReflectionDraft, clearReflectionDraft, togglePromptFavorite, setMoodToday, updateProfile, importData, resetAll }), [state, ready, storageIssue, addNote, updateNote, deleteNote, trashNote, archiveNote, restoreNote, togglePin, toggleFavorite, toggleItem, addFolder, renameFolder, deleteFolder, addReflection, deleteReflection, saveReflectionDraft, clearReflectionDraft, togglePromptFavorite, setMoodToday, updateProfile, importData, resetAll]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function relativeDate(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) return `${diff} hari lalu`;
  return formatDate(iso);
}
