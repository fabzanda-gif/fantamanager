"use client";
import Link from "next/link";
import brand90 from "../assets/logos/SidebarPNG.png";
import { useEffect, useState } from "react";
import { Eye, TrendingUp, TrendingDown, Minus, Home, CalendarDays, Users, Activity, BarChart3 } from "lucide-react";
import { ClubLogo,clubName } from "../lib/clubLogos";
import { createClient } from "@supabase/supabase-js";

const sb=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");
type Stat={player_id:string;player_name:string;rating:number;goals:number;chances:number;recoveries:number;duels:number;progressions:number;dangerous_errors:number;saves:number;goals_conceded:number;interventions:number;shots:number;shots_on_target:number;assists:number;xg:number;yellow_cards:number};

export default function Report(){
 const[run,setRun]=useState(""); const[round,setRound]=useState(1); const[match,setMatch]=useState<any>(null); const[club,setClub]=useState(""); const[stats,setStats]=useState<Stat[]>([]);
 const[changes,setChanges]=useState<any[]>([]); const[done,setDone]=useState(false);
 useEffect(()=>{(async()=>{const q=new URLSearchParams(location.search),id=q.get("run")||"",rn=Number(q.get("round")||1);setRun(id);setRound(rn);
  const rr=await sb.from("game_runs").select("club_code").eq("id",id).single(); setClub(rr.data?.club_code||"");
  const m=await sb.from("game_matches").select("*").eq("run_id",id).eq("round",rn).single(); if(!m.data)return; setMatch(m.data);
  const s=await sb.from("game_match_player_stats").select("*").eq("match_id",m.data.id).order("rating",{ascending:false}); setStats((s.data||[]) as Stat[]);
  const old=await sb.from("game_confidence_changes").select("*").eq("match_id",m.data.id); if(old.data?.length){setChanges(old.data);setDone(true)}
 })()},[]);
 async function apply(){if(!match||!stats.length||done)return;
  const ids=stats.map(s=>s.player_id); const p=await sb.from("game_run_players").select("player_id,player_name,confidence").eq("run_id",run).in("player_id",ids);
  const win=match.user_goals>match.opponent_goals,loss=match.user_goals<match.opponent_goals;
  const rows=(p.data||[]).map((x:any)=>{const s=stats.find(z=>z.player_id===x.player_id)!;let d=0;const rating=Number(s.rating);
   if(rating>=7.5)d+=3;else if(rating>=6.8)d+=2;else if(rating>=6.3)d+=1;else if(rating<5.7)d-=2;else if(rating<6)d-=1;
   if(win)d+=1;if(loss)d-=1;if(s.goals)d+=Math.min(2,s.goals);if(s.assists)d+=1;if(s.saves>=4)d+=1;if(s.dangerous_errors)d-=1;
   if(x.confidence>=80&&d>0)d=Math.min(d,2);if(x.confidence<=30&&d<0)d=Math.max(d,-2);d=Math.max(-4,Math.min(4,d));
   const after=Math.max(0,Math.min(100,x.confidence+d));let reason=rating>=7?"Prestazione convincente":rating<6?"Serata difficile":"Prestazione solida";
   if(s.goals)reason+=" · gol";if(s.assists)reason+=" · assist";if(s.saves>=4)reason+=" · decisivo tra i pali";if(s.dangerous_errors)reason+=" · errore pericoloso";
   return{match_id:match.id,run_id:run,player_id:x.player_id,player_name:x.player_name,before_value:x.confidence,delta:d,after_value:after,reason};
  });
  const ins=await sb.from("game_confidence_changes").insert(rows).select();if(ins.error)return;
  for(const r of rows)await sb.from("game_run_players").update({confidence:r.after_value}).eq("run_id",run).eq("player_id",r.player_id);
  setChanges(ins.data||rows);setDone(true);
 }
 if(!match)return <main className="reportPage"><p>Caricamento report...</p></main>;
 const analystRows=[...stats].map(s=>{const rating=Number(s.rating),distance=Math.abs(rating-6.3),importance=distance*2+(s.goals||0)*2.2+(s.assists||0)*1.4+(s.dangerous_errors||0)*2+(s.saves>=4?1.4:0)+(s.shots_on_target||0)*.18;let tone="neutral",lead="Ha disputato una gara ordinata, senza spostare in modo netto l'equilibrio della partita.";if(rating>=7.5){tone="positive";lead="È stato uno dei riferimenti della squadra, incidendo con continuità nelle situazioni che contavano."}else if(rating>=6.8){tone="positive";lead="Ha dato un contributo chiaramente positivo, con diverse giocate utili e una presenza costante."}else if(rating>=6.3){lead="Prestazione solida: ha svolto il proprio compito senza grandi picchi ma con buona continuità."}else if(rating>=6){lead="Gara un po’ sotto tono: non ha commesso disastri, ma è rimasto ai margini nei momenti più importanti."}else{tone="negative";lead="Ha faticato e il suo impatto è stato inferiore a quello atteso, soprattutto nelle fasi decisive."}const details:string[]=[];if(s.goals)details.push(s.goals===1?"ha segnato":"ha segnato "+s.goals+" gol");if(s.assists)details.push(s.assists===1?"ha servito un assist":"ha servito "+s.assists+" assist");if(s.saves)details.push(s.saves+" parate");if(s.recoveries>=6)details.push(s.recoveries+" recuperi");if(s.progressions>=5)details.push(s.progressions+" progressioni");if(s.shots_on_target>=2)details.push(s.shots_on_target+" tiri nello specchio");if(s.dangerous_errors)details.push("un errore pericoloso");const tail=details.length?" In evidenza: "+details.join(", ")+".":"";return{...s,tone,importance,text:lead+tail}}).sort((a,b)=>b.importance-a.importance);
 return <main className="seasonPage"><aside className="seasonNav"><div className="seasonBrand"><img src={brand90.src} alt="90 MINUTES"/></div><b>STAGIONE</b><Link href={"/stagione?run="+run}><BarChart3/> Hub</Link><Link href={"/rosa?run="+run}><Users/> Rosa</Link><Link href={"/calendario?run="+run}><CalendarDays/> Calendario</Link><Link href={"/classifica?run="+run}><Activity/> Classifica</Link><Link href={"/statistiche-stagione?run="+run}><BarChart3/> Statistiche</Link><small>ARCHIVIO</small><span>Movimenti</span><span>Report</span></aside><section className="reportPage seasonSectionMain">
  <div className="newTop"><span className="matrixRun">POST // GIORNATA {String(round).padStart(2,"0")}</span></div>
  <header className="reportHero"><p className="eyebrow">TRIPLICE FISCHIO</p><div className="reportScore"><div><ClubLogo code={match.venue==="home"?club:match.opponent_code} className="reportLogo"/><strong>{clubName(match.venue==="home"?club:match.opponent_code)}</strong></div><h1>{match.venue==="home"?match.user_goals:match.opponent_goals} - {match.venue==="home"?match.opponent_goals:match.user_goals}</h1><div><ClubLogo code={match.venue==="home"?match.opponent_code:club} className="reportLogo"/><strong>{clubName(match.venue==="home"?match.opponent_code:club)}</strong></div></div><p>Il risultato è finito. Adesso comincia l’interpretazione.</p><Link className="statsLink" href={"/statistiche?run="+run+"&round="+round}>STATISTICHE PARTITA →</Link></header>
  <div className="reportGrid"><section className="ratings"><div className="sectionTitle">PAGELLE <span>{stats.length} titolari</span></div>
   {stats.map(s=><article key={s.player_id}><b className={"rating "+(s.rating>=7?"good":s.rating<6?"bad":"")}>{Number(s.rating).toFixed(1)}</b><div><strong>{s.player_name}</strong><span>{s.saves||s.interventions?s.saves+" parate · "+s.goals_conceded+" subiti":(s.goals?s.goals+" gol · ":"")+(s.assists?s.assists+" assist · ":"")+s.shots+" tiri · "+Number(s.xg||0).toFixed(2)+" xG"}</span></div>{s.dangerous_errors>0&&<em>ERRORE</em>}</article>)}
  </section><section className="analystPost"><div className="staffHead"><div className="staffAvatar"><Eye/></div><div><small>MATCH ANALYST</small><strong>Cosa ho visto</strong></div></div>
   <div className="analystPlayerList">{analystRows.map((s:any)=><article className={"analystEntry "+s.tone} key={s.player_id}><div><strong>{s.player_name}</strong><span>{Number(s.rating).toFixed(1)}</span></div><p>{s.text}</p></article>)}</div>
   <small className="dataNote">Lettura ordinata per impatto sulla partita: prestazioni più significative in alto, quelle più neutre in fondo.</small>
  </section></div>
  <section className="confidencePost"><div className="sectionTitle">FIDUCIA // DOPO LA PARTITA</div>
   {!done?<div className="confidenceGate"><p>Risultato e prestazione entrano nello spogliatoio. La Fiducia reagisce, ma il valore accumulato fa da cuscinetto.</p><button onClick={apply}>AGGIORNA FIDUCIA</button></div>:
   <div className="confidenceRows">{changes.slice().sort((a,b)=>b.delta-a.delta).map(c=><article key={c.player_id}><div>{c.delta>0?<TrendingUp/>:c.delta<0?<TrendingDown/>:<Minus/>}</div><strong>{c.player_name}</strong><span>{c.reason}</span><b>{c.before_value} → {c.after_value}</b><em>{c.delta>0?"+":""}{c.delta}</em></article>)}</div>}
  </section>
  {done&&<div className="returnHub"><Home size={18}/><div><strong>Giornata {round} archiviata.</strong><span>La squadra porta con se quello che e successo.</span></div><Link href={"/stagione?run="+run}>TORNA ALL HUB →</Link></div>}
 </section></main>;
}