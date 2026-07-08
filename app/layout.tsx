import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MantenPro",
  description: "Sistema de Mantenimiento Preventivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
          <a href="/" className="font-bold text-lg">MantenPro</a>
          <div className="flex gap-4 text-sm">
            <a href="/" className="hover:underline">Dashboard</a>
            <a href="/equipos" className="hover:underline">Equipos</a>
            <a href="/mantenimientos" className="hover:underline">Mantenimientos</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}