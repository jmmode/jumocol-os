/**
 * Puesto de trabajo diario TiviPlay — modelo puro (sin E/S).
 * Reutiliza el read model de Runtime (cartera del mes) y la proyección de créditos (CONTROL del mes); aquí solo se
 * ordena la jornada: a quién contactar hoy, cuánto se gestiona por moneda y qué créditos están en cada estado.
 *
 * Reglas:
 *  - Importes por moneda separados. "Por cobrar" es nominal esperado de la cartera, nunca recaudo ni CONFIRMADO JM.
 *  - Un cliente BLOQUEADO o REQUIERE_REVISION en la cartera no se cobra: se verifica (ficha A6).
 *  - Directorio: solo campos operativos permitidos. CORREO y CONTRASEÑA no se leen ni se devuelven.
 *  - El identificador del cliente es opaco (hash de hoja+fila): es lo único que viaja en la URL.
 */
import crypto from "node:crypto";

import type { CreditosHoy, CreditState } from "@/server/tiviplay-live/creditos-hoy-projection";
import { canon, clean, parseAmount, parseDate, type CarteraItem, type Currency, type Money, type RuntimeReadModel, type SheetValues } from "@/server/tiviplay-live/runtime-read-model";
import { findHeaderRow, headerKey, isSensitiveHeader } from "@/server/tiviplay-live/sheet-columns";

export type DirectoryEntry = {
  id: string;
  name: string;
  phone: string;
  user: string;
  status: string;
  plan: string;
  panel: string;
  method: string;
  nextPayment: string | null;
  tariff: Money;
  source: string; // «HOJA!fila»
  baseRow: number | null;
};

export type QueueBucket = "VENCIDO" | "HOY" | "ANTICIPADO" | "MES";

/**
 * Ventana de gestión anticipada autorizada: un día antes del vencimiento.
 * Fuente: Regla operativa de créditos v1.0 (2026-10-26, «el crédito se ejecuta un día antes del vencimiento técnico»)
 * y ficha A5 («las facturas se envían un día antes del vencimiento», PENDIENTE DE VALIDACIÓN).
 */
export const ADVANCE_WINDOW = {
  days: 1,
  source: "Regla operativa de créditos v1.0 y ficha A5 (un día antes del vencimiento)",
  validation: "PENDIENTE DE VALIDACIÓN",
} as const;

export type Scope = { status: "COMPLETO" | "PARCIAL"; detail: string };
export type QueueLane = "COBRAR" | "VERIFICAR" | "BLOQUEADO" | "CONFIRMAR_PAGO";

export type QueueItem = {
  id: string;
  client: string;
  phone: string;
  user: string;
  plan: string;
  panel: string;
  method: string;
  dueDate: string | null;
  bucket: QueueBucket;
  lane: QueueLane;
  amount: Money;
  classification: string;
  collectionStatus: string;
  reason: string;
  nextAction: string;
  suggestedFicha: string;
  source: string;
};

export type Workday = {
  today: string;
  month: string;
  carteraSheet: string | null;
  universe: number;
  queue: QueueItem[]; // VENCIDO + HOY + SEMANA (la jornada)
  later: number; // resto del mes, fuera de la jornada
  scope: Scope;
  paymentsToConfirm: { status: "OK" | "BLOQUEADO"; count: number; amount: Money; source: string; reason: string | null };
  exceptions: Array<{ source: string; type: string; detail: string }>;
  counts: Record<QueueBucket, number>;
  lanes: Record<QueueLane, { count: number; amount: Money }>;
  toCollectToday: Money; // COBRAR en VENCIDO + HOY + ANTICIPADO
  credits: {
    status: "OK" | "PARCIAL" | "BLOQUEADO";
    totals: Record<CreditState, number> & { total: number };
    panels: Array<{ panel: string; sheet: string | null; status: string; reason: string | null; programados: number | null; otorgados: number | null; faltantes: number | null; hoy: number | null; habilitados: number | null; pendientes: number | null; bloqueados: number | null }>;
    reason: string | null;
  };
  blockers: string[];
};

const emptyMoney = (): Money => ({ USD: 0, COP: 0, CAD: 0 });
const add = (m: Money, n: Money) => { for (const c of ["USD", "COP", "CAD"] as Currency[]) m[c] += n[c]; };

export function opaqueId(source: string, user: string, name: string) {
  return crypto.createHash("sha256").update(`${source}|${canon(user)}|${canon(name)}`).digest("hex").slice(0, 16);
}

