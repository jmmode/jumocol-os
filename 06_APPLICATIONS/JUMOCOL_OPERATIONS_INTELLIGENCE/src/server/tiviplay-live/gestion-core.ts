import { createHash } from "node:crypto";

import { appendGestion } from "@/server/tiviplay-live/gestion-model";

export type GestionCommitStatus = "SAVED" | "DUPLICATE" | "CONFLICT" | "FORMULA" | "TOO_LONG" | "WRITE_DENIED" | "WRITE_FAILED" | "UNVERIFIED";

/** Huella de la celda tal como la vio el asesor al abrir la ficha. No expone su contenido al navegador. */
export function observationsHash(value: string) {
  return createHash("sha256").update(value.trimEnd()).digest("hex").slice(0, 16);
}

/**
 * Agrega una gestión a una celda sin perder su contenido y solo declara éxito tras releerla.
 * Sheets no ofrece comparación atómica: se lee justo antes de escribir y la relectura detecta una escritura cruzada.
 */
export async function commitGestion(input: {
  record: string;
  requestId: string;
  expectedHash: string | null;
  read: () => Promise<string>;
  write: (next: string) => Promise<number>;
}): Promise<GestionCommitStatus> {
  const current = await input.read();
  const marker = `[JOS:${input.requestId}]`;
  if (current.includes(marker)) return "DUPLICATE";
  if (current.startsWith("=")) return "FORMULA";
  if (input.expectedHash && observationsHash(current) !== input.expectedHash) return "CONFLICT";
  const next = appendGestion(current, input.record);
  if (next.length > 45000) return "TOO_LONG";
  const http = await input.write(next);
  if (http === 401 || http === 403) return "WRITE_DENIED";
  if (http < 200 || http >= 300) return "WRITE_FAILED";
  const after = await input.read();
  return after.trimEnd() === next.trimEnd() ? "SAVED" : "UNVERIFIED";
}
