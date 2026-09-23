"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {ChevronDown,ChevronUp,Pause,Play,SkipBack,SkipForward,Volume2,VolumeX} from "lucide-react";

const MUSIC=[
  "/assets/audio/ES_Inferadise - Lupus Nocte.mp3",
  "/assets/audio/ES_Post Punk - Mushkilla.mp3",
  "/assets/audio/ES_No Stone Unturned - Brendon Moeller.mp3",
  "/assets/audio/ES_ang - bomull.mp3",
  "/assets/audio/ES_Cool Tuxedo - Ava Low.mp3",
  "/assets/audio/ES_CYBER DREAM - Sarah, the Illstrumentalist.mp3",
  "/assets/audio/ES_Trust the Process - Ballpoint.mp3",
  "/assets/audio/ES_60 Minutes - Eight Bits.mp3",
  "/assets/audio/ES_1AM OMW - Ballpoint.mp3",
  "/assets/audio/ES_Dark Princess - ELFL.mp3",
  "/assets/audio/ES_Neo Dreams - The Big Let Down.mp3",
];
const SFX={click:"/assets/audio/Pulsante premuto.mp3",hover:"/assets/audio/Hover-PassaggioCursore.mp3",pressRelease:"/assets/audio/Press-Release.mp3",confirm:"/assets/audio/Conferma.mp3",report:"/assets/audio/Apri Report.mp3",cancel:"/assets/audio/Errore:Annulla.mp3",interaction:"/assets/audio/Nuova Interazione.mp3"};
const MATCH_AUDIO={pre:"/assets/audio/match/Pre-Match.mp3",stadium:"/assets/audio/match/Match.mp3",post:"/assets/audio/Post Partita.mp3",injury:"/assets/audio/match/Injury.mp3",start:"/assets/audio/match/StartOfTheMatch.mp3",end:"/assets/audio/match/EndOfTheMatch.mp3",whistle:"/assets/audio/match/Whistle.mp3",homeGoal:"/assets/audio/match/GolSegnatoCasa.mp3",awayGoal:"/assets/audio/match/Gol against.mp3"};

type AudioPrefs={music:boolean;sfx:boolean;ambience:boolean;master:number;musicVolume:number;sfxVolume:number;ambienceVolume:number};
const DEFAULT_PREFS:AudioPrefs={music:true,sfx:true,ambience:true,master:.72,musicVolume:.48,sfxVolume:.78,ambienceVolume:.72};