/** Directorio a partir de BASE GENERAL y la cartera del mes (mismas lecturas que Runtime). */
export function buildClientDirectory(values: SheetValues, sheets: string[]): DirectoryEntry[] {
  const out: DirectoryEntry[] = [];
  for (const sheet of sheets) {
    const rows = values[sheet] ?? [];
    const h = findHeaderRow(rows.slice(0, 8), ["TC", "CLIENTE"]);
    if (h < 0) continue;
    const header = (rows[h] ?? []).map(headerKey);
    const col = (...names: string[]) => {
      for (const n of names) {
        const i = header.indexOf(headerKey(n));
        if (i >= 0 && !isSensitiveHeader(rows[h]?.[i])) return i;
      }
      return -1;
    };
    const c = {
      tc: col("TC"), name: col("CLIENTE"), phone: col("TELEFONO"), user: col("USUARIO"), status: col("ESTADO"), plan: col("PLAN ACTIVO"),
      panel: col("PANEL"), method: col("MÉTODO DE PAGO"), next: col("F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"), usd: col("USD"), cop: col("COP"), origin: col("ORIGEN BASE"),
    };
    const at = (row: unknown[], i: number) => (i < 0 ? "" : clean(row[i]));
    for (let r = h + 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const name = at(row, c.name);
      if (!name || at(row, c.tc) !== "1" || /^(TOTAL|SEMANA|ACTIVOS TIVIPLAY|VENCIDOS TIVIPLAY)\b/.test(canon(name))) continue;
      const tariff = emptyMoney();
      const usd = parseAmount(at(row, c.usd));
      const cop = parseAmount(at(row, c.cop));
      if (usd) tariff.USD = usd;
      if (cop) tariff.COP = cop;
      const source = `${sheet}!${r + 1}`;
      const baseRow = sheet === "BASE GENERAL" ? r + 1 : Number(at(row, c.origin).match(/!(\d+)$/)?.[1]) || null;
      out.push({
        id: opaqueId(baseRow ? `BASE GENERAL!${baseRow}` : source, at(row, c.user), name),
        name, phone: at(row, c.phone), user: at(row, c.user), status: at(row, c.status), plan: at(row, c.plan), panel: at(row, c.panel),
        method: at(row, c.method), nextPayment: parseDate(at(row, c.next)), tariff, source, baseRow,
      });
    }
  }
  // Una ficha por fila de BASE: la cartera del mes refresca plan/fecha, BASE aporta las fichas fuera del mes.
  const byId = new Map<string, DirectoryEntry>();
  for (const e of out) {
    const prev = byId.get(e.id);
    byId.set(e.id, prev ? { ...prev, ...Object.fromEntries(Object.entries(e).filter(([, v]) => v !== "" && v != null)) } as DirectoryEntry : e);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

const fold = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const digits = (v: string) => v.replace(/\D/g, "");

export type SearchMatch = { entry: DirectoryEntry; by: "USUARIO" | "TELÉFONO" | "NOMBRE" };

/** Búsqueda de solo lectura por nombre, teléfono o usuario. Devuelve coincidencias múltiples; nunca adivina. */
export function searchDirectory(directory: readonly DirectoryEntry[], rawQuery: string, limit = 20): SearchMatch[] {
  const query = fold(rawQuery).slice(0, 80);
  if (query.length < 3) return [];
  const qDigits = digits(query);
  const isPhone = qDigits.length >= 4 && qDigits.length >= query.replace(/[\s()+-]/g, "").length - 1;
  const terms = query.split(" ").filter(Boolean);
  const out: SearchMatch[] = [];
  for (const entry of directory) {
    const user = fold(entry.user);
    if (user && (user === query || (query.length >= 4 && !query.includes(" ") && user.includes(query)))) { out.push({ entry, by: "USUARIO" }); continue; }
    if (isPhone && digits(entry.phone).includes(qDigits)) { out.push({ entry, by: "TELÉFONO" }); continue; }
    const name = fold(entry.name);
    if (!isPhone && terms.every((t) => name.includes(t))) out.push({ entry, by: "NOMBRE" });
  }
  const rank = { USUARIO: 0, TELÉFONO: 1, NOMBRE: 2 } as const;
  return out.sort((a, b) => rank[a.by] - rank[b.by] || a.entry.name.localeCompare(b.entry.name, "es")).slice(0, limit);
}

function laneOf(item: CarteraItem): QueueLane {
  if (item.state === "PAGO_POR_CONFIRMAR") return "CONFIRMAR_PAGO";
  if (item.signals.some((s) => s.startsWith("BLOQUEADO"))) return "BLOQUEADO";
  if (item.signals.some((s) => s.startsWith("REQUIERE REVISIÓN")) || item.state === "PAGADO_REQUIERE_DECISION" || item.state === "EXCEPCION_ESTRUCTURA") return "VERIFICAR";
  return "COBRAR";
}

const FICHA_BY_LANE: Record<QueueLane, string> = { COBRAR: "A1", CONFIRMAR_PAGO: "A3", VERIFICAR: "A6", BLOQUEADO: "A6" };


const addDays = (iso: string, n: number) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n)).toISOString().slice(0, 10);

