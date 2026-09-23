"use client";

import { ArrowLeft, ArrowRight, Check, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const clubs = [
  ["ATA","Atalanta"],["BOL","Bologna"],["CAG","Cagliari"],["COM","Como"],["FIO","Fiorentina"],
  ["FRO","Frosinone"],["GEN","Genoa"],["INT","Inter"],["JUV","Juventus"],["LAZ","Lazio"],
  ["LEC","Lecce"],["MIL","Milan"],["MON","Monza"],["NAP","Napoli"],["PAR","Parma"],
  ["ROM","Roma"],["SAS","Sassuolo"],["TOR","Torino"],["UDI","Udinese"],["VEN","Venezia"]
] as const;

export default function NewGame() {
  const [selected, setSelected] = useState("CAG");
  const club = useMemo(() => clubs.find(([code]) => code === selected)!, [selected]);

  return <main className="newGame">
    <div className="newTop">
      <Link href="/" className="back"><ArrowLeft size={17}/> Hub</Link>
      <div className="step"><span>NUOVA RUN</span><b>01</b><i/><small>SCELTA CLUB</small></div>
    </div>

    <section className="newHero">
      <p className="eyebrow">FANTAMANAGER // INIZIO CARRIERA</p>
      <h1>Scegli il tuo club.</h1>
      <p>La rosa originale verrà smantellata. Da quel momento dovrai ricostruire la squadra attraverso la Matrice.</p>
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
        <div className="rule"><Shield size={17}/><div><strong>Tabula rasa</strong><span>I giocatori del club diventano eleggibili per la nuova costruzione.</span></div></div>
        <div className="rule"><Sparkles size={17}/><div><strong>16 pescate iniziali</strong><span>2 P · 5 D · 5 C · 4 A. Ogni scelta inizierà a definire la tua storia.</span></div></div>
        <div className="selectionNote">Verrà creata una nuova run separata dalle carriere già concluse o in corso.</div>
        <Link href={"/matrice?club="+selected+"&new=1"} className="startButton">Entra nella Matrice <ArrowRight size={17}/></Link>
      </aside>
    </div>
  </main>
}
