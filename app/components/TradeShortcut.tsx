"use client";
import Link from"next/link";
import{ArrowLeftRight}from"lucide-react";
import{usePathname}from"next/navigation";
import{useEffect,useState}from"react";
import styles from"./TradeShortcut.module.css";

export default function TradeShortcut(){
  const path=usePathname();
  const[run,setRun]=useState("");

  useEffect(()=>{
    setRun(new URLSearchParams(window.location.search).get("run")||"");
  },[path]);

  if(path!=="/rosa"||!run)return null;
  return <Link className={styles.shortcut} href={"/scambi?run="+run}><ArrowLeftRight size={15}/><span>SCAMBI</span></Link>;
}
