"use client";
import Link from "next/link";
import DsSquadManagement from "../ds/DsSquadManagement";
import {useEffect,useState} from "react";

export default function GestioneRosaPage(){
  const[run,setRun]=useState("");
  useEffect(()=>{const q=new URLSearchParams(location.search);let id=q.get("run")||"";if(!id){const k=Object.keys(localStorage).find(x=>x.startsWith("fm_run_"));id=k?localStorage.getItem(k)||"":""}setRun(id)},[]);
  return <main style={{minHeight:"100vh",background:"#050a08",color:"#eef5f2",padding:"18px"}}>
    <div style={{maxWidth:1420,margin:"0 auto 8px"}}><Link href={"/ds?run="+run} style={{color:"#24e39a",fontSize:12,fontWeight:800,textDecoration:"none"}}>← DIREZIONE SPORTIVA</Link></div>
    <DsSquadManagement/>
  </main>
}
