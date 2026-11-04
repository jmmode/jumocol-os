// Mensaje de cobro por etapa del Manual de cobro. Los textos viven en el documento publicado por ADMIN.

export type CobranzaStage = { key: string; label: string; channel: string; note: string };

const METHOD = [["ZELLE", /ZELLE/i], ["PAYPAL", /PAYPAL/i], ["TRANSFERENCIA", /TRANSF|BANCO|NEQUI|DAVI/i]] as const;

/** Días hasta F. PRÓXIMO PAGO. El vencimiento técnico no define la etapa de cobro. */
export function cobranzaStage(nextPayment: string | null, today: string, method: string): CobranzaStage | null {
  if (!nextPayment) return null;
  const days = Math.round((Date.parse(nextPayment) - Date.parse(today)) / 86_400_000);
  if (Number.isNaN(days) || days > 5) return null;
  if (days === 5 || days === 3) return { key: "D-5", label: `Día -${days} · Recordatorio`, channel: "WhatsApp", note: days === 3 ? "El manual agrega una imagen: usa solo una imagen autorizada." : "" };
  if (days === 4) return { key: "D-5", label: "Día -4 · Llamada de refuerzo", channel: "Llamada", note: "El manual indica llamada. Si no contesta, envía este recordatorio." };
  if (days === 2) {
    const match = METHOD.find(([, re]) => re.test(method))?.[0];
    return { key: match ? `D-2 ${match}` : "D-5", label: "Día -2 · Datos de pago", channel: "WhatsApp o llamada", note: match ? "" : "Método de pago sin confirmar: pregúntalo antes de enviar datos." };
  }
  if (days === 1) return { key: "D-1", label: "Día -1 · Alerta de suspensión", channel: "WhatsApp o llamada", note: "" };
  if (days === 0) return { key: "D0", label: "Día 0 · Retención 1", channel: "WhatsApp, llamada o correo", note: "Envíalo solo si el servicio ya está suspendido." };
  return { key: "D+", label: `Vencido hace ${-days} día(s) · Retención 2`, channel: "WhatsApp", note: "" };
}

/** Lee del documento los bloques «## COBRO <etapa> · título». */
export function parseCobranza(markdown: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of markdown.matchAll(/^## COBRO (\S+(?: [A-Z]+)?) · .*\r?\n[\s\S]*?```mensaje\r?\n([\s\S]*?)```/gm)) out[match[1]] = match[2].trim();
  return out;
}