export function buildWorkday(input: { model: RuntimeReadModel; credits: CreditosHoy | null; creditsError?: string | null; directory: readonly DirectoryEntry[]; scope?: Scope }): Workday {
  const { model, credits, directory } = input;
  const today = model.today;
  const byBaseRow = new Map(directory.filter((d) => d.baseRow).map((d) => [d.baseRow!, d]));
  const byName = new Map(directory.map((d) => [canon(d.name), d]));
  const carteraSheet = model.sources.included.find((r) => r.role === "CARTERA" && r.month === model.currentMonth)?.title ?? null;
  const blockers: string[] = [];
  if (!carteraSheet) blockers.push(`Sin hoja de cartera para ${model.currentMonth}: no hay cola de cobro verificable.`);

  const counts: Record<QueueBucket, number> = { VENCIDO: 0, HOY: 0, ANTICIPADO: 0, MES: 0 };
  const advanceUntil = addDays(today, ADVANCE_WINDOW.days);
  const lanes = Object.fromEntries((["COBRAR", "VERIFICAR", "BLOQUEADO", "CONFIRMAR_PAGO"] as QueueLane[]).map((l) => [l, { count: 0, amount: emptyMoney() }])) as Workday["lanes"];
  const toCollectToday = emptyMoney();
  const queue: QueueItem[] = [];
  let later = 0;
  let universe = 0;

  for (const item of model.operations.items) {
    universe += 1;
    if (item.state === "PAGADO_VALIDADO") continue;
    const due = item.dueDate;
    const bucket: QueueBucket = !due ? "VENCIDO" : due < today ? "VENCIDO" : due === today ? "HOY" : due <= advanceUntil ? "ANTICIPADO" : "MES";
    const lane = laneOf(item);
    counts[bucket] += 1;
    lanes[lane].count += 1;
    add(lanes[lane].amount, item.nominal);
    if (bucket === "MES") { later += 1; continue; }
    if (lane === "COBRAR") add(toCollectToday, item.nominal); // vencidos + hoy + anticipada (ya filtrado MES)
    const dir = (item.baseRow ? byBaseRow.get(item.baseRow) : undefined) ?? byName.get(canon(item.client));
    queue.push({
      id: dir?.id ?? opaqueId(`${carteraSheet}!${item.row}`, "", item.client),
      client: item.client,
      phone: dir?.phone ?? "",
      user: dir?.user ?? "",
      plan: item.plan,
      panel: item.panel,
      method: item.method,
      dueDate: due,
      bucket,
      lane,
      amount: item.nominal,
      classification: item.classification ?? item.state,
      collectionStatus: item.collectionStatus ?? "",
      reason: item.signals.join(" · "),
      nextAction: item.nextAction,
      suggestedFicha: FICHA_BY_LANE[lane],
      source: `${carteraSheet ?? "cartera"}!${item.row}`,
    });
  }
  const order: Record<QueueBucket, number> = { VENCIDO: 0, HOY: 1, ANTICIPADO: 2, MES: 3 };
  const laneOrder: Record<QueueLane, number> = { COBRAR: 0, CONFIRMAR_PAGO: 1, VERIFICAR: 2, BLOQUEADO: 3 };
  queue.sort((a, b) => order[a.bucket] - order[b.bucket] || laneOrder[a.lane] - laneOrder[b.lane] || (a.dueDate ?? "").localeCompare(b.dueDate ?? "") || a.client.localeCompare(b.client, "es"));

  const zero = { HABILITADO: 0, NO_HABILITADO: 0, SIN_PAGAR: 0, REQUIERE_REVISION: 0, EJECUTADO: 0, total: 0 };
  let creditStatus: Workday["credits"]["status"] = "BLOQUEADO";
  let creditReason: string | null = input.creditsError ?? null;
  const panels: Workday["credits"]["panels"] = [];
  if (credits) {
    for (const p of credits.panels) {
      const ok = p.status === "OK";
      // Semáforo del motor: habilitado = habilitación financiera (A/B/E); pendiente = esperando pago; bloqueado = decisión de Dirección.
      const count = (f: (c: (typeof p.cycles)[number]) => boolean) => (ok ? p.cycles.filter(f).length : null);
      panels.push({
        panel: p.panel, sheet: p.sheet, status: p.status, reason: p.reason,
        programados: p.kpi?.programados ?? null, otorgados: p.kpi?.otorgados ?? null, faltantes: p.kpi?.faltantes ?? null, hoy: p.kpi?.hoy ?? null,
        habilitados: count((c) => c.basis != null), pendientes: count((c) => c.step === "PAGO"), bloqueados: count((c) => c.step === "DIRECCION"),
      });
    }
    const bad = credits.panels.filter((p) => p.status !== "OK");
    creditStatus = bad.length === 0 ? "OK" : bad.length < credits.panels.length ? "PARCIAL" : "BLOQUEADO";
    if (bad.length) creditReason = bad.map((p) => `${p.panel}: ${p.reason ?? p.status}`).join(" · ");
  } else if (!creditReason) creditReason = "No fue posible leer CONTROL del mes.";
  if (creditStatus !== "OK") blockers.push(`Créditos ${creditStatus}: ${creditReason}`);

  // Pagos por confirmar: hojas ZELLE/PAYPAL/TRANSF del mes (CONFIRMACION ≠ CONFIRMADO JM). Sin esas hojas no hay cifra.
  const payTitles = model.sources.included.filter((r) => r.role === "PAGO" && r.month === model.currentMonth).map((r) => r.title);
  const ptc = model.management.paymentsToConfirm;
  const paymentsToConfirm: Workday["paymentsToConfirm"] = payTitles.length
    ? { status: "OK", count: ptc.value.count, amount: ptc.value.amount, source: payTitles.join(", "), reason: null }
    : { status: "BLOQUEADO", count: 0, amount: emptyMoney(), source: "—", reason: `No se leyeron hojas de pago de ${model.currentMonth} (ZELLE/PAYPAL/TRANSF).` };
  if (paymentsToConfirm.status === "BLOQUEADO") blockers.push(`Pagos por confirmar BLOQUEADO: ${paymentsToConfirm.reason}`);

  const exceptions = [
    ...model.operations.exceptions.map((e) => ({ source: `${e.sheet}!${e.row}`, type: e.type, detail: e.detail })),
    ...(credits?.cycle.exceptions ?? []).map((e) => ({ source: e.references.join(", "), type: `CRÉDITO · ${e.kind}`, detail: e.title })),
  ];
  const scope = input.scope ?? { status: "COMPLETO", detail: "Lectura completa de las hojas del mes." };
  if (scope.status === "PARCIAL") blockers.unshift(`ALCANCE PARCIAL: ${scope.detail} Las cifras no representan el universo operacional completo.`);

  return {
    today,
    month: model.currentMonth,
    carteraSheet,
    universe,
    queue,
    later,
    scope,
    paymentsToConfirm,
    exceptions,
    counts,
    lanes,
    toCollectToday,
    credits: { status: creditStatus, totals: credits?.totals ?? zero, panels, reason: creditReason },
    blockers,
  };
}

/**
 * Reemplaza marcadores del script SOLO con valores confirmados por la fuente. Lo que no está confirmado queda entre
 * corchetes para que el operador lo complete o lo omita; nunca se inventa plan, tarifa ni vencimiento.
 */
export function personalizeScript(text: string, values: { NOMBRE?: string | null; ASESOR?: string | null; FECHA?: string | null; PLAN?: string | null }) {
  let pending = 0;
  const out = text.replace(/\[(NOMBRE|ASESOR|FECHA|PLAN)\]/g, (whole, key: keyof typeof values) => {
    const v = clean(values[key] ?? "");
    if (!v) { pending += 1; return whole; }
    return v;
  });
  return { text: out, pending };
}

/** Primer nombre de pila para el saludo (antes de «/», «(» o «//»). */
export function greetingName(name: string) {
  const first = clean(name.split(/\/|\(|,/)[0]);
  return first.split(" ").slice(0, 2).join(" ");
}

/** 2026-11-04 → 04/11/2026, formato de las fichas. */
export function displayDate(iso: string | null) {
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : null;
}
