export type Fixture={home_code:string;away_code:string};
export type CpuResult=Fixture&{home_goals:number;away_goals:number;is_user_match:boolean};
export type Starter={player_id:string;player_name:string;role:string;confidence:number;strength?:number|null};
export type MatchEvent={minute:number;type:string;side:'user'|'opp';player?:Starter|null;desc:string};

export function seeded(seed:string){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>((h=Math.imul(h^(h>>>15),2246822519))>>>0)/4294967296}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
function poisson(lambda:number,rnd:()=>number){const L=Math.exp(-lambda);let p=1,k=0;do{k++;p*=Math.max(.000001,rnd())}while(p>L&&k<9);return clamp(k-1,0,6)}

export function confidenceFactor(confidence:number){return 1+clamp((confidence-50)/50,-1,1)*.06}

export function clubStrength(rows:{team_nfl:string|null;fvm_fc:number|null;quotazione_fc:number|null}[]){
 const by:Record<string,number[]>={};
 for(const p of rows){if(!p.team_nfl)continue;(by[p.team_nfl]??=[]).push(Number(p.fvm_fc||p.quotazione_fc||1))}
 const out:Record<string,number>={};
 for(const [club,vals] of Object.entries(by)){vals.sort((a,b)=>b-a);const xi=vals.slice(0,11);out[club]=xi.length?xi.reduce((a,b)=>a+b,0)/xi.length:1}
 return out;
}

export function simulateCpuFixture(run:string,round:number,f:Fixture,strength:Record<string,number>):CpuResult{
 const rnd=seeded(`${run}|g${round}|${f.home_code}|${f.away_code}`),h=strength[f.home_code]||50,a=strength[f.away_code]||50;
 const diff=clamp((h-a)/Math.max(30,(h+a)/2),-.45,.45);
 const hg=poisson(clamp(1.35+.55*diff+.16,0.45,2.35),rnd),ag=poisson(clamp(1.20-.55*diff,0.35,2.20),rnd);
 return{...f,home_goals:hg,away_goals:ag,is_user_match:false};
}

export function buildPlayerStats(run:string,round:number,starters:Starter[],events:MatchEvent[]){
 const rnd=seeded(`${run}|g${round}|player-stats`);
 return starters.map(p=>{
  const pe=events.filter(e=>e.side==='user'&&e.player?.player_id===p.player_id),goals=pe.filter(e=>e.type==='goal').length,chances=pe.filter(e=>e.type==='chance').length;
  const roleBase=p.role==='P'?{rec:1,duel:2,prog:0}:p.role==='D'?{rec:5,duel:6,prog:2}:p.role==='C'?{rec:5,duel:5,prog:5}:{rec:2,duel:3,prog:4};
  const cf=confidenceFactor(p.confidence),recoveries=Math.max(0,Math.round((roleBase.rec+rnd()*4)*cf)),duels=Math.max(0,Math.round((roleBase.duel+rnd()*5)*cf)),progressions=Math.max(0,Math.round((roleBase.prog+rnd()*5)*cf));
  const dangerous_errors=rnd()<(p.confidence<35?.12:.045)?1:0;
  const activity=goals*1.05+chances*.18+recoveries*.035+duels*.025+progressions*.035-dangerous_errors*.65;
  const rating=clamp(5.55+activity+(rnd()-.5)*.55+(p.confidence-50)*.006,4.5,9.3);
  return{player_id:p.player_id,player_name:p.player_name,rating:Number(rating.toFixed(1)),goals,chances,recoveries,duels,progressions,dangerous_errors};
 })
}