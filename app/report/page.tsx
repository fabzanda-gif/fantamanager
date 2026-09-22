"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, TrendingUp, TrendingDown, Minus, Home } from "lucide-react";
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
   if(win)d+=1;if(loss)d-=1;if(s.goals)d+=Math.min(2,s.goals);if(s.dangerous_errors)d-=1;
   if(x.confidence>=80&&d>0)d=Math.min(d,2);if(x.confidence<=30&&d<0)d=Math.max(d,-2);d=Math.max(-4,Math.min(4,d));
   const after=Math.max(0,Math.min(100,x.confidence+d));let reason=rating>=7?"Prestazione convincente":rating<6?"Serata difficile":"Prestazione solida";
   if(s.goals)reason+=" · gol";if(s.dangerous_errors)reason+=" · errore pericoloso";
   return{match_id:match.id,run_id:run,player_id:x.player_id,player_name:x.player_name,before_value:x.confidence,delta:d,after_value:after,reason};
  });
  const ins=await sb.from("game_confidence_changes").insert(rows).select();if(ins.error)return;
  for(const r of rows)await sb.from("game_run_players").update({confidence:r.after_value}).eq("run_id",run).eq("player_id",r.player_id);
  setChanges(ins.data||rows);setDone(true);
 }
 if(!match)return <main className="reportPage"><p>Caricamento report...</p></main>;
 const best=stats[0], recovery=[...stats].sort((a,b)=>b.recoveries-a.recoveries)[0], prog=[...stats].sort((a,b)=>b.progressions-a.progressions)[0], err=stats.find(s=>s.dangerous_errors>0);
 return <main className="reportPage">
  <div className="newTop"><Link href={"/partita?run="+run+"&round="+round} className="back"><ArrowLeft size={17}/> Partita</Link><span className="matrixRun">POST // GIORNATA {String(round).padStart(2,"0")}</span></div>
  <header className="reportHero"><p className="eyebrow">TRIPLICE FISCHIO</p><div className="reportScore"><div><ClubLogo code={match.venue==="home"?club:match.opponent_code} className="reportLogo"/><strong>{clubName(match.venue==="home"?club:match.opponent_code)}</strong></div><h1>{match.venue==="home"?match.user_goals:match.opponent_goals} - {match.venue==="home"?match.opponent_goals:match.user_goals}</h1><div><ClubLogo code={match.venue==="home"?match.opponent_code:club} className="reportLogo"/><strong>{clubName(match.venue==="home"?match.opponent_code:club)}</strong></div></div><p>Il risultato è finito. Adesso comincia l’interpretazione.</p><Link className="statsLink" href={"/statistiche?run="+run+"&round="+round}>STATISTICHE PARTITA →</Link></header>
  <div className="reportGrid"><section className="ratings"><div className="sectionTitle">PAGELLE <span>{stats.length} titolari</span></div>
   {stats.map(s=><article key={s.player_id}><b className={"rating "+(s.rating>=7?"good":s.rating<6?"bad":"")}>{Number(s.rating).toFixed(1)}</b><div><strong>{s.player_name}</strong><span>{s.saves||s.interventions?s.saves+" parate · "+s.goals_conceded+" subiti":(s.goals?s.goals+" gol · ":"")+(s.assists?s.assists+" assist · ":"")+s.shots+" tiri · "+Number(s.xg||0).toFixed(2)+" xG"}</span></div>{s.dangerous_errors>0&&<em>ERRORE</em>}</article>)}
  </section><section className="analystPost"><div className="staffHead"><div className="staffAvatar"><Eye/></div><div><small>MATCH ANALYST</small><strong>Cosa ho visto</strong></div></div>
   {best&&<p><b>Prestazione:</b> {best.player_name} e stato il riferimento della gara ({Number(best.rating).toFixed(1)}).</p>}
   {recovery&&<p><b>Senza palla:</b> {recovery.player_name} ha guidato i recuperi: {recovery.recoveries}.</p>}
   {prog&&<p><b>Avanzamento:</b> {prog.player_name} ha prodotto {prog.progressions} progressioni.</p>}
   {err?<p className="warning"><b>Da rivedere:</b> {err.player_name} ha commesso almeno un errore pericoloso.</p>:<p><b>Solidita:</b> nessun errore pericoloso registrato tra i titolari.</p>}
   <small className="dataNote">Osservazioni generate dai dati della partita.</small>
  </section></div>
  <section className="confidencePost"><div className="sectionTitle">FIDUCIA // DOPO LA PARTITA</div>
   {!done?<div className="confidenceGate"><p>Risultato e prestazione entrano nello spogliatoio. La Fiducia reagisce, ma il valore accumulato fa da cuscinetto.</p><button onClick={apply}>AGGIORNA FIDUCIA</button></div>:
   <div className="confidenceRows">{changes.slice().sort((a,b)=>b.delta-a.delta).map(c=><article key={c.player_id}><div>{c.delta>0?<TrendingUp/>:c.delta<0?<TrendingDown/>:<Minus/>}</div><strong>{c.player_name}</strong><span>{c.reason}</span><b>{c.before_value} → {c.after_value}</b><em>{c.delta>0?"+":""}{c.delta}</em></article>)}</div>}
  </section>
  {done&&<div className="returnHub"><Home size={18}/><div><strong>Giornata {round} archiviata.</strong><span>La squadra porta con se quello che e successo.</span></div><Link href={"/stagione?run="+run}>TORNA ALL HUB →</Link></div>}
 </main>;
}