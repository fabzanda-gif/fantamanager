export type PlayerFace={club:string;file:string};
export const PLAYER_FACES:Record<string,PlayerFace>={
"a21d277e-cc82-46eb-840a-4310bf01b266":{club:"cagliari",file:"fm_13227290__FADERA.png"},
"47bec44d-c12e-4be5-a5f8-da6d800a4313":{club:"cagliari",file:"fm_45111317__SUGAWARA.png"},
"167283e8-1295-4e02-8b35-2c6c988050d3":{club:"cagliari",file:"fm_83115694__ZÈ_PEDRO.png"},
"4722d0a5-edac-4e5f-959e-bbf03a972c4a":{club:"como",file:"fm_2000312673__RODRIGUEZ.png"},
"d7bd0748-37f6-4ead-b67c-a943c7f10154":{club:"fiorentina",file:"fm_2000128983__NJIE.png"},
"f6405fd8-494a-456c-be7a-124566eda398":{club:"juventus",file:"fm_12080051__SARR.png"},
"f1756a14-f96a-429b-9336-84f3ffa82543":{club:"lecce",file:"fm_62201068__ILIC.png"},
"b469215a-2dec-4862-bca5-63c745b8bc3f":{club:"monza",file:"fm_91167629__TOURÉ.png"},
"0fe6c8f2-f860-47c2-a5bf-a7c7d74cc766":{club:"monza",file:"fm_2000186695__ZIOLKOWSKI.png"},
"cd7866b6-4ca9-4e6c-8665-df1582c1fd74":{club:"sassuolo",file:"fm_18111492__LEYSEN.png"}
};
const CLUB_DIR:Record<string,string>={ATA:"atalanta",BOL:"bologna",CAG:"cagliari",COM:"como",FIO:"fiorentina",FRO:"frosinone",GEN:"genoa",INT:"inter",JUV:"juventus",LAZ:"lazio",LEC:"lecce",MIL:"milan",MON:"monza",NAP:"napoli",PAR:"parma",ROM:"roma",SAS:"sassuolo",TOR:"torino",UDI:"udinese",VEN:"venezia"};
export function playerFace(id:string,sourceClub:string,name:string){const exact=PLAYER_FACES[id];if(exact)return "/_next/static/media/"+exact.file;const club=CLUB_DIR[sourceClub]||sourceClub.toLowerCase();const clean=name.toUpperCase().replace(/[^A-ZÀ-ÖØ-Ý0-9]+/g,"_").replace(/^_|_$/g,"");return {club,file:id+"__"+clean+".png"}}
