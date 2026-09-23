"use client";
import { ArrowLeft, Check, CircleDot, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");
const names:Record<string,string>={ATA:"Atalanta",BOL:"Bologna",CAG:"Cagliari",COM:"Como",FIO:"Fiorentina",FRO:"Frosinone",GEN:"Genoa",INT:"Inter",JUV:"Juventus",LAZ:"Lazio",LEC:"Lecce",MIL:"Milan",MON:"Monza",NAP:"Napoli",PAR:"Parma",ROM:"Roma",SAS:"Sassuolo",TOR:"Torino",UDI:"Udinese",VEN:"Venezia"};
const targets={P:2,D:5,C:5,A:4} as const; type Role=keyof typeof targets;
type Player={id:string;name:string;role:Role;team_nfl:string|null;fvm_fc:number|null;quotazione_fc:number|null;list_price:number|null;status_titolarita:string|null;strength?:number;rank?:number};
type Draw=Player&{drawNo:number};
export default function Matrix(){
 const [code,setCode]=useState("CAG");
 useEffect(()=>{const c=new URLSearchParams(window.location.search).get("club");if(c&&names[c])setCode(c)},[]);
 const [runId,setRunId]=useState<string|null>(null),[pool,setPool]=useState<Player[]>([]),[draw,setDraw]=useState<Draw|null>(null),[accepted,setAccepted]=useState<Player[]>([]),[removed,setRemoved]=useState<string[]>([]),[busy,setBusy]=useState(true),[error,setError]=useState("");
 const counts=useMemo(()=>({P:accepted.filter(p=>p.role==="P").length,D:accepted.filter(p=>p.role==="D").length,C:accepted.filter(p=>p.role==="C").length,A:accepted.filter(p=>p.role==="A").length}),[accepted]);
 const role=(Object.keys(targets) as Role[]).find(r=>counts[r]<targets[r])??null;
 useEffect(()=>{(async()=>{setBusy(true);const qs=new URLSearchParams(window.location.search),requested=qs.get("club");if(requested&&requested!==code)return;const forceNew=qs.get("new")==="1";let {data:{session}}=await supabase.auth.getSession();if(!session){const a=await supabase.auth.signInAnonymously();if(a.error){setError("Per salvare la run serve attivare l'accesso anonimo di Supabase Auth.");setBusy(false);return}session=a.data.session}
   const existing=forceNew?null:localStorage.getItem("fm_run_"+code);let rid=existing;
   if(!rid){const ins=await supabase.from("game_runs").insert({user_id:session!.user.id,club_code:code,status:"active",current_round:0,squad_size:0}).select("id").single();if(ins.error){setError(ins.error.message);setBusy(false);return}rid=ins.data.id;localStorage.setItem("fm_run_"+code,rid!)}
   setRunId(rid);
   const ps=await supabase.from("players").select("id,name,role,team_nfl,fvm_fc,quotazione_fc,list_price,status_titolarita").in("status_titolarita",["Titolare","Ballottaggio"]).in("role",["P","D","C","A"]);
   if(ps.error){setError(ps.error.message);setBusy(false);return}setPool((ps.data??[]) as Player[]);
   const history=await supabase.from("game_run_players").select("player_id,player_name,role,source_club,strength,matrix_rank,squad_status").eq("run_id",rid);
   if(history.data){setRemoved(history.data.map(x=>x.player_id));const saved=history.data.filter(x=>x.squad_status==="accepted");setAccepted(saved.map(x=>({id:x.player_id,name:x.player_name,role:x.role as Role,team_nfl:x.source_club,fvm_fc:null,quotazione_fc:null,list_price:null,status_titolarita:null,strength:Number(x.strength),rank:x.matrix_rank})));if(saved.length>=16){window.location.replace("/rosa?run="+rid);return}}setBusy(false)})()},[code]);
 async function doDraw(){if(!role||!runId)return;setBusy(true);const res=await supabase.rpc("game_initial_draw",{p_run_id:runId,p_role:role});if(res.error){setError(res.error.message);setBusy(false);return}const x=res.data?.[0];if(!x){setError("Nessun giocatore disponibile.");setBusy(false);return}setDraw({id:x.player_id,name:x.player_name,role:x.role as Role,team_nfl:x.source_club,fvm_fc:null,quotazione_fc:null,list_price:null,status_titolarita:null,strength:Number(x.strength),rank:x.matrix_rank,drawNo:x.draw_number});setBusy(false)}
 async function decide(){if(!draw||!runId)return;setBusy(true);const {error:e}=await supabase.rpc("game_accept_initial_draw",{p_run_id:runId,p_draw_number:draw.drawNo});if(e){setError(e.message)}else{setRemoved(x=>[...x,draw.id]);const next=[...accepted,draw];setAccepted(next);setDraw(null);if(next.length===16)window.location.href="/rosa?run="+runId}setBusy(false)}
 return <main className="matrixPage"><div className="newTop"><Link href="/nuova-partita" className="back"><ArrowLeft size={17}/> Cambia club</Link><span className="matrixRun">RUN · {names[code]}</span></div>
 <section className="matrixStage"><div className="matrixTitle"><p className="eyebrow">FASE 02 // COSTRUZIONE</p><h1>La Matrice</h1><p>{accepted.length<16?"Costruisci la rosa iniziale. Ogni giocatore estratto uscirà definitivamente dalla Matrice.":"Rosa iniziale completata. La squadra esiste."}</p>{error&&<p className="matrixError">{error}</p>}</div>
 <div className="matrixMachine"><div className="matrixScreen"><span className="scan"/>{busy?<Loader2 className="spin" size={28}/>:draw?<><small>ESTRAZIONE #{draw.drawNo}</small><strong>{draw.name}</strong><p>{draw.role} · {draw.team_nfl} · ranking provvisorio #{draw.rank}</p></>:<><Sparkles size={25}/><small>PROSSIMA ESTRAZIONE</small><strong>{role??"COMPLETATA"}</strong><p>{role?counts[role]+" / "+targets[role]+" selezionati":"16 / 16 giocatori"}</p></>}</div>
 <div className="roleTrack">{(Object.keys(targets) as Role[]).map(r=><b key={r} className={role===r?"on":""}>{r} <span>{counts[r]}/{targets[r]}</span></b>)}</div>
 {draw?<button onClick={decide} disabled={busy} className="matrixAcceptButton"><span className="matrixAcceptIcon"><Check size={15}/></span><span><b>CONFERMA GIOCATORE</b><small>AGGIUNGI ALLA ROSA</small></span></button>:<button onClick={doDraw} disabled={busy||!role||!!error} className="drawButton live"><CircleDot size={18}/> {role?"PESCA GIOCATORE":"DRAFT COMPLETATO"}</button>}</div>
 <aside className="matrixRules"><span>PROTOCOLLO MATRICE</span><strong>{accepted.length}/16 in rosa</strong><p>Il ranking influenza la rarità, non garantisce il rendimento. Nel draft iniziale ogni pescata è vincolante: 16 pescate, 16 giocatori.</p>{(Object.keys(targets) as Role[]).map(r=><div key={r}><b>{counts[r]}/{targets[r]}</b><small>{r==="P"?"PORTIERI":r==="D"?"DIFENSORI":r==="C"?"CENTROCAMPISTI":"ATTACCANTI"}</small></div>)}</aside></section></main>
}