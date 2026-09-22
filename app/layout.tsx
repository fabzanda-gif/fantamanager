import type { Metadata } from "next";
import "./globals.css";
import AudioSystem from "./components/AudioSystem";

export const metadata: Metadata = {
  title: "FantaManager",
  description: "Costruisci una squadra. Gestisci persone.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        {children}
        <AudioSystem />
      </body>
    </html>
  );
}
