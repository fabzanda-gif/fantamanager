"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowLeft,Check,CircleDot,Loader2,Sparkles} from "lucide-react";
import {createClient} from "@supabase/supabase-js";

const sb=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");
type Role="P"|"D"|"C"|"A";
type Draw={player_id:string;player_name:string;role:Role;source_club:string;strength:number;matrix_rank:number;draw_number:number};
const roleName:Record<Role,string>={P:"PORTIERE",D:"DIFENSORE",C:"CENTROCAMPISTA",A:"ATTACCANTE"};

export default function Draft(){
 const[run,setRun]=useState(""),[club,setClub]=useState(""),[round,setRound]=useState(0),[done,setDone]=useState(0),[role,setRole]=useState<Role>("A"),[draw,setDraw]=useState<Draw|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState("");
 const due=Math.floor(round/5),available=Math.max(0,due-done);
 useEffect(()=>{(async()=>{const id=new URLSearchParams(location.search).get("run")||"";setRun(id);if(!id){setError("Run mancante.");setBusy(false);return}
   const rr=await sb.from("game_runs").select("club_code,current_round,squad_size").eq("id",id).single();if(!rr.data){setError("Run non trovata.");setBusy(false);return}
   setClub(rr.data.club_code);setRound(rr.data.current_round||0);
   const gd=await sb.from("game_draws").select("player_id,role,draw_number,decision").eq("run_id",id).eq("phase","season_draft").order("draw_number");
   setDone((gd.data||[]).filter((x:any)=>x.decision==="accepted").length);
   const pending=(gd.data||[]).find((x:any)=>x.decision==null);
   if(pending){const p=await sb.from("players").select("id,name,role,team_nfl,fvm_fc,quotazione_fc,list_price").eq("id",pending.player_id).single();if(p.data)setDraw({player_id:p.data.id,player_name:p.data.name,role:p.data.role,source_club:p.data.team_nfl,strength:Number(p.data.fvm_fc||p.data.quotazione_fc||p.data.list_price||1),matrix_rank:0,draw_number:pending.draw_number})}
   setBusy(false)})()},[]);
 async function fish(){if(!run||available<=0)return;setBusy(true);setError("");const r=await sb.rpc("game_season_draw",{p_run_id:run,p_role:role});if(r.error){setError(r.error.message);setBusy(false);return}const x=r.data?.[0];if(x)setDraw(x as Draw);setBusy(false)}
 async function accept(){if(!draw)return;setBusy(true);const r=await sb.rpc("game_accept_season_draw",{p_run_id:run,p_draw_number:draw.draw_number});if(r.error){setError(r.error.message);setBusy(false);return}setDone(x=>x+1);setDraw(null);setBusy(false)}
 return <main className="matrixPage"><div className="newTop"><Link href={"/stagione?run="+run} className="back"><ArrowLeft size={17}/> Stagione</Link><span className="matrixRun">MATRICE // {club||"RUN"}</span></div>
 <section className="matrixStage"><div className="matrixTitle"><p className="eyebrow">DRAFT STAGIONALE</p><h1>La Matrice ritorna.</h1><p>Ogni 5 giornate completate guadagni una pescata. Le pescate non usate si accumulano.</p>{error&&<p className="matrixError">{error}</p>}</div>
 <div className="matrixMachine"><div className="matrixScreen"><span className="scan"/>{busy?<Loader2 className="spin" size={28}/>:draw?<><small>ESTRAZIONE #{draw.draw_number}</small><strong>{draw.player_name}</strong><p>{roleName[draw.role]} · {draw.source_club} · FORZA {Math.round(draw.strength)}</p></>:available>0?<><Sparkles size={25}/><small>PESCATE DISPONIBILI</small><strong>{available}</strong><p>Giornata {round} · prossima ricarica alla G{(due+1)*5}</p></>:<><Check size={25}/><small>MATRICE IN ATTESA</small><strong>G{(due+1)*5}</strong><p>Nessuna pescata disponibile in questo momento.</p></>}</div>
 <div className="seasonDraftRoles">{(["P","D","C","A"] as Role[]).map(r=><button key={r} className={role===r?"active":""} disabled={!!draw||busy} onClick={()=>setRole(r)}><b>{r}</b><span>{roleName[r]}</span></button>)}</div>
 {draw?<button className="acceptButton fullDecision" disabled={busy} onClick={accept}><Check size={17}/> AGGIUNGI ALLA ROSA</button>:<button className="drawButton live" disabled={busy||available<=0} onClick={fish}><CircleDot size={18}/> PESCA {roleName[role]}</button>}</div>
 <aside className="matrixRules"><span>PROTOCOLLO STAGIONE</span><strong>{done}/{due} pescate usate</strong><p>La pescata è vincolante: scegli il ruolo, la Matrice decide il giocatore. Nessun giocatore già presente nella tua rosa può essere estratto di nuovo.</p><div><b>{available}</b><small>DISPONIBILI ORA</small></div><div><b>{round}</b><small>GIORNATA COMPLETATA</small></div><div><b>5</b><small>GIORNATE PER PESCA</small></div></aside></section></main>
}
