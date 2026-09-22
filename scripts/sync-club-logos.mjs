import {cp,mkdir,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
const src=path.join(process.cwd(),'app','assets','512x512');
const dst=path.join(process.cwd(),'public','assets','clubs');
const wanted={
  'atalanta.football-logos.cc.png':'atalanta.png',
  'bologna.football-logos.cc.png':'bologna.png',
  'cagliari.football-logos.cc.png':'cagliari.png',
  'como-1907.football-logos.cc.png':'como.png',
  'fiorentina.football-logos.cc.png':'fiorentina.png',
  'frosinone.football-logos.cc.png':'frosinone.png',
  'genoa.football-logos.cc.png':'genoa.png',
  'inter.football-logos.cc.png':'inter.png',
  'juventus.football-logos.cc.png':'juventus.png',
  'lazio.football-logos.cc.png':'lazio.png',
  'lecce.football-logos.cc.png':'lecce.png',
  'milan.football-logos.cc.png':'milan.png',
  'monza.football-logos.cc.png':'monza.png',
  'napoli.football-logos.cc.png':'napoli.png',
  'parma.football-logos.cc.png':'parma.png',
  'roma.football-logos.cc.png':'roma.png',
  'sassuolo.football-logos.cc.png':'sassuolo.png',
  'torino.football-logos.cc.png':'torino.png',
  'udinese.football-logos.cc.png':'udinese.png',
  'venezia.football-logos.cc.png':'venezia.png'
};
try{
  await stat(src);await mkdir(dst,{recursive:true});
  const files=await readdir(src);
  for(const f of files){if(wanted[f])await cp(path.join(src,f),path.join(dst,wanted[f]),{force:true})}
  console.log('Club logos synced to public/assets/clubs');
}catch(err){console.warn('Club logo sync skipped:',err?.message||err)}
