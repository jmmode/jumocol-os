// Proyección operacional HOY sobre la salida del motor gobernado
// 05_AUTOMATION/tiviplay-monthly-close-v1 (buildMonthlyClose).
//
// Regla: este archivo SOLO selecciona y renombra campos ya producidos por el motor.
// No clasifica, no filtra por reglas propias, no asigna responsables y no lee fuentes.
import type {
  MotorMonthlyClose,
  MotorReviewReason,
} from "@motor/tiviplay-monthly-close-v1/core";

export const OWNER_NOT_GOVERNED = "REQUIERE DECISIÓN" as const;

export const REVIEW_REASON_LABEL: Record<MotorReviewReason, string> = {
  POSSIBLE_NO_RENEWAL: "Posible no renovación",
  POSSIBLE_FREE_MONTH: "Posible mes gratis",
  EXPLICIT_EXCEPTION: "Excepción explícita",
};

export type HoyContact = {
  origin: string;
  sourceRow: number;
  week: number;
  client: string;
  phone: string;
  nextPaymentDate: string;
  plan: string;
  paymentMethod: string;
};

export type HoyException = {
  kind: "REQUIERE_REVISION" | "INVALID_NEXT_PAYMENT_DATE" | "DUPLICADO";
  rows: number[];
  client: string | null;
  detail: string;
  motorOutput: string;
  owner: typeof OWNER_NOT_GOVERNED;
};

export type ConfirmadoJmState = {
  state: "BLOQUEADO";
  reason: "monthly-close-v1 no expone actualmente pendientes de Confirmado JM";
};

export const CONFIRMADO_JM_BLOCKED: ConfirmadoJmState = {
  state: "BLOQUEADO",
  reason: "monthly-close-v1 no expone actualmente pendientes de Confirmado JM",
};

export type TiviplayHoy = {
  generatedAt: string;
  targetMonth: string;
  status: "VALIDADO_TECNICO" | "PARCIAL";
  stableDuringRead: boolean;
  signature: string;
  motorTotal: number;
  contacts: HoyContact[];
  exceptions: HoyException[];
  confirmadoJm: ConfirmadoJmState;
};

export function projectHoy(
  close: MotorMonthlyClose,
  meta: { generatedAt: string; stableDuringRead: boolean },
): TiviplayHoy {
  const contacts: HoyContact[] = close.preview
    .filter((row) => row.classification === "FACTURAR_CANDIDATO")
    .map((row) => ({
      origin: row.origin,
      sourceRow: row.sourceRow,
      week: row.week,
      client: row.client,
      phone: row.phone,
      nextPaymentDate: row.nextPaymentDate,
      plan: row.plan,
      paymentMethod: row.paymentMethod,
    }))
    .sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate) || a.sourceRow - b.sourceRow);

  const review: HoyException[] = close.preview
    .filter((row) => row.classification === "REQUIERE_REVISION")
    .map((row) => ({
      kind: "REQUIERE_REVISION",
      rows: [row.sourceRow],
      client: row.client || null,
      detail: row.reviewReasons.map((r) => REVIEW_REASON_LABEL[r] ?? r).join(" · "),
      motorOutput: `REQUIERE_REVISION [${row.reviewReasons.join(", ")}]`,
      owner: OWNER_NOT_GOVERNED,
    }));

  const invalidDates: HoyException[] = close.exceptions.map((e) => ({
    kind: "INVALID_NEXT_PAYMENT_DATE",
    rows: [e.sourceRow],
    client: null,
    detail: `F. PRÓXIMO PAGO no interpretable: "${e.rawValue}"`,
    motorOutput: `${e.type} → ${e.action}`,
    owner: OWNER_NOT_GOVERNED,
  }));

  const duplicates: HoyException[] = close.duplicates.map((d) => ({
    kind: "DUPLICADO",
    rows: [...d.sourceRows],
    client: null,
    detail: `Misma identidad usuario|cliente|contacto|panel en ${d.sourceRows.length} filas`,
    motorOutput: `duplicates[identityHash ${d.identityHash.slice(0, 12)}…]`,
    owner: OWNER_NOT_GOVERNED,
  }));

  return {
    generatedAt: meta.generatedAt,
    targetMonth: close.targetMonth,
    status: meta.stableDuringRead && close.duplicates.length === 0 ? "VALIDADO_TECNICO" : "PARCIAL",
    stableDuringRead: meta.stableDuringRead,
    signature: close.signature,
    motorTotal: close.total,
    contacts,
    exceptions: [...invalidDates, ...duplicates, ...review],
    confirmadoJm: CONFIRMADO_JM_BLOCKED,
  };
}
