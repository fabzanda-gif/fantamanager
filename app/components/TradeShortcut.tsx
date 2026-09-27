"use client";
import Link from"next/link";import{ArrowLeftRight}from"lucide-react";import{usePathname,useSearchParams}from"next/navigation";import styles from"./TradeShortcut.module.css";
export default function TradeShortcut(){const path=usePathname(),q=useSearchParams(),run=q.get("run")||"";if(path!=="/rosa"||!run)return null;return <Link className={styles.shortcut} href={"/scambi?run="+run}><ArrowLeftRight size={15}/><span>SCAMBI</span></Link>}
