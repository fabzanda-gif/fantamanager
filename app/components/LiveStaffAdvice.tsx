"use client";

import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {Brain,ChevronRight,MessageSquareText,X} from "lucide-react";
import {createClient} from "@supabase/supabase-js";
import {clubName} from "../lib/clubLogos";
import styles from "./LiveStaffAdvice.module.css";

const sb=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");

type Advice={
  key:string;
  staff:"VICE"|"MATCH ANALYST";
  title:string;
  message:string;
  actionLabel?:string;
  action?:()=>void;
};

function minuteFromDom(){
  const txt=document.querySelector(".scoreTop strong")?.textContent||"";
  const m=txt.match(/(\d+)'/);
  return m?Number(m[1]):0;
}
function clickButton(label:string){
  const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const b=buttons.find(x=>(x.textContent||"").trim().toUpperCase()===label.toUpperCase());
  b?.click();
}
function recentPlayerName(){
  const texts=Array.from(document.querySelectorAll<HTMLElement>(".commentary article p")).slice(0,6).map(x=>x.textContent||"");
  const counts=new Map<string,number>();
  for(const t of texts){
    const m=t.match(/^([A-ZÀ-ÖØ-Ý' -]{3,28})\b/);
    if(m){const name=m[1].trim();counts.set(name,(counts.get(name)||0)+1)}
  }
  return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||"";
}

export default function LiveStaffAdvice(){
  const path=usePathname();
  const[club,setClub]=useState("");
  const[advice,setAdvice]=useState<Advice|null>(null);
  const[dismissed,setDismissed]=useState<Set<string>>(new Set());
  const lastMinute=useRef(-20);

  useEffect(()=>{
    if(path!=="/partita")return;
    const run=new URLSearchParams(window.location.search).get("run")||"";
    if(!run)return;
    sb.from("game_runs").select("club_code").eq("id",run).maybeSingle().then(({data})=>setClub(data?.club_code||""));
  },[path]);

  useEffect(()=>{
    if(path!=="/partita"||!club)return;
    const buildAdvice=()=>{
      if(document.querySelector(".fullTime")||document.querySelector(".halfTime"))return;
      const minute=minuteFromDom();
      if(minute<12||minute-lastMinute.current<7)return;

      const homeName=(document.querySelector(".scoreTeam.home b")?.textContent||"").trim();
      const awayName=(document.querySelector(".scoreTeam.away b")?.textContent||"").trim();
      const clubLabel=clubName(club);
      const userHome=homeName===clubLabel||homeName===club;
      const poss=Array.from(document.querySelectorAll<HTMLElement>(".livePossessionSide b")).map(x=>Number((x.textContent||"").replace("%",""))||50);
      const userPoss=userHome?(poss[0]??50):(poss[1]??50);
      const activeStyle=Array.from(document.querySelectorAll<HTMLButtonElement>(".liveTactics>div>button")).find(b=>b.classList.contains("active"))?.textContent?.trim()||"";
      const recent=Array.from(document.querySelectorAll<HTMLElement>(".commentary article p")).slice(0,8).map(x=>x.textContent||"").join(" ");
      const repeated=recentPlayerName();
      const latestYellow=Array.from(document.querySelectorAll<HTMLElement>(".commentary article.yellowEvent p"))[0]?.textContent||"";

      const candidates:Advice[]=[];

      if(latestYellow&&minute>=20){
        const name=(latestYellow.match(/^([A-ZÀ-ÖØ-Ý' -]{3,28})\b/)||[])[1]?.trim()||repeated;
        candidates.push({key:`yellow-${minute}-${name}`,staff:"VICE",title:"GESTISCI L'AMMONITO",message:name?`${name} è già sul filo. Chiedigli di evitare l'anticipo forzato e prepara un cambio se continua a essere coinvolto nei duelli.`:"Abbiamo un ammonito molto coinvolto nei duelli. Meglio abbassare il rischio individuale e tenere pronto un cambio.",actionLabel:"VAI ALLE FORMAZIONI",action:()=>clickButton("FORMAZIONI")});
      }
      if(userPoss<=42&&minute>=18){
        candidates.push({key:`lowposs-${Math.floor(minute/10)}`,staff:"MATCH ANALYST",title:"STIAMO PERDENDO IL CONTROLLO",message:`Possesso al ${userPoss}%. Stiamo giocando troppo poco nella loro metà campo: consoliderei il possesso per togliere ritmo all'avversario e risalire insieme.`,actionLabel:"APPLICA POSSESSO",action:()=>clickButton("Possesso")});
      }
      if(activeStyle==="Pressing"&&minute>=62){
        candidates.push({key:`pressfatigue-${Math.floor(minute/10)}`,staff:"VICE",title:"IL PRESSING STA COSTANDO ENERGIA",message:"Siamo entrati nella parte di gara in cui il pressing continuo può aprire distanze. Passerei a Equilibrato e terrei energie per gli ultimi venti minuti.",actionLabel:"PASSA A EQUILIBRATO",action:()=>clickButton("Equilibrato")});
      }
      if(minute>=68&&repeated&&recent.split(repeated).length-1>=2){
        candidates.push({key:`player-${Math.floor(minute/10)}-${repeated}`,staff:"MATCH ANALYST",title:"INDICAZIONE INDIVIDUALE",message:`${repeated} sta entrando spesso nell'azione. Possiamo sfruttare questa zona: dagli più libertà nella giocata oppure proteggilo con una sostituzione se il ritmo sta calando.`,actionLabel:"GESTISCI GIOCATORI",action:()=>clickButton("FORMAZIONI")});
      }
      if(userPoss>=58&&minute>=28&&!/tiro|porta|palo|traversa|respinge/i.test(recent)){
        candidates.push({key:`sterile-${Math.floor(minute/10)}`,staff:"MATCH ANALYST",title:"POSSESSO TROPPO STERILE",message:`Abbiamo il ${userPoss}% di possesso ma stiamo arrivando poco alla conclusione. Aumenterei verticalità e rischio per trasformare il controllo in occasioni.`,actionLabel:"PASSA A VERTICALE",action:()=>clickButton("Verticale")});
      }
      if(minute>=76&&userPoss<48){
        candidates.push({key:`late-${Math.floor(minute/5)}`,staff:"VICE",title:"ULTIMO QUARTO D'ORA",message:"Stiamo lasciando troppo campo nel finale. Se dobbiamo inseguire, alza subito il baricentro; se il risultato ci sta bene, proteggi la struttura.",actionLabel:"ATTACCA",action:()=>clickButton("ATTACCA")});
      }
      if(!candidates.length&&minute>=35){
        candidates.push({key:`check-${Math.floor(minute/15)}`,staff:"MATCH ANALYST",title:"LETTURA DELLA PARTITA",message:`Il possesso è al ${userPoss}%. Per ora non vedo un'emergenza tattica: manteniamo la struttura e prepariamoci a intervenire se cambia l'inerzia.`});
      }

      const next=candidates.find(x=>!dismissed.has(x.key));
      if(next){setAdvice(next);lastMinute.current=minute}
    };

    const id=window.setInterval(buildAdvice,1800);
    buildAdvice();
    return()=>window.clearInterval(id);
  },[path,club,dismissed]);

  if(path!=="/partita"||!advice)return null;
  return <aside className={styles.card}>
    <button className={styles.close} aria-label="Chiudi consiglio" onClick={()=>{setDismissed(s=>new Set([...s,advice.key]));setAdvice(null)}}><X size={13}/></button>
    <div className={styles.staff}>{advice.staff==="MATCH ANALYST"?<Brain size={16}/>:<MessageSquareText size={16}/>}<span>{advice.staff}</span></div>
    <small>CONSIGLIO DALLA PANCHINA</small>
    <strong>{advice.title}</strong>
    <p>{advice.message}</p>
    {advice.action&&<button className={styles.apply} onClick={()=>{advice.action?.();setDismissed(s=>new Set([...s,advice.key]));setAdvice(null)}}>{advice.actionLabel}<ChevronRight size={13}/></button>}
  </aside>;
}
