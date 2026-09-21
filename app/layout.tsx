import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FantaManager",
  description: "Costruisci una squadra. Gestisci persone.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
