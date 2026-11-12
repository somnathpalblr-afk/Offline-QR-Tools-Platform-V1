import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark";
declare global {
  interface Window {
    scanprogoTheme: { set: (theme: Theme) => void; reset: () => void };
  }
}
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);
const subscribe = (notify: () => void) => {
  window.addEventListener("scanprogo-theme-change", notify);
  return () => window.removeEventListener("scanprogo-theme-change", notify);
};
const snapshot = () => document.documentElement.dataset.theme as Theme;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, snapshot);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => window.scanprogoTheme.set(theme === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is required");
  return context;
}
