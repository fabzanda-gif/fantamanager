import { ArrowLeft, CircleDot, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

const names: Record<string,string>={ATA:"Atalanta",BOL:"Bologna",CAG:"Cagliari",COM:"Como",FIO:"Fiorentina",FRO:"Frosinone",GEN:"Genoa",INT:"Inter",JUV:"Juventus",LAZ:"Lazio",LEC:"Lecce",MIL:"Milan",MON:"Monza",NAP:"Napoli",PAR:"Parma",ROM:"Roma",SAS:"Sassuolo",TOR:"Torino",UDI:"Udinese",VEN:"Venezia"};

export default async function Matrix({searchParams}:{searchParams:Promise<{club?:string}>}) {
 const p=await searchParams; const code=p.club && names[p.club] ? p.club : "CAG";
 return <main className="matrixPage">
   <div className="newTop"><Link href="/nuova-partita" className="back"><ArrowLeft size={17}/> Cambia club</Link><span className="matrixRun">RUN 01 · {names[code]}</span></div>
   <section className="matrixStage">
    <div className="matrixTitle"><p className="eyebrow">FASE 02 // COSTRUZIONE</p><h1>La Matrice</h1><p>La tua rosa è vuota. Sedici giocatori separano questo club dalla sua prima formazione.</p></div>
    <div className="matrixMachine">
      <div className="matrixScreen">
        <span className="scan"/>
        <Sparkles size={25}/>
        <small>PROSSIMA ESTRAZIONE</small>
        <strong>PORTIERE</strong>
        <p>0 / 2 selezionati</p>
      </div>
      <div className="roleTrack"><b className="on">P <span>0/2</span></b><b>D <span>0/5</span></b><b>C <span>0/5</span></b><b>A <span>0/4</span></b></div>
      <button className="drawButton" disabled><CircleDot size={18}/> PESCA GIOCATORE</button>
      <p className="locked"><LockKeyhole size={13}/> Motore di estrazione: prossimo incremento</p>
    </div>
    <aside className="matrixRules"><span>PROTOCOLLO MATRICE</span><strong>Ogni pescata conta.</strong><p>Il ranking influenza la rarità, non garantisce il rendimento. Una volta estratto, un giocatore non torna nella Matrice.</p><div><b>16</b><small>ROSA INIZIALE</small></div><div><b>20</b><small>FASE PROTETTA</small></div><div><b>23</b><small>ROSA COMPLETA</small></div></aside>
   </section>
 </main>
}