export default function AudioSystem(){
 const pathname=usePathname(),inMatch=pathname==="/partita",inPostMatch=["/statistiche","/report"].includes(pathname),inPreMatch=pathname==="/vigilia";
 const[prefs,setPrefs]=useState<AudioPrefs>(DEFAULT_PREFS),[ready,setReady]=useState(false),[track,setTrack]=useState(0),[open,setOpen]=useState(false);
 const musicRef=useRef<HTMLAudioElement|null>(null),ambienceRef=useRef<HTMLAudioElement|null>(null),sfxRefs=useMemo(()=>new Map<string,HTMLAudioElement>(),[]),randomizedRef=useRef(false);
 const gain=(channel:number)=>Math.max(0,Math.min(1,prefs.master*channel));
 useEffect(()=>{try{const stored=localStorage.getItem("fm_audio_prefs");if(stored){const old=JSON.parse(stored);setPrefs({...DEFAULT_PREFS,...old,master:old.master??old.volume??DEFAULT_PREFS.master})}}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem("fm_audio_prefs",JSON.stringify(prefs))}catch{}},[prefs]);
 useEffect(()=>{const unlock=()=>setReady(true);window.addEventListener("pointerdown",unlock,{once:true});window.addEventListener("keydown",unlock,{once:true});return()=>{window.removeEventListener("pointerdown",unlock);window.removeEventListener("keydown",unlock)}},[]);

 function fade(a:HTMLAudioElement|null,target:number,ms=550){if(!a)return;const from=a.volume,start=performance.now();const tick=(t:number)=>{const p=Math.min(1,(t-start)/ms);a.volume=from+(target-from)*p;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
 useEffect(()=>{if(!ready)return;if(!randomizedRef.current){randomizedRef.current=true;setTrack(Math.floor(Math.random()*MUSIC.length));return}const audio=musicRef.current??new Audio();musicRef.current=audio;const wanted=encodeURI(MUSIC[track]);if(!audio.src.endsWith(wanted)){audio.src=wanted;audio.preload="auto"}audio.loop=false;audio.onended=()=>setTrack(current=>pickRandomTrack(current));const should=prefs.music&&!inMatch&&!inPreMatch&&gain(prefs.musicVolume)>0;if(should){audio.play().catch(()=>{});fade(audio,gain(prefs.musicVolume),500)}else{fade(audio,0,350);setTimeout(()=>{if(!prefs.music||inMatch||inPreMatch)audio.pause()},380)}return()=>{audio.onended=null}},[ready,prefs.music,prefs.master,prefs.musicVolume,track,inMatch,inPreMatch]);
 useEffect(()=>{if(!ready)return;const src=inMatch?MATCH_AUDIO.stadium:inPostMatch?MATCH_AUDIO.post:inPreMatch?MATCH_AUDIO.pre:null,a=ambienceRef.current??new Audio();ambienceRef.current=a;if(!src||!prefs.ambience){fade(a,0,300);setTimeout(()=>a.pause(),330);return}const wanted=encodeURI(src);if(!a.src.endsWith(wanted)){a.src=wanted;a.loop=true;a.preload="auto"}a.play().catch(()=>{});const target=inPostMatch?gain(prefs.ambienceVolume)*.7:gain(prefs.ambienceVolume);fade(a,target,650);return()=>{fade(a,0,250)}},[ready,inMatch,inPostMatch,inPreMatch,prefs.ambience,prefs.master,prefs.ambienceVolume]);

 useEffect(()=>{const play=(src:string,vol=1)=>{if(!prefs.sfx||gain(prefs.sfxVolume)<=0)return;const a=new Audio(encodeURI(src));a.volume=0;a.play().catch(()=>{});fade(a,Math.min(1,gain(prefs.sfxVolume)*vol),140);return a};const handler=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(d.type==="whistle")play(MATCH_AUDIO.whistle,1);if(d.type==="injury")play(MATCH_AUDIO.injury,.92);if(d.type==="start"){play(MATCH_AUDIO.start,1);play(MATCH_AUDIO.whistle,.95)}if(d.type==="end"){play(MATCH_AUDIO.end,1);play(MATCH_AUDIO.whistle,.95);const a=ambienceRef.current;if(a&&prefs.ambience){fade(a,0,1100);setTimeout(()=>{a.pause();a.src=encodeURI(MATCH_AUDIO.post);a.loop=true;a.preload="auto";a.volume=0;a.play().catch(()=>{});fade(a,gain(prefs.ambienceVolume)*.7,1200)},1150)}}if(d.type==="goal"){const home=!!d.home,duration=Math.max(1600,Math.min(6500,Number(d.duration||4200))),fx=play(home?MATCH_AUDIO.homeGoal:MATCH_AUDIO.awayGoal,1),base=gain(prefs.ambienceVolume);if(ambienceRef.current)fade(ambienceRef.current,home?base*.4:base*.18,180);const restore=()=>{if(ambienceRef.current)fade(ambienceRef.current,base,650)};if(fx){const fadeAt=Math.max(500,duration-650);setTimeout(()=>fade(fx,0,600),fadeAt);setTimeout(()=>{fx.pause();restore()},duration)}else setTimeout(restore,duration)}};window.addEventListener("fm-match-audio",handler);return()=>window.removeEventListener("fm-match-audio",handler)},[prefs.sfx,prefs.master,prefs.sfxVolume,prefs.ambienceVolume]);

 useEffect(()=>{let lastHoverAt=0;const playSfx=(name:keyof typeof SFX,vol=.7)=>{if(!prefs.sfx)return;let a=sfxRefs.get(name);if(!a){a=new Audio(encodeURI(SFX[name]));a.preload="auto";sfxRefs.set(name,a)}a.volume=Math.min(1,gain(prefs.sfxVolume)*vol);a.currentTime=0;a.play().catch(()=>{})};const selector="a,button,[role='button'],select,input[type='range'],input[type='checkbox']";const onHover=(event:PointerEvent)=>{const target=(event.target as HTMLElement|null)?.closest(selector) as HTMLElement|null;if(!target||target.closest(".audioDock"))return;const previous=(event.relatedTarget as HTMLElement|null)?.closest?.(selector);if(previous===target)return;const now=performance.now();if(now-lastHoverAt<70)return;lastHoverAt=now;playSfx("hover",.42)};const onClick=(event:MouseEvent)=>{const target=(event.target as HTMLElement|null)?.closest("a,button,[role='button']");if(!target||target.closest(".audioDock"))return;const label=(target.textContent||"").toLowerCase(),href=target instanceof HTMLAnchorElement?target.getAttribute("href")||"":"";if(href.includes("/report")||label.includes("report"))return playSfx("report",.9);if(label.includes("annulla")||label.includes("passa")||label.includes("indietro"))return playSfx("cancel",.8);if(label.includes("conferma")||label.includes("salva")||label.includes("gioca")||label.includes("avvia"))return playSfx("pressRelease",.85);playSfx("click",.65)};window.addEventListener("pointerover",onHover);window.addEventListener("click",onClick);return()=>{window.removeEventListener("pointerover",onHover);window.removeEventListener("click",onClick)}},[prefs.sfx,prefs.master,prefs.sfxVolume,sfxRefs]);

 function slider(label:string,value:number,onChange:(v:number)=>void,enabled:boolean,toggle:()=>void){return <div className="audioRow"><button type="button" className={enabled?"on":""} onClick={toggle} aria-label={"Mute "+label}>{enabled?<Volume2 size={13}/>:<VolumeX size={13}/>}</button><span>{label}</span><input type="range" min="0" max="1" step=".05" value={value} onChange={e=>onChange(Number(e.target.value))}/><b>{Math.round(value*100)}</b></div>}
 function pickRandomTrack(current:number){if(MUSIC.length<2)return current;let next=current;while(next===current)next=Math.floor(Math.random()*MUSIC.length);return next}function nextTrack(){setTrack(current=>pickRandomTrack(current))}function previousTrack(){const a=musicRef.current;if(a&&a.currentTime>5){a.currentTime=0;if(prefs.music)a.play().catch(()=>{});return}setTrack(current=>pickRandomTrack(current))}

 return (
  <div className={"audioDock "+(open?"expanded":"")} aria-label="Mixer audio">
    <div className="audioCompact">
      <button type="button" onClick={previousTrack}><SkipBack size={14}/></button>
      <button type="button" className={prefs.music?"on":""} onClick={()=>setPrefs(p=>({...p,music:!p.music}))}>
        {prefs.music?<Pause size={14}/>:<Play size={14}/>}
      </button>
      <button type="button" onClick={nextTrack}><SkipForward size={14}/></button>
      <span className="audioLabel">AUDIO</span>
      <button type="button" className="audioExpand" onClick={()=>setOpen(v=>!v)}>
        {open?<ChevronDown size={14}/>:<ChevronUp size={14}/>}
      </button>
    </div>
    {open&&(
      <div className="audioMixer">
        {slider(
          "MASTER",
          prefs.master,
          v=>setPrefs(p=>({...p,master:v})),
          prefs.master>0,
          ()=>setPrefs(p=>({...p,master:p.master>0?0:DEFAULT_PREFS.master}))
        )}
        {slider(
          "MUSICA",
          prefs.musicVolume,
          v=>setPrefs(p=>({...p,musicVolume:v})),
          prefs.music,
          ()=>setPrefs(p=>({...p,music:!p.music}))
        )}
        {slider(
          "UI / GIOCO",
          prefs.sfxVolume,
          v=>setPrefs(p=>({...p,sfxVolume:v})),
          prefs.sfx,
          ()=>setPrefs(p=>({...p,sfx:!p.sfx}))
        )}
        {slider(
          "STADIO / PARTITA",
          prefs.ambienceVolume,
          v=>setPrefs(p=>({...p,ambienceVolume:v})),
          prefs.ambience,
          ()=>setPrefs(p=>({...p,ambience:!p.ambience}))
        )}
      </div>
    )}
  </div>
 )

}
