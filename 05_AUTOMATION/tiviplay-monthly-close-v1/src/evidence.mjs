// Evidencia versionable del motor: solo conteos, filas de origen, fechas,
// hashes y firmas. Nunca incluye el preview (cliente, contacto, usuario).

const PII_FIELDS = ["client", "phone", "email", "mobile", "username", "observations", "referredBy", "devices"];

export function sanitizeRun(run) {
  return {
    targetMonth: run.targetMonth,
    cutoffDate: run.cutoffDate ?? null,
    total: run.total,
    weeks: run.weeks,
    classificationCounts: run.classificationCounts,
    reviewReasonCounts: run.reviewReasonCounts,
    candidates: run.preview.map((item) => ({
      sourceRow: item.sourceRow,
      week: item.week,
      nextPaymentDate: item.nextPaymentDate,
      classification: item.classification,
    })),
    duplicates: run.duplicates,
    exceptions: run.exceptions.map(({ sourceRow, type, cause, action }) => ({ sourceRow, type, cause, action })),
    carteraVencidaCount: run.carteraVencida?.length ?? 0,
    carteraByMonth: run.carteraByMonth ?? [],
    carteraSignalCounts: run.carteraSignalCounts ?? {},
    signature: run.signature,
    outputSignature: run.outputSignature,
  };
}

export function buildEvidence({ generatedAt, source, targetMonth, run1, run2, repeatability, oracle, status }) {
  return {
    generatedAt,
    mode: "READ_ONLY_LIVE_SANITIZED",
    pii: "EXCLUDED",
    sensitiveColumns: "NOT_REQUESTED",
    source,
    targetMonth,
    run1: sanitizeRun(run1),
    run2: sanitizeRun(run2),
    repeatability,
    oracle,
    status,
  };
}

// Valores del preview que nunca deben aparecer en la evidencia ni en consola.
export function findLeaks(text, preview) {
  const values = new Set();
  for (const item of preview) {
    for (const field of PII_FIELDS) {
      const value = String(item[field] ?? "").trim();
      if (value.length >= 4) values.add(value);
    }
  }
  return [...values].filter((value) => text.includes(value)).length;
}

const PRIVATE_CSV_HEADERS = [
  "sourceRow", "week", "classification", "reviewReasons", "tc", "client", "phone", "email", "status",
  "observations", "plan", "screens", "mobile", "usd", "cop", "paymentMethod", "username",
  "panel", "expirationDate", "lastPaymentDate", "nextPaymentDate",
  "referredBy", "devices", "serviceType", "origin",
];

// Preview operativo privado (data/private, fuera de Git). Sin contraseña.
export function toPrivateCsv(rows) {
  if (!rows.length) return "";
  const lines = [PRIVATE_CSV_HEADERS.join(",")];
  for (const row of rows) {
    lines.push(
      PRIVATE_CSV_HEADERS.map((key) => csvEscape(Array.isArray(row[key]) ? row[key].join("|") : row[key])).join(","),
    );
  }
  return lines.join("\n") + "\n";
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export function renderMarkdown(e) {
  const errors = e.oracle.errors.length
    ? e.oracle.errors.map((x) => `- ${x}`).join("\n")
    : "- Ninguna";

  return `# TIVIPLAY_MONTHLY_CLOSE_V1 — Evidencia de ejecución

**Generado:** ${e.generatedAt}
**Modo:** ${e.mode} (sin datos personales; columnas sensibles no solicitadas)
**Hoja fuente:** \`${e.source.sheetName}\`
**Mes objetivo:** \`${e.targetMonth}\`
**Fecha de corte:** ${e.run1.cutoffDate ?? "no suministrada"}
**Estado:** **${e.status}**

## Resultado

| Métrica | RUN 1 | RUN 2 |
|---|---:|---:|
| Total | ${e.run1.total} | ${e.run2.total} |
| Semana 1 | ${e.run1.weeks[0]} | ${e.run2.weeks[0]} |
| Semana 2 | ${e.run1.weeks[1]} | ${e.run2.weeks[1]} |
| Semana 3 | ${e.run1.weeks[2]} | ${e.run2.weeks[2]} |
| Semana 4 | ${e.run1.weeks[3]} | ${e.run2.weeks[3]} |
| Semana 5 | ${e.run1.weeks[4]} | ${e.run2.weeks[4]} |

## Determinismo

- Firma RUN 1: \`${e.run1.signature}\`
- Firma RUN 2: \`${e.run2.signature}\`
- Firma de salida completa: \`${e.run1.outputSignature}\`
- Misma entrada → mismo resultado: **${e.repeatability.identical ? "SÍ" : "NO"}**
- Fuente estable durante la ventana de ejecución: **${e.source.stableDuringRun ? "SÍ" : "NO"}**
- Hash lectura 1: \`${e.source.hashAtRead1}\`
- Hash lectura 2: \`${e.source.hashAtRead2}\`
- Duplicados detectados: **${e.run1.duplicates.length}**
- Excepciones de fecha: **${e.run1.exceptions.length}**
- Cartera vencida (TC=1, F. PRÓXIMO PAGO < mes objetivo): **${e.run1.carteraVencidaCount}**
- Clasificaciones: \`${JSON.stringify(e.run1.classificationCounts)}\`
- Motivos de revisión: \`${JSON.stringify(e.run1.reviewReasonCounts)}\`

## Oracle

**Suministrado:** ${e.oracle.provided ? "SÍ" : "NO"}

${errors}

**Resultado oracle:** ${e.oracle.provided ? (e.oracle.valid ? "MATCH" : "DIFFERENCE") : "NO APLICA"}

## Criterio

- \`VALIDADO\`: determinismo técnico + fuente estable + cero duplicados + oracle suministrado y coincidente.
- \`VALIDADO_TECNICO\`: determinismo técnico + fuente estable + cero duplicados, sin oracle de negocio.
- \`PARCIAL\`: falla alguna condición técnica o el oracle suministrado no coincide.
`;
}
