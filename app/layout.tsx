import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import AppShell from "./components/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MantenPro — Mantenimiento preventivo",
  description: "Plataforma de mantenimiento preventivo: equipos, planes, historial y trazabilidad en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${lexend.variable} antialiased flex min-h-screen flex-col`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}