import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinicar Work Orders",
  description: "Migracion de Clinicar a Next.js + Supabase",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="app-body">{children}</body>
    </html>
  );
}
