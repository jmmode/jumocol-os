// Conciliación de servicio TiviPlay — modelo puro (sin E/S), probado en conciliacion-model.test.ts.
//
// Flujo: PANELES REALES → corrección automática de datos objetivos (ya aplicada en BASE) → excepciones →
// decisión en intranet → actualización BASE (cola de sincronización) → tarea LIBERAR por línea residual →
// Asesor ejecuta → línea DISPONIBLE → servicio consolidado.
//
// El dataset (data/private, fuera de Git) trae los casos y tareas del corte; las decisiones y ejecuciones
// viven en tablas append-only. Este módulo solo proyecta: nunca escribe en Google Sheets.

export type Panel = "P1" | "P2" | "P3";
export const PANEL_LABEL: Record<Panel, string> = { P1: "PANEL 1", P2: "PANEL 2", P3: "PANEL 3" };

export type ReconLine = {
  panel: Panel;
  /** Fila del snapshot del panel (corte). */
  row: number;
  /** ID original de la línea en el panel: identidad técnica PANEL + LINE_ID. */
  lineId: string;
  expiration: string;
  /** Última conexión según el snapshot; null = sin dato confiable. */
  lastConnection: string | null;
};

export type BaseUpdate = { row: number; field: "PANEL" | "F.VENCIMIENTO" | "MARCA"; from: string; to: string };

export type CaseKind = "MULTIPANEL" | "EXCEDE" | "IDENTIDAD" | "FECHA";

export type ReconOption = {
  id: string;
  label: string;
  /** Solo en MULTIPANEL: panel que se conserva. */
  keep?: Panel;
  /** Qué ocurre al elegirla (texto para la persona). */
  effect: string;
  baseUpdates: BaseUpdate[];
  /** Tareas de Asesor que genera la opción (además de las LIBERAR automáticas del multipanel). */
  tasks?: Array<Pick<AdvisorTask, "kind" | "instruction" | "evidence">>;
};

export type ReconCase = {
  id: string;
  kind: CaseKind;
  username: string;
  baseRows: number[];
  title: string;
  contradiction: string;
  evidence: string[];
  lines: ReconLine[];
  options: ReconOption[];
  /** Opción sugerida por la evidencia (no se ejecuta sola). */
  proposal: string | null;
  /** Huella del dato con el que se construyó el caso: una decisión solo vale para esta huella. */
  fingerprint: string;
  /** Activo = alguna línea vigente en el corte; los inactivos se listan aparte. */
  active: boolean;
};

export type TaskKind = "LIBERAR" | "REGISTRAR_BASE" | "CREDENCIAL" | "APLICAR_CREDITO" | "LOCALIZAR";

export type AdvisorTask = {
  id: string;
  kind: TaskKind;
  username: string;
  title: string;
  instruction: string;
  evidence: string;
  keepPanel?: Panel;
  releasePanel?: Panel;
  line?: ReconLine;
  /** Caso que la originó (tareas LIBERAR). */
  caseId?: string;
};

export type ServiceState = "ACTIVO" | "INACTIVO" | "EXCEPCION";
export type ServiceRecord = { username: string; state: ServiceState; panel: Panel | null; expiration: string | null; baseRow: number | null; note?: string };

export type ReconDataset = {
  cut: string;
  generatedAt: string;
  cases: ReconCase[];
  tasks: AdvisorTask[];
  services: ServiceRecord[];
};

export type ReconDecision = { id: number; caseId: string; fingerprint: string; option: string; by: string; at: string; supersedes: number | null; reason: string | null };
export type TaskAction = "EJECUTADO" | "NO_SE_PUEDE";
export type TaskEvent = { id: number; taskId: string; action: TaskAction; by: string; at: string; note: string | null };

export type CaseView = ReconCase & {
  status: "PENDIENTE" | "DECIDIDO" | "CONSOLIDADO";
  decision: ReconDecision | null;
  history: ReconDecision[];
  chosen: ReconOption | null;
  residualTasks: string[];
};

export type TaskView = AdvisorTask & { status: "PENDIENTE" | "NO_SE_PUEDE" | "EJECUTADO"; events: TaskEvent[] };

export type ReconProjection = {
  cut: string;
  cases: CaseView[];
  tasks: TaskView[];
  /** Líneas liberadas por el Asesor: quedan DISPONIBLES para reasignación. */
  available: Array<{ username: string; line: ReconLine; by: string; at: string }>;
  /** Cambios que las decisiones exigen en BASE GENERAL y que aún deben escribirse/validarse en la fuente. */
  baseSync: Array<BaseUpdate & { caseId: string; username: string; decidedAt: string }>;
  services: Record<ServiceState, number> & { total: number };
};

export function residualTaskId(caseId: string, line: ReconLine) {
  return `LIBERAR:${caseId}:${line.panel}:${line.lineId}`;
}

/** Última decisión válida por caso (la cadena supersedes conserva la trazabilidad completa). */
function currentDecision(history: ReconDecision[]) {
  return history.length ? history[history.length - 1] : null;
}

