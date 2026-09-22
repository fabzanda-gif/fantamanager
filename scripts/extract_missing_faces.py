#!/usr/bin/env python3
import argparse, csv, re, shutil, unicodedata
from collections import defaultdict
from pathlib import Path

IMAGE_EXTS={".png",".jpg",".jpeg",".webp"}

def norm(value):
    value=unicodedata.normalize("NFKD", str(value or ""))
    value="".join(ch for ch in value if not unicodedata.combining(ch)).upper()
    return re.sub(r"[^A-Z0-9]+","",value)

def safe_name(value):
    value=unicodedata.normalize("NFKD", str(value or ""))
    value="".join(ch for ch in value if not unicodedata.combining(ch)).upper()
    return re.sub(r"[^A-Z0-9]+","_",value).strip("_")

def scan(root):
    files=[]
    by_stem=defaultdict(list)
    by_numeric=defaultdict(list)
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in IMAGE_EXTS:
            continue
        files.append(p)
        ns=norm(p.stem)
        by_stem[ns].append(p)
        for token in re.findall(r"\d{5,}", p.stem):
            by_numeric[token].append(p)
    return files,by_stem,by_numeric

def unique(items):
    seen=set(); out=[]
    for p in items:
        s=str(p)
        if s not in seen:
            seen.add(s);out.append(p)
    return out

def main():
    ap=argparse.ArgumentParser(description="Estrae SOLO le foto mancanti di 90 MINUTES/FantaManager, ordinate per squadra.")
    ap.add_argument("source_dir",help="Cartella radice del facepack/database foto (anche ~16 GB)")
    ap.add_argument("--missing-csv",default="data/player-faces/missing_current.csv")
    ap.add_argument("--output",default="fantamanager-missing-faces")
    args=ap.parse_args()

    source=Path(args.source_dir).expanduser().resolve()
    missing_csv=Path(args.missing_csv).expanduser().resolve()
    output=Path(args.output).expanduser().resolve()
    reports=output/"_reports"
    reports.mkdir(parents=True,exist_ok=True)

    files,by_stem,by_numeric=scan(source)
    print(f"Indicizzati {len(files)} file immagine. Nessun file immagine viene aperto.")

    rows=list(csv.DictReader(missing_csv.open(newline="",encoding="utf-8-sig")))
    found=[];missing=[];ambiguous=[]

    for r in rows:
        pid=(r.get("player_id") or "").strip()
        name=(r.get("player_name") or "").strip()
        team=(r.get("team") or "UNKNOWN").strip().upper()
        fm=(r.get("fm_id") or "").strip()
        nn=norm(name)
        candidates=[];method=""

        # 1) ID canonico nel filename
        for p in files:
            if pid and pid.lower() in p.stem.lower():
                candidates.append(p)
        if candidates: method="canonical_player_id"

        # 2) ID Football Manager verificato/storico
        if not candidates and fm:
            candidates=by_numeric.get(fm,[])
            if candidates: method="fm_id"

        # 3) Nome normalizzato + squadra presente nel path
        if not candidates and nn:
            named=[p for p in files if nn and nn in norm(p.stem)]
            team_named=[p for p in named if norm(team) in norm(str(p.parent)) or norm(team) in norm(str(p))]
            if team_named:
                candidates=team_named;method="normalized_name_team"
            elif len(named)==1:
                candidates=named;method="normalized_name_unique"

        candidates=unique(candidates)
        if len(candidates)==1:
            src=candidates[0]
            dst_dir=output/team;dst_dir.mkdir(parents=True,exist_ok=True)
            dst=dst_dir/f"{pid}__{safe_name(name)}{src.suffix.lower()}"
            shutil.copy2(src,dst)
            found.append({**r,"status":"found","source_path":str(src),"target_path":str(dst),"match_method":method})
        elif len(candidates)>1:
            ambiguous.append({**r,"status":"ambiguous","source_path":" | ".join(map(str,candidates[:20])),"target_path":"","match_method":method})
        else:
            missing.append({**r,"status":"missing","source_path":"","target_path":"","match_method":""})

    fields=["team","player_id","player_name","role","fantacalcio_pid","fm_id","fm_status","face_file","status","source_path","target_path","match_method"]
    def write(name,data):
        with (reports/name).open("w",newline="",encoding="utf-8") as f:
            w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore");w.writeheader();w.writerows(data)

    write("found.csv",found);write("missing.csv",missing);write("ambiguous.csv",ambiguous)
    (reports/"summary.txt").write_text(
        f"Richiesti: {len(rows)}\nTrovati: {len(found)}\nMancanti: {len(missing)}\nAmbigui: {len(ambiguous)}\n",
        encoding="utf-8"
    )
    print(f"Trovati {len(found)} / {len(rows)} | mancanti {len(missing)} | ambigui {len(ambiguous)}")
    print(f"Output: {output}")

if __name__=="__main__":
    main()
