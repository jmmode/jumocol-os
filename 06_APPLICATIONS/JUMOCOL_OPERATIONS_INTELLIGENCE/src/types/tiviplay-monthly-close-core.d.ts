// Tipos del motor gobernado 05_AUTOMATION/tiviplay-monthly-close-v1/src/core.mjs.
// Solo declara la forma de salida existente; no agrega ni cambia lógica del motor.
declare module "@motor/tiviplay-monthly-close-v1/core" {
  export type MotorClassification = "FACTURAR_CANDIDATO" | "REQUIERE_REVISION";
  export type MotorReviewReason = "POSSIBLE_NO_RENEWAL" | "POSSIBLE_FREE_MONTH" | "EXPLICIT_EXCEPTION";

  export type MotorPreviewRow = {
    sourceRow: number;
    week: number;
    classification: MotorClassification;
    reviewReasons: MotorReviewReason[];
    tc: string;
    client: string;
    phone: string;
    email: string;
    status: string;
    observations: string;
    plan: string;
    screens: string;
    mobile: string;
    usd: string;
    cop: string;
    paymentMethod: string;
    username: string;
    password: string;
    panel: string;
    expirationDate: string;
    lastPaymentDate: string;
    nextPaymentDate: string;
    referredBy: string;
    devices: string;
    serviceType: string;
    origin: string;
  };

  export type MotorException = {
    sourceRow: number;
    type: "INVALID_NEXT_PAYMENT_DATE";
    rawValue: string;
    action: "REQUIERE_CORRECCION";
  };

  export type MotorDuplicate = { identityHash: string; sourceRows: number[] };

  export type MotorMonthlyClose = {
    targetMonth: string;
    total: number;
    weeks: number[];
    classificationCounts: Partial<Record<MotorClassification, number>>;
    reviewReasonCounts: Partial<Record<MotorReviewReason, number>>;
    preview: MotorPreviewRow[];
    duplicates: MotorDuplicate[];
    exceptions: MotorException[];
    signature: string;
  };

  export function buildMonthlyClose(rows: unknown[][], targetMonth: string): MotorMonthlyClose;
  export function weekBucket(isoDate: string): number;
}
