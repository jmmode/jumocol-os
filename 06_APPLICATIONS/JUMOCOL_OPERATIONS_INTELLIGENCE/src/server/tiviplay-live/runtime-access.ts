import type { Role } from "@/server/auth/store";
import type { TiviplayRuntimeLive } from "./runtime-source";

export type OperationalRuntime = Omit<TiviplayRuntimeLive, "management" | "panels" | "clients" | "decisions" | "payments"> & {
  payments: Pick<TiviplayRuntimeLive["payments"], "month" | "openInvoices">;
  panelExceptions: Array<{ panel: string; row: number; type: string; detail: string }>;
};
export function operationalRuntime(model: TiviplayRuntimeLive): OperationalRuntime {
  // Explicit DTO: new management fields cannot leak through object spreading.
  return {
    generatedAt: model.generatedAt, today: model.today, currentMonth: model.currentMonth,
    scope: model.scope, sources: model.sources, source: model.source, sync: model.sync,
    operations: model.operations, clientIndex: model.clientIndex,
    payments: { month: model.payments.month, openInvoices: model.payments.openInvoices },
    panelExceptions: Object.entries(model.panels).flatMap(([panel, data]) => (data?.exceptions ?? []).map(x => ({ panel, ...x }))),
  };
}
export function runtimeForRole(model: TiviplayRuntimeLive, role: Role) {
  return role === "ADMIN" ? model : operationalRuntime(model);
}
