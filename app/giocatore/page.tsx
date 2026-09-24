"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {ArrowLeft,Activity,Brain,HeartHandshake,Shield,Target,Trophy,MessageSquareText,Footprints,AlertTriangle} from "lucide-react";
import brand90 from "../assets/logos/SidebarPNG.png";
import rosaBg from "../assets/ambience/Rosa.jpeg";
import {PLAYER_PHOTOS} from "../player-photos";
import {clubName} from "../lib/clubLogos";

const supabase=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");
const CLUB:any={ATA:"atalanta",BOL:"bologna",CAG:"cagliari",COM:"como",FIO:"fiorentina",FRO:"frosinone",GEN:"genoa",INT:"inter",JUV:"juventus",LAZ:"lazio",LEC:"lecce",MIL:"milan",MON:"monza",NAP:"napoli",PAR:"parma",ROM:"roma",SAS:"sassuolo",TOR:"torino",UDI:"udinese",VEN:"venezia"};
const NAME_PHOTOS:Record<string,string>={"TERZIC":"/assets/players/frosinone/fm_62192744__TERZIC.png","PATTERSON":"/assets/players/torino/fm_61083649__PATTERSON.png","GRILLITSCH":"/assets/players/frosinone/fm_16096614__GRILLITSCH.png","GANDELMAN":"/assets/players/lecce/fm_42094193__GANDELMAN.png"};
function face(p:any){const name=String(p.player_name||p.name||"").toUpperCase(),dir=CLUB[p.source_club||p.team_nfl]||(p.source_club||p.team_nfl||"").toLowerCase(),clean=name.replace(/[^A-ZÀ-ÖØ-Ý0-9]+/g,"_").replace(/^_|_$/g,"");return PLAYER_PHOTOS[p.player_id]||NAME_PHOTOS[name]||"/assets/players/"+dir+"/"+p.player_id+"__"+clean+".png"}
function band(v:number){return v<30?"CRISI":v<45?"FRAGILE":v<60?"IN EQUILIBRIO":v<75?"SICURO":v<90?"MOLTO SICURO":"EUFORICO"}
function volatility(v:number){return v>=1.25?"ALTA":v>=.95?"MEDIA":"BASSA"}
function technicalTags(base:any,run:any){const out:string[]=[];if(base?.rigorista)out.push(base.rigorista_ordine===1?"PRIMO RIGORISTA":"RIGORISTA");if(base?.piazzati)out.push(base.piazzati_ordine===1?"PRIMO SUI PIAZZATI":"PIAZZATI");if(base?.affidabilita_fisica)out.push(base.affidabilita_fisica.toUpperCase());if(base?.propensione_cartellini&&base.propensione_cartellini!=="Normale")out.push("CARTELLINI "+base.propensione_cartellini.toUpperCase());if(base?.primo_anno_serie_a)out.push("PRIMO ANNO SERIE A");if(run?.squad_status_role)out.push(run.squad_status_role.toUpperCase());return out}
export default function Giocatore(){
 const[run,setRun]=useState(""),[club,setClub]=useState(""),[p,setP]=useState<any>(null),[base,setBase]=useState<any>(null),[stats,setStats]=useState<any>(null),[recent,setRecent]=useState<any[]>([]),[memories,setMemories]=useState<any[]>([]),[loading,setLoading]=useState(true),[bad,setBad]=useState(false);
 useEffect(()=>{(async()=>{const q=new URLSearchParams(location.search),rid=q.get("run")||"",pid=q.get("player")||"";setRun(rid);if(!rid||!pid){setLoading(false);return}const[r,rp,b,s,m,mm]=await Promise.all([
  supabase.from("game_runs").select("club_code,current_round").eq("id",rid).single(),
  supabase.from("game_run_players").select("*").eq("run_id",rid).eq("player_id",pid).single(),
  supabase.from("players").select("*").eq("id",pid).single(),
  supabase.from("game_player_season_stats").select("*").eq("run_id",rid).eq("player_id",pid).maybeSingle(),
  supabase.from("game_player_memories").select("*").eq("run_id",rid).eq("player_id",pid).order("round",{ascending:false}).limit(6),
  supabase.from("game_confidence_changes").select("*").eq("run_id",rid).eq("player_id",pid).order("created_at",{ascending:false}).limit(8)
 ]);if(r.data)setClub(r.data.club_code);setP(rp.data||null);setBase(b.data||null);setStats(s.data||null);setMemories(m.data||[]);setRecent(mm.data||[]);setLoading(false)})()},[]);
 const insight=Number(p?.emotional_insight||0),vol=Number(p?.emotional_volatility||1),tags=useMemo(()=>technicalTags(base,p),[base,p]),avg=stats?.appearances?Number(stats.rating_sum||0)/Math.max(1,Number(stats.appearances)):0;
 const emotionalCopy=insight===0?"Lo staff legge soltanto segnali superficiali. Un colloquio individuale può far emergere meglio aspettative e reazioni.":insight===1?`Hai iniziato a capire il profilo: ${p?.personality||"personalità ancora poco leggibile"}. Servono altre conversazioni per capire quanto reagisce agli eventi.`:`Profilo abbastanza chiaro: ${p?.personality||"profilo neutro"}, reattività emotiva ${volatility(vol).toLowerCase()}. Il ruolo percepito è ${p?.squad_status_role||"non definito"}.`;
 if(loading)return <main className="playerProfilePage"><p>Caricamento profilo…</p></main>;
 if(!p)return <main className="playerProfilePage"><Link href={"/rosa?run="+run}>← Torna allo Spogliatoio</Link><h1>Giocatore non trovato.</h1></main>;
 const src=face(p);
 return <main className="seasonPage ambienceSection playerProfilePage" style={{backgroundImage:`linear-gradient(rgba(4,12,9,.76),rgba(4,12,9,.96)),url(${rosaBg.src})`}}>
  <aside className="seasonNav"><div className="seasonBrand"><img src={brand90.src} alt="90 MINUTES"/></div><b>STAGIONE</b><Link href={"/stagione?run="+run}><Activity/> Hub</Link><Link className="active" href={"/rosa?run="+run}><HeartHandshake/> Spogliatoio</Link></aside>
  <section className="playerProfileMain">
   <div className="playerProfileTop"><Link href={"/rosa?run="+run}><ArrowLeft size={16}/> Spogliatoio</Link><span>{clubName(club)} // PROFILO GIOCATORE</span></div>
   <header className="playerProfileHero">
    <div className="playerProfilePortrait">{!bad?<img src={src} onError={()=>setBad(true)} alt={p.player_name}/>:<i>{p.player_name.slice(0,2)}</i>}</div>
    <div><p className="eyebrow">{p.role} // {clubName(p.source_club)}</p><h1>{p.player_name}.</h1><p>{p.squad_status_role||"Ruolo da definire"} · Forma {p.fitness}% · Matrice #{p.matrix_rank}</p><div className="profileTags">{tags.map(x=><span key={x}>{x}</span>)}</div></div>
    <div className="profileHeroMetric"><small>FIDUCIA</small><strong>{p.confidence}%</strong><span>{band(Number(p.confidence))}</span></div>
   </header>

   <div className="playerProfileGrid">
    <section className="profilePanel emotionalPanel"><div className="profilePanelHead"><Brain/><div><small>STATUS EMOTIVO</small><h2>Dentro lo spogliatoio.</h2></div><span>LETTURA {Math.min(3,insight)}/3</span></div><p>{emotionalCopy}</p>
     <div className="emotionMeters"><div><span>FIDUCIA</span><b>{p.confidence}%</b><i><em style={{width:p.confidence+"%"}}/></i></div><div><span>RAPPORTO MISTER</span><b>{p.manager_trust}%</b><i><em style={{width:p.manager_trust+"%"}}/></i></div><div><span>FORMA</span><b>{p.fitness}%</b><i><em style={{width:p.fitness+"%"}}/></i></div></div>
     {insight<3&&<Link className="profileTalkCta" href={"/rosa?run="+run+"#player-"+p.player_id}><MessageSquareText/> PARLAGLI NELLO SPOGLIATOIO</Link>}
    </section>

    <section className="profilePanel"><div className="profilePanelHead"><Target/><div><small>CARATTERISTICHE</small><h2>Profilo tecnico.</h2></div></div>
     <div className="techGrid"><div><span>RUOLO</span><b>{p.role}</b></div><div><span>FORZA</span><b>{Math.round(Number(p.strength||0))}</b></div><div><span>STATUS</span><b>{base?.status_titolarita||"—"}</b></div><div><span>AFFIDABILITÀ</span><b>{base?.affidabilita_fisica||"—"}</b></div><div><span>RIGORI</span><b>{base?.rigorista?(base.rigorista_ordine?"#"+base.rigorista_ordine:"SÌ"):"NO"}</b></div><div><span>PIAZZATI</span><b>{base?.piazzati?(base.piazzati_ordine?"#"+base.piazzati_ordine:"SÌ"):"NO"}</b></div></div>
    </section>

    <section className="profilePanel"><div className="profilePanelHead"><Trophy/><div><small>STAGIONE</small><h2>Produzione.</h2></div></div>
     <div className="seasonPlayerNumbers"><div><b>{stats?.appearances||0}</b><span>PRESENZE</span></div><div><b>{stats?.starts||0}</b><span>TITOLARE</span></div><div><b>{stats?.goals||0}</b><span>GOL</span></div><div><b>{stats?.assists||0}</b><span>ASSIST</span></div><div><b>{avg?avg.toFixed(1):"—"}</b><span>MEDIA VOTO</span></div><div><b>{Number(stats?.xg||0).toFixed(2)}</b><span>xG</span></div></div>
    </section>

    <section className="profilePanel"><div className="profilePanelHead"><Footprints/><div><small>MEMORIA</small><h2>Cosa si porta dietro.</h2></div></div>
     {memories.length?<div className="profileTimeline">{memories.map((m:any)=><article key={m.id}><b>G{m.round}</b><div><strong>{String(m.memory_type||"evento").replaceAll("_"," ").toUpperCase()}</strong><p>{m.description}</p></div><span>{m.weight>0?"+":""}{m.weight}</span></article>)}</div>:<p className="profileEmpty">Nessun evento importante ancora sedimentato.</p>}
    </section>

    <section className="profilePanel confidenceHistory"><div className="profilePanelHead"><Activity/><div><small>FIDUCIA</small><h2>Ultimi movimenti.</h2></div></div>
     {recent.length?<div className="profileTimeline">{recent.map((x:any)=><article key={x.id}><b>{x.after_value}</b><div><strong>{x.reason||"Variazione"}</strong><p>{x.before_value} → {x.after_value}</p></div><span className={x.delta<0?"negative":""}>{x.delta>0?"+":""}{x.delta}</span></article>)}</div>:<p className="profileEmpty">Nessuna variazione registrata.</p>}
    </section>

    <section className="profilePanel insightPanel"><div className="profilePanelHead"><Shield/><div><small>SCOUTING UMANO</small><h2>Quanto lo conosci.</h2></div></div><p>{insight===0?"Numeri e rendimento sono visibili, ma motivazioni e sensibilità sono ancora opache.":insight===1?"Hai individuato il tipo di personalità, ma non ancora tutte le reazioni.":insight===2?"Conosci personalità, aspettative e buona parte della sua sensibilità.":"Profilo emotivo molto ben conosciuto."}</p><div className="insightTrack">{[1,2,3].map(n=><i key={n} className={insight>=n?"on":""}/>)}</div></section>
   </div>
  </section>
 </main>
}
