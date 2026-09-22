import {cp,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
const src=path.join(process.cwd(),'app','assets','audio');
const dst=path.join(process.cwd(),'public','assets','audio');
try{await stat(src);await mkdir(path.dirname(dst),{recursive:true});await cp(src,dst,{recursive:true,force:true});console.log('Audio synced to public/assets/audio');}
catch(err){console.warn('Audio sync skipped:',err?.message||err)}
