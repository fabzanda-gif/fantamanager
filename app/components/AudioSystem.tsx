"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

const MUSIC = [
  "/assets/audio/ES_Inferadise - Lupus Nocte.mp3",
  "/assets/audio/ES_Post Punk - Mushkilla.mp3",
  "/assets/audio/ES_No Stone Unturned - Brendon Moeller.mp3",
  "/assets/audio/ES_ang - bomull.mp3",
  "/assets/audio/ES_Cool Tuxedo - Ava Low.mp3",
  "/assets/audio/ES_CYBER DREAM - Sarah, the Illstrumentalist.mp3",
];

const SFX = {
  click: "/assets/audio/Pulsante premuto.mp3",
  pressRelease: "/assets/audio/Press-Release.mp3",
  confirm: "/assets/audio/Conferma.mp3",
  report: "/assets/audio/Apri Report.mp3",
  cancel: "/assets/audio/Errore:Annulla.mp3",
  interaction: "/assets/audio/Nuova Interazione.mp3",
};

const MATCH_AUDIO={pre:"/assets/audio/match/Pre-Match.mp3",stadium:"/assets/audio/match/Match.mp3",start:"/assets/audio/match/StartOfTheMatch.mp3",end:"/assets/audio/match/EndOfTheMatch.mp3",whistle:"/assets/audio/match/Whistle.mp3",homeGoal:"/assets/audio/match/GolSegnatoCasa.mp3",awayGoal:"/assets/audio/match/Gol against.mp3"};
type AudioPrefs = { music: boolean; sfx: boolean; volume: number };
const DEFAULT_PREFS: AudioPrefs = { music: true, sfx: true, volume: 0.34 };

export default function AudioSystem() {
  const pathname=usePathname();
  const inMatch=pathname==="/partita";
  const inPreMatch=pathname==="/vigilia";
  const [prefs, setPrefs] = useState<AudioPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useMemo(() => new Map<string, HTMLAudioElement>(), []);
  const ambienceRef=useRef<HTMLAudioElement|null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fm_audio_prefs");
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("fm_audio_prefs", JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = prefs.volume;
  }, [prefs.volume]);

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
    if (!ready) return;
    const audio = musicRef.current ?? new Audio();
    musicRef.current = audio;
    const wanted = encodeURI(MUSIC[track]);
    if (!audio.src.endsWith(wanted)) {
      audio.src = wanted;
      audio.preload = "auto";
    }
    audio.volume = prefs.volume;
    audio.onended = () => setTrack((i) => (i + 1) % MUSIC.length);
    if (prefs.music && !inMatch && !inPreMatch) audio.play().catch(() => {});
    else audio.pause();
    else audio.pause();
    return () => { audio.onended = null; };
  }, [ready, prefs.music, track, inMatch, inPreMatch]);

  function toggleMusic() {
    setPrefs((p) => ({ ...p, music: !p.music }));
  }

  function nextTrack() {
    setTrack((i) => (i + 1) % MUSIC.length);
  }

  function previousTrack() {
    const audio = musicRef.current;
    if (audio && audio.currentTime > 5) {
      audio.currentTime = 0;
      if (prefs.music) audio.play().catch(() => {});
      return;
    }
    setTrack((i) => (i - 1 + MUSIC.length) % MUSIC.length);
  }

  useEffect(()=>{if(!ready)return;const src=inMatch?MATCH_AUDIO.stadium:inPreMatch?MATCH_AUDIO.pre:null;if(!src){ambienceRef.current?.pause();return}const a=ambienceRef.current??new Audio();ambienceRef.current=a;a.src=encodeURI(src);a.loop=true;a.volume=Math.min(.72,Math.max(.38,prefs.volume*1.45));a.play().catch(()=>{});return()=>a.pause()},[ready,inMatch,inPreMatch,prefs.volume]);

  useEffect(()=>{const fade=(target:number,ms:number)=>{const a=ambienceRef.current;if(!a)return;const from=a.volume,start=performance.now();const tick=(t:number)=>{const p=Math.min(1,(t-start)/ms);a.volume=from+(target-from)*p;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};const play=(src:string,vol=.95)=>{if(!prefs.sfx)return;const a=new Audio(encodeURI(src));a.volume=vol;a.play().catch(()=>{});return a};const handler=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(d.type==="whistle")play(MATCH_AUDIO.whistle,1);if(d.type==="start"){play(MATCH_AUDIO.start,1);play(MATCH_AUDIO.whistle,.95)}if(d.type==="end"){play(MATCH_AUDIO.end,1);play(MATCH_AUDIO.whistle,.95)}if(d.type==="goal"){const home=!!d.home;const fx=play(home?MATCH_AUDIO.homeGoal:MATCH_AUDIO.awayGoal,1);if(!home&&ambienceRef.current){const base=Math.min(.72,Math.max(.38,prefs.volume*1.45));fade(base*.2,350);const restore=()=>fade(base,900);if(fx)fx.addEventListener("ended",restore,{once:true});else setTimeout(restore,2200)}}};window.addEventListener("fm-match-audio",handler);return()=>window.removeEventListener("fm-match-audio",handler)},[prefs.sfx,prefs.volume]);

  useEffect(() => {
    const playSfx = (name: keyof typeof SFX, volume = 0.62) => {
      if (!prefs.sfx) return;
      let audio = sfxRefs.get(name);
      if (!audio) {
        audio = new Audio(encodeURI(SFX[name]));
        audio.preload = "auto";
        sfxRefs.set(name, audio);
      }
      audio.volume = Math.min(1, volume * 1.35 * Math.max(0.65, prefs.volume / DEFAULT_PREFS.volume));
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a,button,[role='button']");
      if (!target || target.closest(".audioDock")) return;
      const label = (target.textContent || "").toLowerCase();
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      if (href.includes("/report") || label.includes("report")) return playSfx("report", .72);
      if (label.includes("annulla") || label.includes("passa") || label.includes("indietro")) return playSfx("cancel", .66);
      if (label.includes("conferma") || label.includes("salva") || label.includes("gioca") || label.includes("avvia")) return playSfx("pressRelease", .68);
      playSfx("click", .56);
    };

    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [prefs.sfx, prefs.volume, sfxRefs]);

  return (
    <div className="audioDock" aria-label="Controlli musica">
      <button type="button" onClick={previousTrack} title="Brano precedente" aria-label="Brano precedente"><SkipBack size={14}/></button>
      <button type="button" className={prefs.music ? "on" : ""} onClick={toggleMusic} title={prefs.music ? "Pausa" : "Play"} aria-label={prefs.music ? "Pausa" : "Play"}>
        {prefs.music ? <Pause size={14}/> : <Play size={14}/>}
      </button>
      <button type="button" onClick={nextTrack} title="Brano successivo" aria-label="Brano successivo"><SkipForward size={14}/></button>
      {prefs.volume > 0 ? <Volume2 size={13}/> : <VolumeX size={13}/>}
      <input aria-label="Volume musica" type="range" min="0" max="1" step="0.05" value={prefs.volume}
        onChange={(e) => setPrefs((p) => ({ ...p, volume: Number(e.target.value) }))}/>
    </div>
  );
}
