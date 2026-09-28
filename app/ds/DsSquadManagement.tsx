"use client";

import {useEffect,useMemo,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import styles from "./DsSquadManagement.module.css";

const sb=createClient("https://fqngllsmfqatgwzezuus.supabase.co","sb_publishable_JfPi6jdFfg8l51Z7SG3IYw_kK5J0x4L");

type SquadPlayer={player_id:string;player_name:string;role:string;strength:number|null;manager_trust:number|null;confidence:number|null;source_club:string|null;value:number};
type DsReq={id:string;request_type:string;status:string;target_player_id?:string|null;target_player_name?:string|null;manager_instruction?:string|null;proposed_amount?:number|null;proposed_wage?:number|null;resolution_round?:number|null;ds_message?:string|null;outcome?:any;final_outcome?:any;created_at:string};
type Budget={budget_total:number;budget_spent:number;transfer_revenue:number;wage_capacity:number;wage_committed:number};
type Contract={player_id:string;player_name:string;contract_until_season:number;wage_value:number;renewal_priority:string;renewal_status:string};

const hash=(s:string)=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return Math.abs(h)};

export default function DsSquadManagement(){
  const[run,setRun]=useState("");
  const[round,setRound]=useState(0);
  const[dsLevel,setDsLevel]=useState(2);
  const[squad,setSquad]=useState<SquadPlayer[]>([]);
  const[requests,setRequests]=useState<DsReq[]>([]);
  const[contracts,setContracts]=useState<Contract[]>([]);
  const[budget,setBudget]=useState<Budget|null>(null);
  const[selected,setSelected]=useState("");
  const[instruction,setInstruction]=useState("listen");
  const[busy,setBusy]=useState(false);
  const[msg,setMsg]=useState("");

  async function refresh(id:string){
    const[r,staff,rows,reqs,b]=await Promise.all([
      sb.from("game_runs").select("current_round").eq("id",id).single(),
      sb.from("game_run_staff").select("level").eq("run_id",id).eq("staff_role","ds").maybeSingle(),
      sb.from("game_run_players").select("player_id,player_name,role,strength,manager_trust,confidence,source_club").eq("run_id",id).eq("squad_status","accepted"),
      sb.from("game_ds_requests").select("*").eq("run_id",id).in("request_type",["outgoing","renewal"]).order("created_at",{ascending:false}),
      sb.from("game_transfer_budget").select("*").eq("run_id",id).maybeSingle()
    ]);
    const cur=Number(r.data?.current_round||0),level=Number(staff.data?.level||2);
    setRound(cur);setDsLevel(level);
    const base=(rows.data||[]) as any[];
    const ids=base.map(x=>x.player_id);
    const pd=ids.length?await sb.from("players").select("id,fvm_fc,quotazione_fc").in("id",ids):{data:[] as any[]};
    const values=new Map((pd.data||[]).map((p:any)=>[p.id,Number(p.fvm_fc||p.quotazione_fc||10)]));
    const sq=base.map(x=>({...x,value:values.get(x.player_id)||10})) as SquadPlayer[];
    setSquad(sq);if(!selected&&sq[0])setSelected(sq[0].player_id);

    let bud=b.data as Budget|null;
    if(!bud){const ins=await sb.from("game_transfer_budget").insert({run_id:id,budget_total:120,budget_spent:0,transfer_revenue:0,wage_capacity:100,wage_committed:0}).select().single();bud=ins.data as any}

    const currentContracts=await sb.from("game_player_contracts").select("*").eq("run_id",id);
    const existing=new Set((currentContracts.data||[]).map((c:any)=>c.player_id));
    const missing=sq.filter(p=>!existing.has(p.player_id));
    if(missing.length){await sb.from("game_player_contracts").insert(missing.map(p=>({run_id:id,player_id:p.player_id,player_name:p.player_name,contract_until_season:1+(hash(id+p.player_id)%3),wage_value:Math.max(2,Math.round(p.value/7)),renewal_priority:"none",renewal_status:"under_contract"})))}

    let list=(reqs.data||[]) as DsReq[];
    for(const q of list){
      if(q.status!=="working"||q.resolution_round==null||cur<q.resolution_round)continue;
      const p=sq.find(x=>x.player_id===q.target_player_id);if(!p)continue;
      if(q.request_type==="outgoing"){
        const baseOffer=Math.max(4,Math.round(p.value*(.72+(hash(q.id)%42)/100)));
        const urgency=q.manager_instruction==="sell"?12:q.manager_instruction==="important_only"?-12:0;
        const score=42+level*10+urgency+(hash(q.id+"offer")%31-15);
        if(score>=48){
          const amount=Math.max(3,baseOffer+(level-3)*2);
          const message=`Ho trovato interesse concreto per ${p.player_name}. L'offerta che considero presentabile vale ${amount} crediti. Se per te può partire, autorizzami alla cessione.`;
          await sb.from("game_ds_requests").update({status:"offer_received",proposed_amount:amount,outcome:{type:"offer_received",amount},ds_message:message}).eq("id",q.id);
          Object.assign(q,{status:"offer_received",proposed_amount:amount,outcome:{type:"offer_received",amount},ds_message:message});
        }else{
          const message=`Per ${p.player_name} non ho trovato una proposta che valga la pena portarti. Continuerei a tenerlo salvo nuove opportunità.`;
          await sb.from("game_ds_requests").update({status:"no_offer",outcome:{type:"no_offer"},ds_message:message}).eq("id",q.id);
          Object.assign(q,{status:"no_offer",outcome:{type:"no_offer"},ds_message:message});
        }
      }else{
        const c=(currentContracts.data||[]).find((x:any)=>x.player_id===p.player_id);
        const wage=Number(c?.wage_value||Math.max(2,Math.round(p.value/7)));
        const score=44+level*9+(q.manager_instruction==="keep_priority"?10:0)+(hash(q.id+"renew")%35-17);
        if(score>=58){
          const newWage=Math.max(wage,wage+Math.max(1,Math.round(p.value/20)));
          const message=`Ho trovato l'intesa per trattenere ${p.player_name}. Il rinnovo è sostenibile e l'ho chiuso per il progetto.`;
          await sb.from("game_player_contracts").update({contract_until_season:Number(c?.contract_until_season||1)+2,wage_value:newWage,renewal_status:"renewed",renewal_priority:"keep",updated_at:new Date().toISOString()}).eq("run_id",id).eq("player_id",p.player_id);
          await sb.from("game_ds_requests").update({status:"renewed",proposed_wage:newWage,outcome:{type:"renewed",wage:newWage},ds_message:message}).eq("id",q.id);
          Object.assign(q,{status:"renewed",proposed_wage:newWage,outcome:{type:"renewed",wage:newWage},ds_message:message});
        }else if(score>=42){
          const ask=wage+Math.max(2,Math.round(p.value/14));
          const message=`${p.player_name} è disposto a restare, ma la richiesta economica è salita. Posso insistere, però il rinnovo diventerebbe più pesante.`;
          await sb.from("game_ds_requests").update({status:"renewal_difficult",proposed_wage:ask,outcome:{type:"renewal_difficult",wage:ask},ds_message:message}).eq("id",q.id);
          Object.assign(q,{status:"renewal_difficult",proposed_wage:ask,outcome:{type:"renewal_difficult",wage:ask},ds_message:message});
        }else{
          const message=`Al momento ${p.player_name} non mi dà margini credibili per il rinnovo. Ti consiglio di prepararci anche allo scenario di uscita.`;
          await sb.from("game_player_contracts").update({renewal_status:"at_risk",renewal_priority:"keep"}).eq("run_id",id).eq("player_id",p.player_id);
          await sb.from("game_ds_requests").update({status:"renewal_failed",outcome:{type:"renewal_failed"},ds_message:message}).eq("id",q.id);
          Object.assign(q,{status:"renewal_failed",outcome:{type:"renewal_failed"},ds_message:message});
        }
      }
    }

    const cc=await sb.from("game_player_contracts").select("player_id,player_name,contract_until_season,wage_value,renewal_priority,renewal_status").eq("run_id",id);
    setContracts((cc.data||[]) as Contract[]);setRequests([...list]);setBudget(bud);
  }

  useEffect(()=>{const q=new URLSearchParams(location.search);let id=q.get("run")||"";if(!id){const k=Object.keys(localStorage).find(x=>x.startsWith("fm_run_"));id=k?localStorage.getItem(k)||"":""}setRun(id);if(id)refresh(id)},[]);

  const player=useMemo(()=>squad.find(p=>p.player_id===selected)||null,[squad,selected]);
  const available=budget?budget.budget_total+budget.transfer_revenue-budget.budget_spent:0;

  async function sendOutgoing(){if(!run||!player||busy)return;setBusy(true);const target=Math.min(38,round+(instruction==="sell"?1:2));const ins=await sb.from("game_ds_requests").insert({run_id:run,round,request_type:"outgoing",player_role:player.role,target_player_id:player.player_id,target_player_name:player.player_name,manager_instruction:instruction,priority:instruction==="sell"?"high":"normal",budget_profile:"balanced",experience_profile:"balanced",tactical_profile:"balanced",ds_level:dsLevel,status:"working",resolution_round:target,ds_message:`Ricevuto. Mi muovo su ${player.player_name} secondo l'indicazione del mister e ti porto solo proposte che abbia senso valutare.`}).select().single();if(ins.data){setRequests(xs=>[ins.data as DsReq,...xs]);setMsg(`Indicazione inviata al DS per ${player.player_name}.`)}setBusy(false)}

  async function requestRenewal(){if(!run||!player||busy)return;setBusy(true);const target=Math.min(38,round+2);const ins=await sb.from("game_ds_requests").insert({run_id:run,round,request_type:"renewal",player_role:player.role,target_player_id:player.player_id,target_player_name:player.player_name,manager_instruction:"keep_priority",priority:"high",budget_profile:"balanced",experience_profile:"balanced",tactical_profile:"balanced",ds_level:dsLevel,status:"working",resolution_round:target,ds_message:`Chiaro: ${player.player_name} è importante per il progetto. Apro il dossier rinnovo e provo a trattenerlo.`}).select().single();if(ins.data){await sb.from("game_player_contracts").update({renewal_priority:"keep",renewal_status:"negotiating"}).eq("run_id",run).eq("player_id",player.player_id);setRequests(xs=>[ins.data as DsReq,...xs]);setMsg(`Hai chiesto al DS di provare a trattenere ${player.player_name}.`)}setBusy(false)}

  async function approveSale(q:DsReq){if(!run||busy||!q.target_player_id)return;setBusy(true);const amount=Number(q.proposed_amount||0);await sb.from("game_run_players").update({squad_status:"sold",decided_at:new Date().toISOString()}).eq("run_id",run).eq("player_id",q.target_player_id);await sb.from("game_transfer_ledger").insert({run_id:run,request_id:q.id,player_id:q.target_player_id,player_name:q.target_player_name||"Giocatore",operation_type:"sale",amount,round});await sb.from("game_transfer_budget").update({transfer_revenue:Number(budget?.transfer_revenue||0)+amount,updated_at:new Date().toISOString()}).eq("run_id",run);await sb.from("game_ds_requests").update({status:"sale_completed",final_outcome:{type:"sale_completed",amount},ds_message:`Cessione completata. ${q.target_player_name} lascia il club per ${amount} crediti.`}).eq("id",q.id);setMsg(`Il DS ha completato la cessione di ${q.target_player_name}.`);await refresh(run);setBusy(false)}

  async function rejectSale(q:DsReq){if(busy)return;setBusy(true);await sb.from("game_ds_requests").update({status:"offer_rejected",ds_message:`Ricevuto. Ho rifiutato la proposta per ${q.target_player_name}: resta nel progetto tecnico.`}).eq("id",q.id);setRequests(xs=>xs.map(x=>x.id===q.id?{...x,status:"offer_rejected",ds_message:`Ricevuto. Ho rifiutato la proposta per ${q.target_player_name}: resta nel progetto tecnico.`}:x));setBusy(false)}

  return <section className={styles.wrap}>
    <div className={styles.head}><div><p>GESTIONE ROSA // DELEGA AL DS</p><h2>Mercato e rinnovi.</h2><span>Tu stabilisci chi è importante e chi può partire. Il DS cerca offerte, tratta e ti riporta gli esiti.</span></div><div className={styles.budget}><small>BUDGET DISPONIBILE</small><strong>{available}</strong><span>Base {budget?.budget_total||0} · Entrate {budget?.transfer_revenue||0} · Speso {budget?.budget_spent||0}</span></div></div>
    {msg&&<div className={styles.notice}>{msg}</div>}
    <div className={styles.grid}>
      <div className={styles.control}>
        <label>GIOCATORE DELLA ROSA</label><select value={selected} onChange={e=>setSelected(e.target.value)}>{squad.map(p=><option key={p.player_id} value={p.player_id}>{p.player_name} · {p.role}</option>)}</select>
        {player&&<div className={styles.playerLine}><strong>{player.player_name}</strong><span>Valore interno {player.value} · Fiducia {player.manager_trust??50}</span></div>}
        <label>INDICAZIONE IN USCITA</label><select value={instruction} onChange={e=>setInstruction(e.target.value)}><option value="listen">Ascolta eventuali offerte</option><option value="sell">Prova a cederlo</option><option value="important_only">Solo offerta importante</option></select>
        <button disabled={busy||!player} onClick={sendOutgoing}>DAI INDICAZIONE AL DS</button>
        <button className={styles.secondary} disabled={busy||!player} onClick={requestRenewal}>PROVA A TRATTENERLO / RINNOVO</button>
        {player&&contracts.find(c=>c.player_id===player.player_id)&&<div className={styles.contract}>Contratto: stagione {contracts.find(c=>c.player_id===player.player_id)?.contract_until_season} · costo {contracts.find(c=>c.player_id===player.player_id)?.wage_value} · {contracts.find(c=>c.player_id===player.player_id)?.renewal_status}</div>}
      </div>
      <div className={styles.feed}>{requests.length===0?<div className={styles.empty}>Nessuna pratica in uscita o rinnovo aperta.</div>:requests.map(q=><article key={q.id}><div className={styles.row}><b>{q.request_type==="outgoing"?"USCITA":"RINNOVO"} · {q.target_player_name}</b><span>{q.status.replaceAll("_"," ").toUpperCase()}</span></div><p>{q.ds_message}</p>{q.status==="working"&&q.resolution_round!=null&&<small>Aggiornamento previsto: giornata {q.resolution_round}</small>}{q.status==="offer_received"&&<div className={styles.actions}><button disabled={busy} onClick={()=>approveSale(q)}>AUTORIZZA CESSIONE</button><button disabled={busy} className={styles.secondary} onClick={()=>rejectSale(q)}>PER ME RESTA</button></div>}</article>)}</div>
    </div>
  </section>
}
