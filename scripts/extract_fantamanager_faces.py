#!/usr/bin/env python3
import argparse,csv,shutil
from pathlib import Path
def main():
 p=argparse.ArgumentParser(description="Estrae dal facepack FM solo i giocatori FantaManager verificati.");p.add_argument("faces_dir");p.add_argument("mapping_csv");p.add_argument("output_dir",nargs="?",default="fantamanager-faces");a=p.parse_args()
 faces=Path(a.faces_dir).expanduser().resolve();out=Path(a.output_dir).expanduser().resolve();reports=out/"_reports";reports.mkdir(parents=True,exist_ok=True);copied=[];missing=[];review=[]
 with Path(a.mapping_csv).expanduser().resolve().open(newline="",encoding="utf-8-sig") as f:
  for r in csv.DictReader(f):
   fm=(r.get("fm_id") or "").strip()
   if not fm or (r.get("status") or "").strip().lower()!="verified":review.append(r);continue
   src=faces/(r.get("face_file") or f"face_{fm}.png")
   if not src.is_file():missing.append({**r,"expected_file":str(src)});continue
   team=out/(r.get("club") or "UNKNOWN").strip().upper();team.mkdir(parents=True,exist_ok=True);name="".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in (r.get("name") or "").upper()).strip("_");dst=team/f"{r['player_id']}__{name}{src.suffix.lower()}";shutil.copy2(src,dst);copied.append({**r,"output_file":str(dst)})
 def w(n,data):
  path=reports/n;fields=list(dict.fromkeys(k for r in data for k in r))
  with path.open("w",newline="",encoding="utf-8") as f:
   if fields:x=csv.DictWriter(f,fieldnames=fields);x.writeheader();x.writerows(data)
 w("copied.csv",copied);w("missing_file.csv",missing);w("needs_review.csv",review);(reports/"summary.txt").write_text(f"Copiate: {len(copied)}\nFile mancanti: {len(missing)}\nDa mappare/verificare: {len(review)}\n",encoding="utf-8");print(f"Copiate: {len(copied)} | File mancanti: {len(missing)} | Da mappare/verificare: {len(review)}")
if __name__=="__main__":main()
