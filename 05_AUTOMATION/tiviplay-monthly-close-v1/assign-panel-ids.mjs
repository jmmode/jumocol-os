/**
 * Conciliación de ID técnicos: BASE GENERAL!M <- PANELES.Id
 * Dry-run por defecto. Requiere operador autenticado, respaldo y APPLY explícito.
 * No lee/escribe contraseñas (BASE O, export Password), ni cambia fechas o pagos.
 * Usage: PANEL_XLSX=/private/PANELES_CORTE_01_11_26.xlsx TIVIPLAY_SPREADSHEET_ID=... node assign-panel-ids.mjs
 * To apply: TIVIPLAY_APPLY_IDS=YES and TIVIPLAY_BACKUP_ACK=YES.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { GoogleAuth } from "google-auth-library";
import XLSX from "xlsx";

const sid = process.env.TIVIPLAY_SPREADSHEET_ID;
const file = process.env.PANEL_XLSX;
if (!sid || !file || !fs.existsSync(file)) throw Error("TIVIPLAY_SPREADSHEET_ID and PANEL_XLSX required");
const out = process.env.TIVIPLAY_ID_REPORT ?? "./id-reconciliation-report.json";
const norm = v => String(v ?? "").trim().toUpperCase();
const wb = XLSX.readFile(file, {cellDates:false});
const candidates = [];
for (const sheet of wb.SheetNames) {
  const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet],{header:1,defval:""});
  for(let i=0;i<data.length;i++) {
    const r=data[i];
    if(norm(r[2])==="USERNAME" && norm(r[1])==="ID") continue;
    const id=String(r[1]??"").trim(), user=norm(r[2]);
    // XLSX exports with a leading serial/index column, ID in B and username C.
    if(/^\d+$/.test(id) && user) candidates.push({id,user,sourceSheet:sheet});
  }
}
const auth=new GoogleAuth({scopes:["https://www.googleapis.com/auth/spreadsheets"]});
const client=await auth.getClient();
const token=await client.getAccessToken();
if(!token?.token)throw Error("Google auth unavailable");
const headers={Authorization:`Bearer ${token.token}`};
const baseUrl=`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sid)}`;
const a1="'BASE GENERAL'!A3:N870";
const source=await fetch(`${baseUrl}/values/${encodeURIComponent(a1)}?valueRenderOption=FORMATTED_VALUE`,{headers});
if(!source.ok)throw Error(`BASE read ${source.status}`);
const base=(await source.json()).values??[];
const byUser=new Map(), byId=new Map();
for(const x of candidates){
  if(!byUser.has(x.user))byUser.set(x.user,new Map());
  byUser.get(x.user).set(x.id,x);
  if(!byId.has(x.id))byId.set(x.id,new Set());
  byId.get(x.id).add(x.user);
}
const counts=new Map(),records=[];
for(let i=0;i<base.length;i++){
  const r=base[i]??[],tc=String(r[0]??"").trim(),name=String(r[1]??"").trim();
  if(!name||!(tc==="0"||tc==="1"))continue;
  const user=norm(r[13]);
  if(user)counts.set(user,(counts.get(user)||0)+1);
  records.push({row:i+3,user,existingId:String(r[12]??"").trim()});
}
const updates=[],exceptions=[];
for(const r of records){
  const hits=byUser.get(r.user), ids=hits?[...hits.keys()]:[];
  let reason="";
  if(!r.user)reason="SIN_USUARIO";
  else if(!ids.length)reason="SIN_ID_PANEL";
  else if(ids.length!==1)reason="MULTIPLES_IDS_PANEL";
  else if(counts.get(r.user)!==1)reason="DUPLICADO_USUARIO_BASE";
  else if(byId.get(ids[0]).size!==1)reason="ID_COMPARTIDO_PANEL";
  else if(r.existingId&&r.existingId!==ids[0])reason="ID_CONFLICTO";
  else if(!r.existingId)updates.push({row:r.row,id:ids[0]});
  if(reason)exceptions.push({row:r.row,reason});
}
const snapshotHash=crypto.createHash("sha256").update(JSON.stringify(base)).digest("hex");
let written=0;
const apply=process.env.TIVIPLAY_APPLY_IDS==="YES";
if(apply){
  if(process.env.TIVIPLAY_BACKUP_ACK!=="YES")throw Error("Backup acknowledgement required");
  // Verify source stability immediately before write.
  const re=await fetch(`${baseUrl}/values/${encodeURIComponent(a1)}?valueRenderOption=FORMATTED_VALUE`,{headers});
  if(!re.ok)throw Error(`Readback ${re.status}`);
  if(crypto.createHash("sha256").update(JSON.stringify((await re.json()).values??[])).digest("hex")!==snapshotHash)throw Error("SOURCE_DRIFT_ABORT");
  // Batch atomic sparse updates; no other columns touched.
  for(let start=0;start<updates.length;start+=150){
    const chunk=updates.slice(start,start+150);
    const body={requests:chunk.map(({row,id})=>({updateCells:{range:{sheetId:1013112049,startRowIndex:row-1,endRowIndex:row,startColumnIndex:12,endColumnIndex:13},rows:[{values:[{userEnteredValue:{stringValue:id}}]}],fields:"userEnteredValue"}}))};
    const res=await fetch(`${baseUrl}:batchUpdate`,{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!res.ok)throw Error(`batchUpdate ${res.status}: ${(await res.text()).slice(0,300)}`);
    written+=chunk.length;
  }
}
const report={mode:apply?"APPLY":"DRY_RUN",source:"PANELES_CORTE_01_11_26.xlsx",snapshotHash,baseRows:records.length,panelRows:candidates.length,eligible:updates.length,written,exceptions,counts:Object.fromEntries(exceptions.reduce((m,x)=>(m.set(x.reason,(m.get(x.reason)||0)+1),m),new Map())),at:new Date().toISOString()};
fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log(JSON.stringify({mode:report.mode,eligible:report.eligible,written:report.written,exceptions:report.counts,report:out}));
