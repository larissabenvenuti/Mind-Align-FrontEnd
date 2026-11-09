"use client";

import { useEffect } from "react";

export function ThemeReset() {
  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-pink",
      "theme-green",
      "theme-sun",
      "theme-dark",
      "theme-purple",
      "theme-red"
    );
  }, []);

  return null;
}