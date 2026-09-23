#!/usr/bin/env python3
import argparse, csv, re, shutil, unicodedata
from collections import defaultdict
from pathlib import Path

IMAGE_EXTS={".png",".jpg",".jpeg",".webp"}

def safe_name(value):
    value=unicodedata.normalize("NFKD", str(value or ""))
    value="".join(ch for ch in value if not unicodedata.combining(ch)).upper()
    return re.sub(r"[^A-Z0-9]+","_",value).strip("_")

def scan_by_fm_id(root):
    by_numeric=defaultdict(list)
    count=0
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in IMAGE_EXTS:
            continue
        count+=1
        for token in re.findall(r"\d{5,}", p.stem):
            by_numeric[token].append(p)
    return count,by_numeric

def unique(items):
    seen=set(); out=[]
    for p in items:
        s=str(p)
        if s not in seen:
            seen.add(s);out.append(p)
    return out

def main():
    ap=argparse.ArgumentParser(description="Estrae le foto mancanti usando ESCLUSIVAMENTE gli Unique ID Football Manager verificati.")
    ap.add_argument("source_dir",help="Cartella radice del facepack/database foto")
    ap.add_argument("--missing-csv",default="missing_current.csv")
    ap.add_argument("--output",default="fantamanager-missing-faces")
    args=ap.parse_args()

    source=Path(args.source_dir).expanduser().resolve()
    missing_csv=Path(args.missing_csv).expanduser().resolve()
    output=Path(args.output).expanduser().resolve()
    reports=output/"_reports"
    reports.mkdir(parents=True,exist_ok=True)

    count,by_numeric=scan_by_fm_id(source)
    print(f"Indicizzati {count} file immagine per Unique ID FM.")

    rows=list(csv.DictReader(missing_csv.open(newline="",encoding="utf-8-sig")))
    found=[];missing=[];ambiguous=[];unmapped=[]

    for r in rows:
        pid=(r.get("player_id") or "").strip()
        name=(r.get("player_name") or "").strip()
        team=(r.get("team") or "UNKNOWN").strip().upper()
        fm=(r.get("fm_id") or "").strip()

        if not fm:
            unmapped.append({**r,"status":"fm_id_required","source_path":"","target_path":"","match_method":""})
            continue

        candidates=unique(by_numeric.get(fm,[]))
        if len(candidates)==1:
            src=candidates[0]
            dst_dir=output/team;dst_dir.mkdir(parents=True,exist_ok=True)
            dst=dst_dir/f"{pid}__{safe_name(name)}{src.suffix.lower()}"
            shutil.copy2(src,dst)
            found.append({**r,"status":"found","source_path":str(src),"target_path":str(dst),"match_method":"fm_unique_id"})
        elif len(candidates)>1:
            ambiguous.append({**r,"status":"duplicate_fm_id","source_path":" | ".join(map(str,candidates[:50])),"target_path":"","match_method":"fm_unique_id"})
        else:
            missing.append({**r,"status":"fm_id_not_in_facepack","source_path":"","target_path":"","match_method":"fm_unique_id"})

    fields=["team","player_id","player_name","role","fantacalcio_pid","fm_id","fm_status","face_file","status","source_path","target_path","match_method"]
    def write(name,data):
        with (reports/name).open("w",newline="",encoding="utf-8") as f:
            w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore");w.writeheader();w.writerows(data)

    write("found.csv",found)
    write("missing_in_facepack.csv",missing)
    write("duplicate_fm_id.csv",ambiguous)
    write("needs_fm_id.csv",unmapped)
    (reports/"summary.txt").write_text(
        f"Richiesti: {len(rows)}\nFM ID da mappare: {len(unmapped)}\nTrovati: {len(found)}\nFM ID non presenti nel facepack: {len(missing)}\nID duplicati: {len(ambiguous)}\n",
        encoding="utf-8"
    )
    print(f"FM ID da mappare: {len(unmapped)} | trovati: {len(found)} | non nel facepack: {len(missing)} | duplicati: {len(ambiguous)}")
    print(f"Output: {output}")

if __name__=="__main__":
    main()
