// Adaptador de mensajes publicados; el catálogo de etapas vive en gestion-model.
import { etapaSugerida, GESTION_ETAPAS } from "@/server/tiviplay-live/gestion-model";

export type CobranzaStage = { key: string; label: string; channel: string; note: string };

const METHOD = [["ZELLE", /ZELLE/i], ["PAYPAL", /PAYPAL/i], ["TRANSFERENCIA", /TRANSF|BANCO|NEQUI|DAVI/i]] as const;

/** Días hasta F. PRÓXIMO PAGO. El vencimiento técnico no define la etapa de cobro. */
export function cobranzaStage(nextPayment: string | null, today: string, method: string): CobranzaStage | null {
  if (!nextPayment) return null;
  const id = etapaSugerida(nextPayment, today);
  const stage = GESTION_ETAPAS.find((item) => item.id === id);
  if (!stage) return null;
  const match = METHOD.find(([, re]) => re.test(method))?.[0];
  const key = stage.id === "D-2" ? (match ? `D-2 ${match}` : "") : stage.template ?? "";
  return { key, label: `${stage.label} · ${stage.action}`, channel: stage.channel,
    note: stage.id === "D-2" && !match ? "Método sin confirmar: no enviar datos de pago." : "" };
}

/** Lee del documento los bloques «## COBRO <etapa> · título». */
export function parseCobranza(markdown: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of markdown.matchAll(/^## COBRO (\S+(?: [A-Z]+)?) · .*\r?\n[\s\S]*?```mensaje\r?\n([\s\S]*?)```/gm)) out[match[1]] = match[2].trim();
  return out;
}
