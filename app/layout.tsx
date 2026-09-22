import type { Metadata } from "next";
import "./globals.css";
import AudioSystem from "./components/AudioSystem";
import compact90 from "./assets/logos/Compact 90 symbol iconfavicon.jpg";

export const metadata: Metadata = {
  title: "90 MINUTES",
  description: "Costruisci una squadra. Gestisci persone.",
  icons: { icon: compact90.src, shortcut: compact90.src, apple: compact90.src },
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
