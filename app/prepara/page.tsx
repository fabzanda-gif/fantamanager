"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowLeft,Check,Crown,Shield,RotateCcw} from "lucide-react";
import {createClient} from "@supabase/supabase-js";
const sb=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");
type P={player_id:string;player_name:string;role:string;source_club:string;confidence:number};
const shapes:Record<string,string[]>={"4-3-3":["P","D","D","D","D","C","C","C","A","A","A"],"4-4-2":["P","D","D","D","D","C","C","C","C","A","A"],"3-5-2":["P","D","D","D","C","C","C","C","C","A","A"],"4-2-3-1":["P","D","D","D","D","C","C","C","C","C","A"],"4-3-1-2":["P","D","D","D","D","C","C","C","C","A","A"],"3-4-3":["P","D","D","D","C","C","C","C","A","A","A"]};
export default function Prepara(){
 const[ps,setPs]=useState<P[]>([]),[form,setForm]=useState("4-3-3"),[xi,setXi]=useState<string[]>([]),[capt,setCapt]=useState(""),[run,setRun]=useState(""),[saved,setSaved]=useState(false),[busy,setBusy]=useState(true),[round,setRound]=useState(1),[opp,setOpp]=useState("—"),[venue,setVenue]=useState("home");
 useEffect(()=>{(async()=>{const id=new URLSearchParams(location.search).get("run")||"";setRun(id);
  const rr=await sb.from("game_runs").select("club_code,current_round").eq("id",id).single();const club=rr.data?.club_code||"CAG";const next=(rr.data?.current_round||0)+1;setRound(next);
  const fx=await sb.from("game_schedule").select("home_code,away_code").eq("run_id",id).eq("round",next).or(`home_code.eq.${club},away_code.eq.${club}`).maybeSingle();
  if(fx.data){const home=fx.data.home_code===club;setVenue(home?"home":"away");setOpp(home?fx.data.away_code:fx.data.home_code)}
  const p=await sb.from("game_run_players").select("player_id,player_name,role,source_club,confidence").eq("run_id",id).eq("squad_status","accepted");setPs(p.data||[]);
  const old=await sb.from("game_lineups").select("id,formation,captain_player_id").eq("run_id",id).maybeSingle();
  if(old.data){setForm(old.data.formation||"4-3-3");setCapt(old.data.captain_player_id||"");const lp=await sb.from("game_lineup_players").select("player_id").eq("lineup_id",old.data.id);setXi((lp.data||[]).map((x:any)=>x.player_id))}
  setBusy(false)})()},[]);
 const needs=useMemo(()=>shapes[form].reduce((a:Record<string,number>,r)=>(a[r]=(a[r]||0)+1,a),{}),[form]);
 function dirty(){setSaved(false)}
 function toggle(p:P){dirty();setXi(x=>x.includes(p.player_id)?x.filter(i=>i!==p.player_id):(x.filter(id=>ps.find(q=>q.player_id===id)?.role===p.role).length<(needs[p.role]||0)?[...x,p.player_id]:x))}
 function changeFormation(f:string){setForm(f);setXi([]);setCapt("");dirty()}
 async function save(){if(xi.length!==11||!capt)return;setBusy(true);const old=await sb.from("game_lineups").select("id").eq("run_id",run).maybeSingle();let lid=old.data?.id;
  if(lid){await sb.from("game_lineup_players").delete().eq("lineup_id",lid);await sb.from("game_lineups").update({formation:form,captain_player_id:capt,updated_at:new Date().toISOString()}).eq("id",lid)}
  else{const n=await sb.from("game_lineups").insert({run_id:run,formation:form,captain_player_id:capt}).select("id").single();lid=n.data?.id}
  if(lid){const counters:Record<string,number>={};await sb.from("game_lineup_players").insert(xi.map(id=>{const r=ps.find(p=>p.player_id===id)!.role;counters[r]=(counters[r]||0)+1;return{lineup_id:lid,player_id:id,slot_code:r+counters[r]}}));setSaved(true)}
  setBusy(false)}
 return <main className="prepPage"><div className="newTop"><Link href={"/stagione?run="+run} className="back"><ArrowLeft size={17}/> Hub</Link><span className="matrixRun">G{String(round).padStart(2,"0")} // PRE-PARTITA</span></div>
 <header className="prepHero"><p className="eyebrow">PREPARA PARTITA // {venue==="home"?"CASA":"TRASFERTA"}</p><h1>{venue==="home"?"CAG":opp}<span className="prepVs"> VS </span>{venue==="home"?opp:"CAG"}</h1><p>L'XI precedente è solo una bozza. Ogni giornata devi fermarti, scegliere e confermare di nuovo.</p></header>
 <div className="prepReminder"><RotateCcw size={16}/><div><b>FORMAZIONE NON CONFERMATA</b><span>Rivedi modulo, Fiducia e gerarchie. Il tempo non avanza finché non confermi l'XI di G{round}.</span></div></div>
 <div className="prepGrid"><section className="prepPanel"><h3>MODULO</h3><div className="formationTabs">{Object.keys(shapes).map(f=><button className={f===form?"active":""} onClick={()=>changeFormation(f)} key={f}>{f}</button>)}</div><div className="pitch"><div className="pitchScore">{xi.length}/11</div>{["A","C","D","P"].map(r=><div className="pitchLine" key={r}>{Array.from({length:needs[r]||0}).map((_,i)=>{const p=ps.filter(p=>p.role===r&&xi.includes(p.player_id))[i];return <div className={"pitchSlot "+(p?"filled":"")} key={i}><span>{p?p.player_name:"+"}</span>{p&&<small>{p.confidence}%</small>}</div>})}</div>)}</div></section>
 <section className="prepPanel rosterPick"><h3>ROSA <span>scegli l'XI di oggi</span></h3>{["P","D","C","A"].map(r=><div key={r} className="pickRole"><b>{r}</b>{ps.filter(p=>p.role===r).map(p=><button key={p.player_id} onClick={()=>toggle(p)} className={xi.includes(p.player_id)?"picked":""}><span>{p.player_name}<small>{p.source_club}</small></span><em>{p.confidence}%</em>{xi.includes(p.player_id)&&<Check size={14}/>}</button>)}</div>)}</section></div>
 <section className="captainBar"><Crown size={18}/><div><strong>CAPITANO DI OGGI</strong><span>La gerarchia è parte della scelta pre-partita</span></div><select value={capt} onChange={e=>{setCapt(e.target.value);dirty()}}><option value="">Scegli...</option>{ps.filter(p=>xi.includes(p.player_id)).map(p=><option value={p.player_id} key={p.player_id}>{p.player_name}</option>)}</select><button disabled={busy||xi.length!==11||!capt} onClick={save}><Shield size={16}/>{saved?"XI G"+round+" CONFERMATO":"CONFERMA XI PER G"+round}</button></section>
 {saved&&<div className="goMatch"><Link href={"/vigilia?run="+run}>ANALIZZA L'AVVERSARIO E IL PIANO →</Link></div>}</main>
}