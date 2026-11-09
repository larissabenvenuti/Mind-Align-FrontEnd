import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/Toaster/Toaster";
import { Header } from "@/components/layout/Header/Header";
import "./globals.scss";

export const metadata: Metadata = {
  title: "MindAlign - Organize sua vida",
  description:
    "Organize sua mente, transforme sua vida com MindAlign. Gerencie tarefas, hábitos, notas e calendário em um só lugar.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f74e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Header />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}