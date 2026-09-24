import type { Metadata } from "next";
import "./globals.css";
import AudioSystem from "./components/AudioSystem";
import PWARegister from "./components/PWARegister";
import compact90 from "./assets/logos/SidebarPNG.png";

export const metadata: Metadata = {
  title: "90 MINUTES",
  description: "Costruisci una squadra. Gestisci persone.",
  applicationName: "90 MINUTES",
  manifest: "/manifest.webmanifest",
  icons: { icon: compact90.src, shortcut: compact90.src, apple: compact90.src },
  appleWebApp: {
    capable: true,
    title: "90 MINUTES",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#24e39a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        {children}
        <AudioSystem />
        <PWARegister />
      </body>
    </html>
  );
}
