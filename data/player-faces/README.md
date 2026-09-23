# Player face / Football Manager ID registry

`player_fm_registry.csv` is the permanent source of truth for mapping app players to Football Manager Unique IDs.

Columns:
- `player_id`: canonical app/Supabase player UUID. May be blank for a transfer identified before it exists in the app DB.
- `name`: player name as used by the app or verified external identity.
- `club`: current app club code when known.
- `fm_id`: Football Manager Unique ID.
- `status`: verification state.
- `role`: app role (P/D/C/A) when known.
- `fantacalcio_pid`: Fantacalcio player ID when available.
- `face_file`: canonical source filename convention.
- `source`: where the mapping came from.

Rules:
1. Never infer an FM ID from a player name alone.
2. Verify identity against Sortitoutsi / Football Manager data before marking it verified.
3. New transfer-window mappings are appended/updated here, not kept only in temporary extraction CSVs.
4. Temporary extraction files can be deleted after their verified mappings have been merged into this registry.
5. One FM ID may intentionally map to more than one app row when the app database contains duplicate identities; keep the status explicit.
