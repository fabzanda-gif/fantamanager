import {cp,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
const src=path.join(process.cwd(),'app','assets','players');
const dst=path.join(process.cwd(),'public','assets','players');
try{await stat(src);await mkdir(path.dirname(dst),{recursive:true});await cp(src,dst,{recursive:true,force:true});console.log('Player faces synced to public/assets/players');}
catch(err){console.warn('Player face sync skipped:',err?.message||err)}
