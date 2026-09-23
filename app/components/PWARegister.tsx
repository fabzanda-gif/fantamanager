"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PWARegister() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      if (sessionStorage.getItem("90m_install_dismissed") !== "1") setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setPromptEvent(null);
  }

  function dismiss() {
    sessionStorage.setItem("90m_install_dismissed", "1");
    setVisible(false);
  }

  if (!visible || !promptEvent) return null;

  return (
    <aside className="pwaInstallPrompt" aria-label="Installa 90 MINUTES">
      <div className="pwaInstallMark">90</div>
      <div>
        <strong>PORTA 90 MINUTES SUL TELEFONO</strong>
        <span>Installalo da Chrome e aprilo come un'app.</span>
      </div>
      <button className="pwaInstallButton" onClick={install}>
        <Download size={14} /> INSTALLA
      </button>
      <button className="pwaInstallClose" onClick={dismiss} aria-label="Chiudi">
        <X size={14} />
      </button>
    </aside>
  );
}
