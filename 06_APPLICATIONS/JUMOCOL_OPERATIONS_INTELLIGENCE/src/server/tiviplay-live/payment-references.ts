import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Datos de pago autorizados por Dirección. Viven solo en configuración privada, nunca en Git.
 * Sin ese archivo los mensajes dejan [DATOS_PAGO] sin completar.
 */
export async function readPaymentReferences(): Promise<Record<string, string> | null> {
  try {
    const raw = await readFile(/* turbopackIgnore: true */ path.resolve(process.cwd(), "data/private/payment-references.json"), "utf8");
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}
