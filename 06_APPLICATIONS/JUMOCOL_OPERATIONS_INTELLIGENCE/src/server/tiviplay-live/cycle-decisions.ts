import "server-only";

import { audit, db, type Identity } from "@/server/auth/store";
import type { CycleDecision, DecisionAction } from "@/server/tiviplay-live/creditos-hoy-projection";

// Decisiones de Dirección sobre excepciones del ciclo TiviPlay. Se guardan en la base privada de la intranet
// (data/private), nunca en Google Sheets. Historial append-only: la decisión vigente es la más reciente por asunto.
const ACTIONS: DecisionAction[] = ["CONFIRMAR", "CORREGIR", "RECHAZAR"];
const SUBJECT = /^(PANEL|DUPLICADO|NO_EN_BASE|COBERTURA|TARIFA|EXTENSION):[^\n\r]{1,200}$/;

function table() {
  const database = db();
  database.exec(`
    CREATE TABLE IF NOT EXISTS tiviplay_decisions(id INTEGER PRIMARY KEY, at TEXT NOT NULL, user_id TEXT NOT NULL, subject TEXT NOT NULL,
      fingerprint TEXT NOT NULL, action TEXT NOT NULL CHECK(action IN ('CONFIRMAR','CORREGIR','RECHAZAR')), value TEXT);
    CREATE INDEX IF NOT EXISTS tiviplay_decisions_subject ON tiviplay_decisions(subject, id);
    CREATE TRIGGER IF NOT EXISTS tiviplay_decisions_no_update BEFORE UPDATE ON tiviplay_decisions BEGIN SELECT RAISE(ABORT,'Decisions are append-only'); END;
    CREATE TRIGGER IF NOT EXISTS tiviplay_decisions_no_delete BEFORE DELETE ON tiviplay_decisions BEGIN SELECT RAISE(ABORT,'Decisions are append-only'); END;
  `);
  return database;
}

/** Todas las decisiones en orden cronológico (la proyección se queda con la última por asunto). */
export function listCycleDecisions(): CycleDecision[] {
  try {
    const rows = table().prepare("SELECT at, user_id, subject, fingerprint, action, value FROM tiviplay_decisions ORDER BY id").all() as Array<Record<string, string | null>>;
    return rows.map((r) => ({ subject: r.subject!, fingerprint: r.fingerprint!, action: r.action as DecisionAction, value: r.value, by: r.user_id!, at: r.at! }));
  } catch {
    return [];
  }
}

export function recordCycleDecision(actor: Identity, input: Record<string, string>) {
  if (actor.role !== "ADMIN") throw new Error("Solo Dirección decide excepciones.");
  const subject = (input.subject ?? "").trim();
  const fingerprint = input.fingerprint ?? "";
  const action = input.action as DecisionAction;
  const value = (input.value ?? "").trim() || null;
  if (!SUBJECT.test(subject) || !fingerprint || fingerprint.length > 400 || !ACTIONS.includes(action)) throw new Error("Decisión inválida.");
  if (action === "CORREGIR" && (!value || value.length > 80)) throw new Error("CORREGIR requiere el dato solicitado.");
  table().prepare("INSERT INTO tiviplay_decisions(at,user_id,subject,fingerprint,action,value) VALUES(?,?,?,?,?,?)")
    .run(new Date().toISOString(), actor.id, subject, fingerprint, action, action === "CORREGIR" ? value : null);
  audit(actor.id, `tiviplay-decision:${subject}`, action, "SUCCESS");
}
