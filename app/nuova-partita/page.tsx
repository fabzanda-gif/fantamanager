"use client";

import { ArrowLeft, ArrowRight, Check, Shield, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");

const clubs = [
  ["ATA","Atalanta"],["BOL","Bologna"],["CAG","Cagliari"],["COM","Como"],["FIO","Fiorentina"],
  ["FRO","Frosinone"],["GEN","Genoa"],["INT","Inter"],["JUV","Juventus"],["LAZ","Lazio"],
  ["LEC","Lecce"],["MIL","Milan"],["MON","Monza"],["NAP","Napoli"],["PAR","Parma"],
  ["ROM","Roma"],["SAS","Sassuolo"],["TOR","Torino"],["UDI","Udinese"],["VEN","Venezia"]
] as const;

export default function NewGame() {
  const [selected, setSelected] = useState("CAG");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const club = useMemo(() => clubs.find(([code]) => code === selected)!, [selected]);

  async function startCareer(){
    if(busy)return;
    setBusy(true);setError("");
    let {data:{session}}=await supabase.auth.getSession();
    if(!session){
      const auth=await supabase.auth.signInAnonymously();
      if(auth.error||!auth.data.session){setError("Impossibile iniziare la carriera: accesso anonimo Supabase non disponibile.");setBusy(false);return}
      session=auth.data.session;
    }

    const roster=await supabase.from("players")
      .select("id,name,role,team_nfl,fvm_fc,quotazione_fc,list_price,status_titolarita")
      .eq("team_nfl",selected)
      .in("status_titolarita",["Titolare","Ballottaggio"])
      .in("role",["P","D","C","A"]);
    if(roster.error){setError(roster.error.message);setBusy(false);return}
    const players=(roster.data||[]).filter((p:any)=>p.id&&p.name);
    if(players.length<11){setError(`La rosa ${club[1]} nel database contiene solo ${players.length} giocatori di prima squadra. Non creo una carriera incompleta.`);setBusy(false);return}

    const run=await supabase.from("game_runs").insert({user_id:session.user.id,club_code:selected,status:"active",current_round:0,squad_size:players.length}).select("id").single();
    if(run.error||!run.data?.id){setError(run.error?.message||"Errore nella creazione della carriera.");setBusy(false);return}
    const rid=run.data.id;

    const rows=players.map((p:any)=>({
      run_id:rid,
      player_id:p.id,
      player_name:p.name,
      role:p.role,
      source_club:p.team_nfl,
      strength:Number(p.fvm_fc||p.quotazione_fc||p.list_price||0),
      confidence:50,
      manager_trust:50,
      squad_status:"accepted",
      squad_status_role:p.status_titolarita==="Titolare"?"starter":"rotation",
      fitness:100,
      availability:"available",
      decided_at:new Date().toISOString()
    }));
    const seeded=await supabase.from("game_run_players").insert(rows);
    if(seeded.error){
      await supabase.from("game_runs").delete().eq("id",rid);
      setError(seeded.error.message);setBusy(false);return;
    }

    localStorage.setItem("fm_run_"+selected,rid);
    window.location.href="/rosa?run="+rid;
  }

  return <main className="newGame">
    <div className="newTop">
      <Link href="/" className="back"><ArrowLeft size={17}/> Hub</Link>
      <div className="step"><span>NUOVA CARRIERA</span><b>01</b><i/><small>SCELTA CLUB</small></div>
    </div>

    <section className="newHero">
      <p className="eyebrow">90 MINUTES // INIZIO CARRIERA</p>
      <h1>Scegli il tuo club.</h1>
      <p>Parti dalla rosa attuale del club. Da allenatore gestirai campo, spogliatoio e richieste tecniche; mercato e contratti passeranno dalla Direzione Sportiva.</p>
    </section>

    <div className="clubLayout">
      <section className="clubGrid">
        {clubs.map(([code,name]) => <button key={code} onClick={()=>setSelected(code)} className={"clubChoice "+(selected===code?"selected":"")}>
          <span className="clubLogo">{code.slice(0,2)}</span>
          <strong>{name}</strong>
          <small>{code}</small>
          {selected===code && <i><Check size={13}/></i>}
        </button>)}
      </section>

      <aside className="selectionPanel">
        <div className="selectionCrest">{selected.slice(0,2)}</div>
        <p className="eyebrow">CLUB SELEZIONATO</p>
        <h2>{club[1]}</h2>
        <div className="rule"><Shield size={17}/><div><strong>Rosa del club</strong><span>La carriera parte dai giocatori di prima squadra già presenti nel club, senza draft iniziale.</span></div></div>
        <div className="rule"><BriefcaseBusiness size={17}/><div><strong>Tu sei l'allenatore</strong><span>Definisci esigenze e priorità. Sarà il DS a cercare, trattare, vendere e rinnovare.</span></div></div>
        <div className="selectionNote">Verrà creata una nuova carriera separata dalle altre run già concluse o in corso.</div>
        {error&&<div className="matrixError">{error}</div>}
        <button onClick={startCareer} disabled={busy} className="startButton">{busy?"Creazione rosa…":"Inizia la carriera"} <ArrowRight size={17}/></button>
      </aside>
    </div>
  </main>
}
