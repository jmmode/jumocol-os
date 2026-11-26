import type { Evidence, Money } from "@/server/tiviplay-live/runtime-read-model";

const number = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

export function formatMoney(m: Money, empty = "USD 0") {
  const parts = (["USD", "COP", "CAD"] as const).filter((c) => m[c]).map((c) => `${c} ${number.format(m[c])}`);
  return parts.length ? parts.join(" · ") : empty;
}

export const formatNumber = (n: number) => number.format(n);

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export function evidenceText(e: Evidence) {
  return `FUENTE: ${e.source}\nCAMPO: ${e.field}\nREGLA: ${e.rule}\nCÁLCULO: ${e.calculation}\nESTADO: ${e.status}`;
}

export const CARTERA_LABEL = {
  PAGADO_VALIDADO: "Pagado · validado",
  PAGADO_REQUIERE_DECISION: "Pagado · requiere decisión",
  PAGO_POR_CONFIRMAR: "Pago por confirmar",
  SIN_PAGO: "Sin pago",
  EXCEPCION_ESTRUCTURA: "Fila con error",
} as const;
