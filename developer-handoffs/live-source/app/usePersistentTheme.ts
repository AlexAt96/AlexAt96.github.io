"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const THEME_STORAGE_KEY = "architecture-component-library-theme";

export function usePersistentDarkMode(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      setDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
      setReady(true);
    });

    const syncTheme = (event:StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && event.newValue) setDark(event.newValue === "dark");
    };
    window.addEventListener("storage", syncTheme);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const theme = dark ? "dark" : "light";
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.style.colorScheme = theme;
  }, [dark, ready]);

  return [dark, setDark];
}
