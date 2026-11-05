import { Moon, Sun } from "lucide-react";
import { useStore } from "../lib/store";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <a className="brand" href="#/projects" aria-label="Bhoomi Studio home">
      <span className="brand-mark" aria-hidden="true" />
      <span className="brand-word" style={small ? { fontSize: 20 } : undefined}>
        bhoomi<span>.</span>
      </span>
      {!small && <span className="brand-tag">land in · home out</span>}
    </a>
  );
}

export function ThemeToggle() {
  const { settings, toggleTheme } = useStore();
  const dark = settings.theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={dark}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      <Sun className="sun" aria-hidden="true" />
      <Moon className="moon" aria-hidden="true" />
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
