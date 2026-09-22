"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MUSIC = [
  "/assets/audio/ES_Inferadise - Lupus Nocte.mp3",
  "/assets/audio/ES_Post Punk - Mushkilla.mp3",
  "/assets/audio/ES_No Stone Unturned - Brendon Moeller.mp3",
  "/assets/audio/ES_ang - bomull.mp3",
  "/assets/audio/ES_Cool Tuxedo - Ava Low.mp3",
  "/assets/audio/ES_CYBER DREAM - Sarah, the Illstrumentalist.mp3",
];

const SFX = {
  click: "/assets/audio/Pulsante.mp3",
  hover: "/assets/audio/Passaggio del cursore.mp3",
  confirm: "/assets/audio/Conferma.mp3",
  report: "/assets/audio/Apri Report.mp3",
  cancel: "/assets/audio/Errore:Annulla.mp3",
  interaction: "/assets/audio/Nuova Interazione.mp3",
};

type AudioPrefs = { music: boolean; sfx: boolean; volume: number };

const DEFAULT_PREFS: AudioPrefs = { music: true, sfx: true, volume: 0.34 };

export default function AudioSystem() {
  const [prefs, setPrefs] = useState<AudioPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const lastHoverRef = useRef(0);
  const sfxRefs = useMemo(() => new Map<string, HTMLAudioElement>(), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fm_audio_prefs");
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("fm_audio_prefs", JSON.stringify(prefs)); } catch {}
    if (musicRef.current) musicRef.current.volume = prefs.volume;
  }, [prefs]);

  useEffect(() => {
    const unlock = () => setReady(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!ready || !prefs.music) {
      musicRef.current?.pause();
      return;
    }
    const audio = musicRef.current ?? new Audio();
    musicRef.current = audio;
    audio.src = encodeURI(MUSIC[track]);
    audio.volume = prefs.volume;
    audio.preload = "auto";
    audio.onended = () => setTrack((i) => (i + 1) % MUSIC.length);
    audio.play().catch(() => {});
    return () => { audio.onended = null; };
  }, [ready, prefs.music, prefs.volume, track]);

  useEffect(() => {
    const playSfx = (name: keyof typeof SFX, volume = 0.62) => {
      if (!prefs.sfx) return;
      let audio = sfxRefs.get(name);
      if (!audio) {
        audio = new Audio(encodeURI(SFX[name]));
        audio.preload = "auto";
        sfxRefs.set(name, audio);
      }
      audio.volume = Math.min(1, volume * Math.max(0.25, prefs.volume / DEFAULT_PREFS.volume));
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a,button,[role='button']");
      if (!target) return;
      const label = (target.textContent || "").toLowerCase();
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      if (href.includes("/report") || label.includes("report")) return playSfx("report", .72);
      if (label.includes("annulla") || label.includes("passa") || label.includes("indietro")) return playSfx("cancel", .66);
      if (label.includes("conferma") || label.includes("salva") || label.includes("gioca") || label.includes("avvia")) return playSfx("confirm", .72);
      playSfx("click", .52);
    };

    const onHover = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a,button,[role='button']");
      if (!target) return;
      const now = Date.now();
      if (now - lastHoverRef.current < 140) return;
      lastHoverRef.current = now;
      playSfx("hover", .25);
    };

    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onHover);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("mouseover", onHover);
    };
  }, [prefs.sfx, prefs.volume, sfxRefs]);

  return (
    <div className="audioDock" aria-label="Controlli audio">
      <button
        type="button"
        className={prefs.music ? "on" : ""}
        onClick={() => setPrefs((p) => ({ ...p, music: !p.music }))}
        title={prefs.music ? "Disattiva musica" : "Attiva musica"}
      >
        MUS {prefs.music ? "ON" : "OFF"}
      </button>
      <button
        type="button"
        className={prefs.sfx ? "on" : ""}
        onClick={() => setPrefs((p) => ({ ...p, sfx: !p.sfx }))}
        title={prefs.sfx ? "Disattiva effetti" : "Attiva effetti"}
      >
        FX {prefs.sfx ? "ON" : "OFF"}
      </button>
      <input
        aria-label="Volume audio"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={prefs.volume}
        onChange={(e) => setPrefs((p) => ({ ...p, volume: Number(e.target.value) }))}
      />
      <button type="button" onClick={() => setTrack((i) => (i + 1) % MUSIC.length)} title="Brano successivo">››</button>
    </div>
  );
}
