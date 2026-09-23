#!/usr/bin/env python3
import argparse, csv
from pathlib import Path

REGISTRY_FIELDS=["player_id","name","club","fm_id","status","role","fantacalcio_pid","face_file","source"]

def read_rows(path):
    with Path(path).open(newline="",encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def main():
    ap=argparse.ArgumentParser(description="Merge verified player/FM mappings into the permanent registry.")
    ap.add_argument("input_csv",help="CSV with team,player_id,player_name,role,fantacalcio_pid,fm_id,fm_status,face_file")
    ap.add_argument("--registry",default="data/player-faces/player_fm_registry.csv")
    ap.add_argument("--source",default="verified_import")
    args=ap.parse_args()

    registry=Path(args.registry)
    current=read_rows(registry) if registry.exists() else []
    by_key={}
    for r in current:
        key=(r.get("player_id") or "").strip() or "external:"+(r.get("fm_id") or "").strip()
        if key:
            by_key[key]=r

    added=updated=0
    for r in read_rows(args.input_csv):
        pid=(r.get("player_id") or "").strip()
        fm=(r.get("fm_id") or "").strip()
        if not fm:
            continue
        key=pid or "external:"+fm
        row={
            "player_id":pid,
            "name":(r.get("player_name") or r.get("name") or "").strip(),
            "club":(r.get("team") or r.get("club") or "").strip(),
            "fm_id":fm,
            "status":(r.get("fm_status") or r.get("status") or "verified").strip(),
            "role":(r.get("role") or "").strip(),
            "fantacalcio_pid":(r.get("fantacalcio_pid") or "").strip(),
            "face_file":(r.get("face_file") or f"face_{fm}.png").strip(),
            "source":args.source,
        }
        if key in by_key:
            updated+=1
        else:
            added+=1
        by_key[key]=row

    rows=sorted(by_key.values(),key=lambda r:((r.get("club") or ""),(r.get("name") or "")))
    registry.parent.mkdir(parents=True,exist_ok=True)
    with registry.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=REGISTRY_FIELDS)
        w.writeheader();w.writerows(rows)

    print(f"Registry: {registry}")
    print(f"Aggiunti: {added} | aggiornati: {updated} | totale: {len(rows)}")

if __name__=="__main__":
    main()