export function projectReconciliation(dataset: ReconDataset, decisions: ReconDecision[], events: TaskEvent[]): ReconProjection {
  const eventsByTask = new Map<string, TaskEvent[]>();
  for (const e of events) eventsByTask.set(e.taskId, [...(eventsByTask.get(e.taskId) ?? []), e]);
  const taskStatus = (id: string): TaskView["status"] => {
    const list = eventsByTask.get(id) ?? [];
    if (list.some((e) => e.action === "EJECUTADO")) return "EJECUTADO";
    return list.length ? "NO_SE_PUEDE" : "PENDIENTE";
  };

  const generated: AdvisorTask[] = [];
  const baseSync: ReconProjection["baseSync"] = [];
  const cases: CaseView[] = dataset.cases.map((c) => {
    const history = decisions.filter((d) => d.caseId === c.id && d.fingerprint === c.fingerprint);
    const decision = currentDecision(history);
    const chosen = decision ? c.options.find((o) => o.id === decision.option) ?? null : null;
    const residualTasks: string[] = [];
    if (chosen) {
      if (c.kind === "MULTIPANEL" && chosen.keep) {
        for (const line of c.lines.filter((l) => l.panel !== chosen.keep)) {
          const id = residualTaskId(c.id, line);
          residualTasks.push(id);
          generated.push({
            id, kind: "LIBERAR", username: c.username, caseId: c.id, keepPanel: chosen.keep, releasePanel: line.panel, line,
            title: `LIBERAR ${PANEL_LABEL[line.panel]} — ${c.username}`,
            instruction: `Liberar en ${PANEL_LABEL[line.panel]} la línea ID ${line.lineId} (fila ${line.row} del corte, vence ${line.expiration}). Se conserva ${PANEL_LABEL[chosen.keep]}.`,
            evidence: `Decisión ${decision!.by} · ${decision!.at}: conservar ${PANEL_LABEL[chosen.keep]}.`,
          });
        }
      }
      chosen.tasks?.forEach((t, i) => {
        const id = `${c.id}:OPCION:${chosen.id}:${i}`;
        residualTasks.push(id);
        generated.push({ id, username: c.username, caseId: c.id, title: `${t.kind.replace("_", " ")} — ${c.username}`, ...t });
      });
      for (const u of chosen.baseUpdates) baseSync.push({ ...u, caseId: c.id, username: c.username, decidedAt: decision!.at });
    }
    const consolidated = chosen != null && residualTasks.every((id) => taskStatus(id) === "EJECUTADO");
    return { ...c, status: chosen ? (consolidated ? "CONSOLIDADO" : "DECIDIDO") : "PENDIENTE", decision, history, chosen, residualTasks };
  });

  const tasks: TaskView[] = [...dataset.tasks, ...generated].map((t) => ({ ...t, status: taskStatus(t.id), events: eventsByTask.get(t.id) ?? [] }));
  const available = tasks
    .filter((t) => t.kind === "LIBERAR" && t.status === "EJECUTADO" && t.line)
    .map((t) => {
      const done = t.events.find((e) => e.action === "EJECUTADO")!;
      return { username: t.username, line: t.line!, by: done.by, at: done.at };
    });

  // Estado operacional: un caso multipanel resuelto y consolidado deja de ser excepción.
  const closed = new Set(cases.filter((c) => c.status === "CONSOLIDADO").map((c) => c.username));
  const counts = { ACTIVO: 0, INACTIVO: 0, EXCEPCION: 0, total: 0 };
  for (const s of dataset.services) {
    const state: ServiceState = s.state === "EXCEPCION" && closed.has(s.username) ? "ACTIVO" : s.state;
    counts[state] += 1;
    counts.total += 1;
  }
  return { cut: dataset.cut, cases, tasks, available, baseSync, services: counts };
}

/** Valida una decisión contra el caso antes de guardarla. Devuelve el mensaje de error o null. */
export function validateDecision(c: ReconCase | undefined, option: string, fingerprint: string, previous: ReconDecision | null, supersedes: number | null, reason: string | null, executedResiduals: boolean) {
  if (!c) return "Caso inexistente.";
  if (fingerprint !== c.fingerprint) return "El caso cambió desde que se cargó: recargue antes de decidir.";
  if (!c.options.some((o) => o.id === option)) return "Opción no válida para este caso.";
  if (previous) {
    if (supersedes !== previous.id) return "Este caso ya tiene una decisión bloqueada. Para cambiarla, registre una corrección que referencie la decisión vigente.";
    if (!reason || reason.trim().length < 5) return "La corrección exige el motivo.";
    if (executedResiduals) return "No se puede corregir: el Asesor ya liberó líneas según la decisión vigente.";
    if (previous.option === option) return "La corrección debe elegir una opción distinta.";
  } else if (supersedes != null) return "No hay decisión previa que corregir.";
  return null;
}
