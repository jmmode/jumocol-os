// Lectura gerencial de la hoja BORRADOR del cierre mensual (escrita solo por el motor sync-draft).
// La intranet no escribe: lee A (ids de sección), J:K (USD/COP) y AG:AL (semana, clase, causa, id).
// Nunca solicita B (CLIENTE) ni M (USUARIO); la hoja no contiene teléfonos, correos ni contraseñas.

/** Espejo del contrato del motor (05_AUTOMATION/tiviplay-monthly-close-v1/src/draft/contract.mjs). */
export const DRAFT_SHEETS: Record<string, { title: string; prefix: string }> = {
  "2026-11": { title: "PAGOS NOVIEMBRE 2026 - BORRADOR", prefix: "NOV26" },
};

export const DRAFT_READ_COLUMNS = ["A", "J:K", "AG:AL"] as const;

export type DraftClass = "FACTURABLE" | "REQUIERE_REVISION" | "BLOQUEADO" | "PAGADO_SIN_PROPAGAR";
export const DRAFT_CLASSES: DraftClass[] = ["FACTURABLE", "REQUIERE_REVISION", "BLOQUEADO", "PAGADO_SIN_PROPAGAR"];

export type TiviplayDraftLive = {
  title: string;
  targetMonth: string;
  cutoffDate: string | null;
  signature: string | null;
  universe: number;
  weeks: [number, number, number, number, number];
  classes: Record<DraftClass, { count: number; usd: number; cop: number }>;
  facturableWeeks: [number, number, number, number, number];
  sections: { ajustes: number; pagosPendientes: number; bloqueadosFuera: number; cartera: number; excluidos: number };
  attention: Array<{ id: string; clase: DraftClass; categoria: string; causa: string; responsable: string }>;
  issues: string[];
};

const s = (v: unknown) => String(v ?? "").trim();
const money = (v: unknown) => {
  const n = Number(s(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const copValue = (v: unknown) => {
  // COP del libro: "$234,150.0", "39.900" o "39900".
  const raw = s(v).replace(/[$\s]/g, "");
  if (!raw) return 0;
  const n = /^\d{1,3}(\.\d{3})+$/.test(raw) ? Number(raw.replace(/\./g, "")) : Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Proyección pura. `a`, `jk`, `agal` son los rangos leídos desde la fila 1 (mismo índice = misma fila).
 */
export function projectDraft(
  targetMonth: string,
  { a, jk, agal }: { a: unknown[][]; jk: unknown[][]; agal: unknown[][] },
): TiviplayDraftLive {
  const contract = DRAFT_SHEETS[targetMonth];
  if (!contract) throw new Error(`Sin hoja BORRADOR para ${targetMonth}`);
  const P = contract.prefix;
  const classes = Object.fromEntries(DRAFT_CLASSES.map((c) => [c, { count: 0, usd: 0, cop: 0 }])) as TiviplayDraftLive["classes"];
  const weeks: TiviplayDraftLive["weeks"] = [0, 0, 0, 0, 0];
  const facturableWeeks: TiviplayDraftLive["facturableWeeks"] = [0, 0, 0, 0, 0];
  const sections = { ajustes: 0, pagosPendientes: 0, bloqueadosFuera: 0, cartera: 0, excluidos: 0 };
  const attention: TiviplayDraftLive["attention"] = [];
  const issues: string[] = [];
  const seen = new Set<string>();

  const meta = agal[1] ?? [];
  const cutoffDate = s(meta[3]).startsWith("corte:") ? s(meta[3]).slice(6) : null;
  const signature = s(meta[4]).startsWith("firma:") ? s(meta[4]).slice(6) : null;
  if (!signature) issues.push("La hoja no tiene firma del motor: no fue escrita por sync-draft.");

  const height = Math.max(a.length, jk.length, agal.length);
  for (let i = 0; i < height; i++) {
    const r = agal[i] ?? [];
    const id = s(r[5]) || (s(a[i]?.[0]).startsWith(`${P}-`) ? s(a[i]?.[0]) : "");
    if (!id) continue;
    if (seen.has(id)) issues.push(`ID duplicado ${id}`);
    seen.add(id);

    const universe = new RegExp(`^${P}-B\\d+$`).test(id);
    if (universe) {
      const week = Number(s(r[0]));
      const clase = s(r[1]) as DraftClass;
      if (!(clase in classes) || week < 1 || week > 5) {
        issues.push(`${id}: semana o clase no reconocida`);
        continue;
      }
      weeks[week - 1] += 1;
      classes[clase].count += 1;
      classes[clase].usd += money(jk[i]?.[0]);
      classes[clase].cop += copValue(jk[i]?.[1]);
      if (clase === "FACTURABLE") facturableWeeks[week - 1] += 1;
      if (clase === "BLOQUEADO" || clase === "PAGADO_SIN_PROPAGAR") {
        attention.push({ id, clase, categoria: s(r[2]), causa: s(r[3]), responsable: s(r[4]) });
      }
      continue;
    }
    if (id.startsWith(`${P}-AJ`)) sections.ajustes += 1;
    else if (id.startsWith(`${P}-PG-`)) sections.pagosPendientes += 1;
    else if (id.startsWith(`${P}-BQ`)) sections.bloqueadosFuera += 1;
    else if (id.startsWith(`${P}-CV`)) sections.cartera += 1;
    else if (id.startsWith(`${P}-EX`)) sections.excluidos += 1;
  }
  for (const c of DRAFT_CLASSES) classes[c].usd = Math.round(classes[c].usd * 100) / 100;

  return {
    title: contract.title,
    targetMonth,
    cutoffDate,
    signature,
    universe: DRAFT_CLASSES.reduce((t, c) => t + classes[c].count, 0),
    weeks,
    classes,
    facturableWeeks,
    sections,
    attention,
    issues,
  };
}
