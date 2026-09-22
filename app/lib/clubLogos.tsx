export const CLUB_LOGOS: Record<string,string> = {
  ATA:"/assets/clubs/atalanta.png",
  BOL:"/assets/clubs/bologna.png",
  CAG:"/assets/clubs/cagliari.png",
  COM:"/assets/clubs/como.png",
  FIO:"/assets/clubs/fiorentina.png",
  FRO:"/assets/clubs/frosinone.png",
  GEN:"/assets/clubs/genoa.png",
  INT:"/assets/clubs/inter.png",
  JUV:"/assets/clubs/juventus.png",
  LAZ:"/assets/clubs/lazio.png",
  LEC:"/assets/clubs/lecce.png",
  MIL:"/assets/clubs/milan.png",
  MON:"/assets/clubs/monza.png",
  NAP:"/assets/clubs/napoli.png",
  PAR:"/assets/clubs/parma.png",
  ROM:"/assets/clubs/roma.png",
  SAS:"/assets/clubs/sassuolo.png",
  TOR:"/assets/clubs/torino.png",
  UDI:"/assets/clubs/udinese.png",
  VEN:"/assets/clubs/venezia.png",
};

export function ClubLogo({code,className=""}:{code:string;className?:string}){
  const src=CLUB_LOGOS[code];
  return src?<img className={className} src={src} alt={code+" logo"}/>:null;
}
