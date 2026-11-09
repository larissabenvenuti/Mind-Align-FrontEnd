"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: "var(--font-family-sans, Inter, system-ui, sans-serif)",
        },
      }}
    />
  );
}
