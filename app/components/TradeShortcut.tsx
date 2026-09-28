"use client";
import Link from"next/link";
import{BriefcaseBusiness,Users,WalletCards}from"lucide-react";
import{usePathname}from"next/navigation";
import{useEffect,useState}from"react";
import styles from"./TradeShortcut.module.css";

const SEASON_PATHS=new Set(["/stagione","/rosa","/calendario","/classifica","/statistiche-stagione","/vigilia","/prepara","/scambi","/staff","/ds","/gestione-rosa"]);

export default function TradeShortcut(){
  const path=usePathname();
  const[run,setRun]=useState("");

  useEffect(()=>{
    const q=new URLSearchParams(window.location.search).get("run")||"";
    if(q){setRun(q);return}
    const key=Object.keys(localStorage).find(k=>k.startsWith("fm_run_"));
    setRun(key?localStorage.getItem(key)||"":"");
  },[path]);

  if(!SEASON_PATHS.has(path)||!run)return null;
  return <div className={styles.stack}>
    <Link className={styles.shortcut} href={"/staff?run="+run}><Users size={15}/><span>STAFF</span></Link>
    <Link className={styles.shortcut} href={"/ds?run="+run}><BriefcaseBusiness size={15}/><span>DIREZIONE SPORTIVA</span></Link>
    <Link className={styles.shortcut} href={"/gestione-rosa?run="+run}><WalletCards size={15}/><span>GESTIONE ROSA</span></Link>
  </div>;
}
