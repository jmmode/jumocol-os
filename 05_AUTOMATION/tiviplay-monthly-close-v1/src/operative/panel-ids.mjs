// Conciliación de ID técnicos: BASE GENERAL (USUARIO + PANEL) ↔ PANELES (Username, Id, Owner, Expiration).
// Función pura. Solo localiza esas cuatro columnas del export por encabezado: Password nunca se lee.
// Asigna ID únicamente con correspondencia inequívoca; el resto queda como excepción para Back Office.

const clean = (v) => String(v ?? "").trim();
const canon = (v) => clean(v).toLocaleUpperCase("es").replace(/\s+/g, " ");

export const PANEL_FIELDS = Object.freeze({ id: ["ID"], user: ["USERNAME", "USUARIO"], owner: ["OWNER", "RESELLER"], expiration: ["EXPIRATION", "EXPIRA", "EXPIRY", "EXP DATE"] });

/** Fecha técnica del panel: serial de Excel, «2026-11-24 10:00:00», «24/11/2026» o «24-11-26». */
export function parsePanelDate(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = Math.round((value - 25569) * 86400000);
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = clean(value);
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

/** Lee las cuentas técnicas de cada hoja del export (filas crudas), localizando columnas por encabezado. */
export function readPanelAccounts(sheets) {
  const accounts = [];
  const unreadable = [];
  for (const { name, rows } of sheets) {
    let cols = null;
    let headerAt = -1;
    for (let i = 0; i < Math.min(rows.length, 30) && !cols; i++) {
      const h = (rows[i] ?? []).map(canon);
      const find = (aliases) => aliases.map((a) => h.indexOf(a)).find((x) => x >= 0);
      const c = Object.fromEntries(Object.entries(PANEL_FIELDS).map(([k, a]) => [k, find(a)]));
      if (c.id != null && c.user != null) [cols, headerAt] = [c, i];
    }
    if (!cols) {
      unreadable.push(name);
      continue;
    }
    for (let i = headerAt + 1; i < rows.length; i++) {
      const r = rows[i] ?? [];
      const id = clean(r[cols.id]);
      const user = canon(r[cols.user]);
      if (!id || !user) continue;
      accounts.push({
        id, user, sheet: name, row: i + 1,
        owner: cols.owner != null ? clean(r[cols.owner]) : "",
        expiration: cols.expiration != null ? parsePanelDate(r[cols.expiration]) : null,
      });
    }
  }
  return { accounts, unreadable };
}

/**
 * baseRecords: [{ n, user, panel, id }] de las fichas operativas (no históricas).
 * Devuelve Map<n, { id, reason, evidence, action, expiration, owner }> y conteos por motivo.
 */
export function reconcilePanelIds(baseRecords, accounts) {
  const byUser = new Map();
  const usersById = new Map();
  for (const a of accounts) {
    if (!byUser.has(a.user)) byUser.set(a.user, new Map());
    byUser.get(a.user).set(a.id, a);
    if (!usersById.has(a.id)) usersById.set(a.id, new Set());
    usersById.get(a.id).add(a.user);
  }
  const baseCount = new Map();
  for (const r of baseRecords) if (r.user) baseCount.set(canon(r.user), (baseCount.get(canon(r.user)) ?? 0) + 1);

  const result = new Map();
  const counts = {};
  for (const r of baseRecords) {
    const user = canon(r.user);
    const hits = user ? [...(byUser.get(user)?.values() ?? [])] : [];
    let out;
    if (!user) out = { reason: "SIN_USUARIO", evidence: "BASE sin USUARIO", action: "Registrar USUARIO en BASE GENERAL!N." };
    else if (!hits.length) out = { reason: "SIN_ID_PANEL", evidence: `USUARIO ${r.user} no aparece en el corte de paneles`, action: "Buscar la cuenta en el panel indicado en BASE (PANEL) y registrar su ID en BASE GENERAL!M, o confirmar baja." };
    else if (hits.length > 1) {
      const live = hits.map((h) => `Id ${h.id} (${h.owner || "s/owner"}, vence ${h.expiration ?? "s/f"})`).join(" · ");
      out = { reason: "MULTIPLES_IDS_PANEL", evidence: `USUARIO ${r.user}: ${live}`, action: "Elegir en el panel la cuenta vigente que cubre el ciclo comercial y registrar ese ID en BASE GENERAL!M. No pedir crédito por la vencida." };
    } else if (baseCount.get(user) > 1) out = { reason: "DUPLICADO_USUARIO_BASE", evidence: `USUARIO ${r.user} en ${baseCount.get(user)} fichas de BASE · panel Id ${hits[0].id}`, action: "Unificar o diferenciar las fichas con el mismo USUARIO en BASE antes de asignar ID." };
    else if (usersById.get(hits[0].id).size > 1) out = { reason: "ID_COMPARTIDO_PANEL", evidence: `Id ${hits[0].id} con ${usersById.get(hits[0].id).size} usernames`, action: "Revisar en el panel por qué el mismo Id aparece con varios usernames." };
    else out = { id: hits[0].id, expiration: hits[0].expiration, owner: hits[0].owner };
    if (out.reason) counts[out.reason] = (counts[out.reason] ?? 0) + 1;
    else counts.ASIGNABLE_1_1 = (counts.ASIGNABLE_1_1 ?? 0) + 1;
    result.set(r.n, out);
  }
  return { byRow: result, counts };
}
