import {
  BarChart3, Bell, CalendarDays, ChevronRight, CircleDot, ClipboardList,
  LayoutDashboard, MessageSquareText, Shield, Sparkles, Trophy, UsersRound
} from "lucide-react";

const confidence = [
  { name: "Piccoli", role: "ATT", value: 92, trend: "↑" },
  { name: "Ferguson", role: "CEN", value: 85, trend: "↑" },
  { name: "Romano", role: "CEN", value: 84, trend: "→" },
  { name: "Frendrup", role: "CEN", value: 82, trend: "↓" },
];

const recent = [
  ["Genoa", "2–1", "V"], ["Roma", "1–2", "P"], ["Venezia", "2–0", "V"]
];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">FM</div><div><strong>FantaManager</strong><span>Club OS</span></div></div>
        <nav>
          <a className="active"><LayoutDashboard size={18}/>Hub</a>
          <a><UsersRound size={18}/>Rosa</a>
          <a><Shield size={18}/>Formazione</a>
          <a><Sparkles size={18}/>Matrice</a>
          <a><Trophy size={18}/>Campionato</a>
          <a><BarChart3 size={18}/>Statistiche</a>
          <a><ClipboardList size={18}/>Match Analyst</a>
        </nav>
        <div className="sidebarBottom"><span>RUN 01</span><strong>Cagliari</strong><small>Giornata 24 · 40 pt</small></div>
      </aside>

      <section className="content">
        <header>
          <div><p className="eyebrow">CENTRO SPORTIVO · LUNEDÌ</p><h1>Buon pomeriggio, Mister.</h1><p className="muted">La squadra prepara la prossima sfida. Hai 2 nuovi aggiornamenti.</p></div>
          <button className="iconButton"><Bell size={19}/><i>2</i></button>
        </header>

        <div className="dashboard">
          <section className="card nextMatch">
            <div className="cardHead"><span>PROSSIMA PARTITA</span><span className="pill">SERIE A · G24</span></div>
            <div className="match">
              <div className="club"><div className="crest">CA</div><strong>Cagliari</strong><span>40 pt</span></div>
              <div className="versus"><small>DOMENICA · 15:00</small><b>VS</b><span>Casa</span></div>
              <div className="club"><div className="crest away">BO</div><strong>Bologna</strong><span>Avversario</span></div>
            </div>
            <div className="matchActions">
              <button className="primary">Prepara la partita <ChevronRight size={17}/></button>
              <button className="secondary">Rapporto avversario</button>
            </div>
          </section>

          <section className="card analyst">
            <div className="cardHead"><span>DALLO STAFF</span><MessageSquareText size={17}/></div>
            <div className="staffRow">
              <div className="avatar">MA</div>
              <div><strong>Match Analyst</strong><span>Rapporto pronto · 12 min fa</span></div>
            </div>
            <blockquote>“Il Bologna tende a chiudere il centro. Ho isolato tre situazioni che possono interessarci.”</blockquote>
            <button className="textButton">Apri il rapporto <ChevronRight size={16}/></button>
          </section>

          <section className="card confidence">
            <div className="cardHead"><span>FIDUCIA SQUADRA</span><span className="score">78</span></div>
            <div className="confidenceList">
              {confidence.map((p) => (
                <div className="player" key={p.name}>
                  <div className="miniAvatar">{p.name.slice(0,1)}</div>
                  <div className="playerName"><strong>{p.name}</strong><span>{p.role}</span></div>
                  <div className="meter"><i style={{width: p.value+"%"}}/></div>
                  <b>{p.value}%</b><em className={p.trend === "↓" ? "down" : ""}>{p.trend}</em>
                </div>
              ))}
            </div>
            <button className="textButton">Vedi rosa e gerarchie <ChevronRight size={16}/></button>
          </section>

          <section className="card pulse">
            <div className="cardHead"><span>IL MOMENTO</span><CircleDot size={17}/></div>
            <div className="pulseNumber">40 <small>punti</small></div>
            <p>23 partite · Il gruppo è competitivo, ma la gerarchia a centrocampo sta cambiando.</p>
            <div className="tags"><span>McTominay nuovo</span><span>Bisseck fragile</span></div>
          </section>

          <section className="card results">
            <div className="cardHead"><span>ULTIME PARTITE</span><CalendarDays size={17}/></div>
            {recent.map(([team, score, result]) => (
              <div className="result" key={team}><span className={"resultBadge "+(result==="V"?"win":"loss")}>{result}</span><strong>{team}</strong><b>{score}</b></div>
            ))}
          </section>

          <section className="card inbox">
            <div className="cardHead"><span>DA SEGUIRE</span><span className="pill warning">2</span></div>
            <div className="notice"><span>●</span><div><strong>Bisseck</strong><p>Sta iniziando a dubitare del timing delle uscite.</p></div></div>
            <div className="notice"><span>●</span><div><strong>Nuovo equilibrio</strong><p>L'arrivo di McTominay aumenta la concorrenza a centrocampo.</p></div></div>
          </section>
        </div>
        <footer><span>FANTAMANAGER // RUN 01</span><span>Peschi giocatori. Costruisci una squadra. Gestisci persone.</span></footer>
      </section>
    </main>
  );
}
