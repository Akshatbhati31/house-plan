import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import type { PaletteId, Project, ProjectSettings, ThemeMode } from "../types";
import { defaultAppSettings, sampleProjects, type StoredSettings } from "./seed";

const DATA_KEY = "bhoomi.studio.v1";
const SETTINGS_KEY = "bhoomi.settings.v1";

interface ToastItem {
  id: number;
  message: string;
  tone: "default" | "success" | "warning";
}

interface Store {
  projects: Project[];
  settings: StoredSettings;
  toasts: ToastItem[];
  lastSaved: number;
  updateProject: (id: string, patch: Partial<Omit<Project, "settings" | "plot">> & { settings?: Partial<ProjectSettings>; plot?: Partial<Project["plot"]> }) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => string | null;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setPalette: (palette: PaletteId) => void;
  setReducedMotion: (value: boolean) => void;
  approvePalette: () => void;
  toast: (message: string, tone?: ToastItem["tone"]) => void;
  dismissToast: (id: number) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<Store | null>(null);

function readProjects(): Project[] {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return sampleProjects;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.projects)) return parsed.projects as Project[];
    if (Array.isArray(parsed)) return parsed as Project[];
    return sampleProjects;
  } catch {
    return sampleProjects;
  }
}

function readSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultAppSettings;
    return { ...defaultAppSettings, ...JSON.parse(raw) };
  } catch {
    return defaultAppSettings;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(readProjects);
  const [settings, setSettings] = useState<StoredSettings>(readSettings);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const toastId = useRef(1);
  const timers = useRef<number[]>([]);

  const toast = useCallback((message: string, tone: ToastItem["tone"] = "default") => {
    const id = toastId.current++;
    setToasts((list) => [...list.slice(-2), { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3800);
    timers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const projectWarningShown = useRef(false);
  const settingsWarningShown = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify({ version: 1, projects }));
        setLastSaved(Date.now());
        projectWarningShown.current = false;
      } catch {
        if (!projectWarningShown.current) {
          projectWarningShown.current = true;
          toast("Browser storage is full. Download a backup, then remove a reference or duplicate project.", "warning");
        }
      }
    }, 260);
    return () => window.clearTimeout(timer);
  }, [projects, toast]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      settingsWarningShown.current = false;
    } catch {
      if (!settingsWarningShown.current) {
        settingsWarningShown.current = true;
        toast("Preferences could not be saved — browser storage is full.", "warning");
      }
    }
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.palette = settings.palette;
    root.classList.toggle("reduce-motion", settings.reducedMotion);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", settings.theme === "dark" ? "#141413" : "#F9F8F6");
  }, [settings, toast]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const updateProject = useCallback<Store["updateProject"]>((id, patch) => {
    setProjects((list) =>
      list.map((project) => {
        if (project.id !== id) return project;
        const { settings: nextSettings, plot: nextPlot, ...rest } = patch;
        return {
          ...project,
          ...rest,
          plot: { ...project.plot, ...nextPlot },
          settings: { ...project.settings, ...nextSettings },
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects((list) => [project, ...list]);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((list) => list.filter((p) => p.id !== id));
  }, []);

  const duplicateProject = useCallback(
    (id: string) => {
      const source = projects.find((p) => p.id === id);
      if (!source) return null;
      const newId = `p-${Math.random().toString(36).slice(2, 9)}`;
      const copy: Project = {
        ...source,
        id: newId,
        name: `${source.name} — copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approval: "concept",
        references: source.references.map((r) => ({ ...r, id: `ref-${Math.random().toString(36).slice(2, 8)}` })),
      };
      setProjects((list) => [copy, ...list]);
      return newId;
    },
    [projects],
  );

  const applyTheme = useCallback((theme: ThemeMode) => {
    const commit = () => setSettings((s) => ({ ...s, theme }));
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (!settings.reducedMotion && doc.startViewTransition) {
      doc.startViewTransition(() => flushSync(commit));
    } else {
      commit();
    }
  }, [settings.reducedMotion]);

  const setTheme = useCallback((theme: ThemeMode) => applyTheme(theme), [applyTheme]);
  const toggleTheme = useCallback(() => {
    applyTheme(settings.theme === "dark" ? "light" : "dark");
  }, [applyTheme, settings.theme]);

  const setPalette = useCallback((palette: PaletteId) => {
    setSettings((s) => ({ ...s, palette, paletteApproved: false }));
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setSettings((s) => ({ ...s, reducedMotion: value }));
  }, []);

  const approvePalette = useCallback(() => {
    setSettings((s) => ({ ...s, paletteApproved: true }));
  }, []);

  const resetDemo = useCallback(() => {
    setProjects(sampleProjects);
    setSettings(defaultAppSettings);
  }, []);

  const value = useMemo<Store>(
    () => ({
      projects,
      settings,
      toasts,
      lastSaved,
      updateProject,
      addProject,
      deleteProject,
      duplicateProject,
      setTheme,
      toggleTheme,
      setPalette,
      setReducedMotion,
      approvePalette,
      toast,
      dismissToast,
      resetDemo,
    }),
    [
      projects,
      settings,
      toasts,
      lastSaved,
      updateProject,
      addProject,
      deleteProject,
      duplicateProject,
      setTheme,
      toggleTheme,
      setPalette,
      setReducedMotion,
      approvePalette,
      toast,
      dismissToast,
      resetDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside AppStoreProvider");
  return store;
}
