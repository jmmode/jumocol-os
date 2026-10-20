import { PageHeader } from "@/components/ui/page-header";
import { AREA_CATALOG } from "@/config/areas";
import { SystemFlow } from "@/features/technology-ai/system-flow";
import { TechnologyStatusBadge } from "@/features/technology-ai/technology-status-badge";
import type {
  ArchitectureLayer,
  RoadmapGroup,
  TechnologyAiSnapshot,
  TechnologyStatus,
} from "@/features/technology-ai/types";

type TechnologyAiDashboardProps = {
  snapshot: TechnologyAiSnapshot;
};

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

const roadmapClasses: Record<RoadmapGroup["id"], string> = {
  done: "border-brand-green/35 bg-brand-green/8",
  "in-validation": "border-brand-yellow/45 bg-brand-yellow/10",
  next: "border-brand-blue/30 bg-brand-blue-soft",
  future: "border-brand-border bg-brand-surface",
};

const roadmapMarkerClasses: Record<RoadmapGroup["id"], string> = {
  done: "bg-brand-green text-white",
  "in-validation": "bg-brand-yellow text-brand-text",
  next: "bg-brand-primary text-white",
  future: "bg-brand-graphite text-white",
};

function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl" id={id}>{title}</h2>
      <p className="mt-3 text-sm leading-6 text-brand-muted">{description}</p>
    </div>
  );
}

function toFlowSteps(prefix: string, steps: readonly string[]): readonly ArchitectureLayer[] {
  return steps.map((step, index) => ({
    id: `${prefix}-${index}`,
    label: step,
    detail: index === steps.length - 1 ? "Salida del flujo" : "Transferencia controlada",
  }));
}

function getStatusCount(snapshot: TechnologyAiSnapshot, status: TechnologyStatus): number {
  return snapshot.integrations.filter((integration) => integration.status === status).length;
}

export function TechnologyAiDashboard({ snapshot }: TechnologyAiDashboardProps) {
  const operationalAreas = AREA_CATALOG.slice(0, 3);
  const marketingArea = AREA_CATALOG[3];
  const technologyArea = AREA_CATALOG[4];
  const primaryFlow = snapshot.flows[0];
  const futureFlows = snapshot.flows.slice(1);

  return (
    <div>
      <PageHeader
        badge={snapshot.source.label}
        description="Centro técnico para comprender la arquitectura, las fuentes, las integraciones, las decisiones vigentes y la evolución controlada de JUMOCOL Operations Intelligence."
        eyebrow="Área 05 · Arquitectura y continuidad"
        title="Tecnología & Inteligencia Artificial"
      />

      <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-brand-blue/25 bg-brand-blue-soft px-5 py-4 text-xs text-brand-primary-dark sm:flex-row sm:items-center sm:justify-between">
        <span className="font-bold">{snapshot.source.disclosure}</span>
        <span className="shrink-0 font-black uppercase tracking-[0.12em] text-status-info">
          Documento {snapshot.source.canonicalDocument}
        </span>
      </aside>

      <nav
        aria-label="Secciones de Tecnología e IA"
        className="mt-5 flex snap-x snap-proximity gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:snap-none lg:overflow-x-visible lg:pb-0"
      >
        {[
          ["overview", "Overview"],
          ["stack", "Stack"],
          ["architecture", "Arquitectura"],
          ["integrations", "Integraciones"],
          ["flows", "Flujos E2E"],
          ["decisions", "Decisiones"],
          ["ai", "IA"],
          ["roadmap", "Roadmap"],
        ].map(([href, label]) => (
          <a
            className="shrink-0 snap-start rounded-full border border-brand-border bg-brand-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted transition hover:border-brand-primary hover:text-brand-primary"
            href={`#${href}`}
            key={href}
          >
            {label}
          </a>
        ))}
      </nav>

      <section className="mt-8 scroll-mt-44 lg:scroll-mt-28" id="overview" aria-labelledby="overview-title">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <article className="relative overflow-hidden rounded-[2rem] bg-brand-primary-dark p-7 text-white shadow-[var(--brand-shadow)] sm:p-9">
            <div className="absolute -top-24 -right-20 size-64 rounded-full bg-brand-cyan/10 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Technology overview</p>
                <TechnologyStatusBadge status={snapshot.overview.status} label={snapshot.overview.statusLabel} />
              </div>
              <h2 id="overview-title" className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Arquitectura visible antes de automatizar
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70">
                Operations Intelligence organiza lectura, contexto y seguimiento. La lógica permanece desacoplada de Google Sheets y las decisiones críticas conservan aprobación humana.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["Actualización", snapshot.overview.lastUpdated],
                  ["Entorno", snapshot.overview.environment],
                  ["Arquitectura", snapshot.overview.architecture],
                ].map(([label, value]) => (
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4" key={label}>
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-cyan/75">{label}</p>
                    <p className="mt-2 text-sm font-semibold leading-5 text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-brand-border bg-brand-background p-7 shadow-[var(--brand-shadow)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Estado de integraciones</p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Operativas", getStatusCount(snapshot, "ACTIVE") + getStatusCount(snapshot, "VALIDATED"), "text-status-success"],
                ["Validación", getStatusCount(snapshot, "IN VALIDATION"), "text-status-warning"],
                ["Planeadas", getStatusCount(snapshot, "PLANNED"), "text-brand-muted"],
              ].map(([label, value, tone]) => (
                <div className="rounded-2xl bg-brand-surface p-4 text-center" key={label}>
                  <dt className="text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted">{label}</dt>
                  <dd className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-brand-border pt-5">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">Milestone actual</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-brand-text">{snapshot.overview.currentMilestone}</p>
              <p className="mt-3 text-xs leading-5 text-brand-muted">
                La intranet continúa local. Ningún agente autónomo ni Write Model fue activado en esta iteración.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="stack" aria-labelledby="stack-title">
        <SectionHeading
          eyebrow="Technology stack"
          id="stack-title"
          title="Capas implementadas y límites reales"
          description="El stack describe el estado existente; no presenta como productiva una capacidad que todavía está planeada."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {snapshot.stack.map((group) => (
            <article className="rounded-3xl border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)]" key={group.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-[-0.025em] text-brand-text">{group.title}</h3>
                <TechnologyStatusBadge status={group.status} />
              </div>
              <p className="mt-3 text-xs leading-5 text-brand-muted">{group.description}</p>
              <ul className="mt-5 space-y-2.5">
                {group.items.map((item) => (
                  <li className="flex gap-3 text-sm leading-5 text-brand-graphite" key={item}>
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="architecture" aria-labelledby="architecture-title">
        <SectionHeading
          eyebrow="System architecture"
          id="architecture-title"
          title="Del canal a la decisión"
          description="Cada capa tiene una responsabilidad separada para poder sustituir proveedores sin reconstruir el dominio o la interfaz."
        />
        <div className="mt-6">
          <SystemFlow ariaLabel="Arquitectura técnica por capas" steps={snapshot.architectureLayers} />
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <article className="rounded-[2rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Mapa funcional</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">JUMOCOL Operating System</h3>
              </div>
              <span className="rounded-full bg-brand-surface px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted">
                Coordinación · no dependencia técnica
              </span>
            </div>

            <div className="mt-6 text-center">
              <div className="rounded-2xl bg-brand-primary-dark px-5 py-4 text-sm font-semibold text-white">JUMOCOL / Operations Intelligence</div>
              <div aria-hidden="true" className="py-2 font-bold text-brand-primary">↓</div>
              <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue-soft px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-brand-primary-dark">General / Governance</div>
              <div aria-hidden="true" className="py-2 font-bold text-brand-primary">↓</div>
              <div className="grid gap-2 sm:grid-cols-3">
                {operationalAreas.map((area) => (
                  <div className="rounded-2xl border border-brand-border bg-brand-surface px-3 py-4 text-xs font-semibold text-brand-graphite" key={area.id}>
                    {area.shortLabel}
                  </div>
                ))}
              </div>
              {[marketingArea.label, technologyArea.label].map((label) => (
                <div key={label}>
                  <div aria-hidden="true" className="py-2 font-bold text-brand-primary">↓</div>
                  <div className="rounded-2xl border border-brand-border bg-brand-background px-5 py-3 text-sm font-semibold text-brand-text">{label}</div>
                </div>
              ))}
              <div aria-hidden="true" className="py-2 font-bold text-brand-primary">↓</div>
              <div className="rounded-2xl border border-dashed border-brand-yellow bg-brand-yellow/10 px-5 py-3">
                <p className="text-sm font-semibold text-brand-text">Orchestration</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-status-warning">Target · Not implemented</p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] bg-brand-primary-dark p-6 text-white shadow-[var(--brand-shadow)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">Read model / Write model</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Fronteras explícitas</h3>

            <div className="mt-6 rounded-2xl border border-brand-green/30 bg-brand-green/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">Read Model</h4>
                <TechnologyStatusBadge status="ACTIVE" label="Implementado / MVP" />
              </div>
              <p className="mt-3 text-xs leading-5 text-white/70">{snapshot.readModelSteps.join(" → ")}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/12 bg-white/6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">Write Model</h4>
                <TechnologyStatusBadge status="PLANNED" />
              </div>
              <p className="mt-3 text-xs leading-5 text-white/70">{snapshot.writeModelSteps.join(" → ")}</p>
            </div>

            <p className="mt-5 text-xs leading-5 text-white/65">
              La UI no escribe arbitrariamente sobre celdas. Las futuras mutaciones entrarán por comandos controlados, permisos y auditoría.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="integrations" aria-labelledby="integrations-title">
        <SectionHeading
          eyebrow="Integration map"
          id="integrations-title"
          title="Sistemas conectados y fronteras de validación"
          description="Los estados son explícitos y se apoyan en evidencia disponible; una intención de integración no se presenta como conexión activa."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {snapshot.integrations.map((integration) => (
            <article className="rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)]" key={integration.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-brand-text">{integration.name}</h3>
                <TechnologyStatusBadge status={integration.status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-graphite">{integration.role}</p>
              <p className="mt-4 border-t border-brand-border pt-4 text-xs leading-5 text-brand-muted">{integration.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="flows" aria-labelledby="flows-title">
        <SectionHeading
          eyebrow="E2E flows"
          id="flows-title"
          title="Flujos técnicos verificables"
          description="Cada flujo conserva identificador, estado y evidencia. Los registros del primer flujo son QA interno y no equivalen a oportunidades comerciales externas."
        />

        <article className="mt-6 rounded-[2rem] border border-brand-green/40 bg-brand-green/8 p-6 shadow-[var(--brand-shadow)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-status-success">{primaryFlow.id}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-brand-text">{primaryFlow.name}</h3>
              <p className="mt-3 text-sm leading-6 text-brand-muted">{primaryFlow.description}</p>
            </div>
            <TechnologyStatusBadge status={primaryFlow.status} label={primaryFlow.statusDetail} />
          </div>
          <div className="mt-6">
            <SystemFlow ariaLabel={`Flujo ${primaryFlow.id}`} compact steps={toFlowSteps(primaryFlow.id, primaryFlow.steps)} />
          </div>
        </article>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {futureFlows.map((flow) => (
            <article className="rounded-3xl border border-brand-border bg-brand-background p-6" key={flow.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-primary">{flow.id}</p>
                  <h3 className="mt-2 text-lg font-semibold text-brand-text">{flow.name}</h3>
                </div>
                <TechnologyStatusBadge status={flow.status} />
              </div>
              <p className="mt-3 text-xs leading-5 text-brand-muted">{flow.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-brand-primary-dark">
                {flow.steps.map((step, index) => (
                  <div className="contents" key={`${flow.id}-${step}`}>
                    <span className="rounded-full bg-brand-blue-soft px-3 py-2">{step}</span>
                    {index < flow.steps.length - 1 ? <span aria-hidden="true">→</span> : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="decisions" aria-labelledby="decisions-title">
        <SectionHeading
          eyebrow="Architecture decisions"
          id="decisions-title"
          title="Decisiones cerradas que protegen la evolución"
          description="Estas reglas son límites de diseño vigentes y deben revisarse antes de introducir una nueva fuente, escritura o agente."
        />
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {snapshot.decisions.map((decision) => (
            <li className="flex gap-4 rounded-2xl border border-brand-border bg-brand-background p-5" key={decision.id}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-dark text-[9px] font-black text-brand-cyan">
                {decision.id.replace("AD-", "")}
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">{decision.id}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-brand-text">{decision.statement}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="ai" aria-labelledby="ai-title">
        <SectionHeading
          eyebrow="AI architecture"
          id="ai-title"
          title="Evolución gobernada hacia agentes supervisados"
          description="La arquitectura objetivo se documenta para definir límites. No representa agentes implementados ni autorización de ejecución autónoma."
        />

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <article className="rounded-[2rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Niveles de madurez</p>
            <ol className="mt-5 space-y-3">
              {snapshot.aiMaturity.map((level) => (
                <li
                  className={
                    level.current
                      ? "rounded-2xl border border-brand-green/40 bg-brand-green/10 p-4"
                      : "rounded-2xl border border-brand-border bg-brand-surface p-4"
                  }
                  key={level.level}
                >
                  <div className="flex items-center gap-3">
                    <span className={level.current ? "flex size-8 items-center justify-center rounded-full bg-brand-green text-[10px] font-black text-white" : "flex size-8 items-center justify-center rounded-full bg-brand-background text-[10px] font-black text-brand-muted"}>
                      {level.level}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-text">{level.name}</p>
                      <p className="mt-1 text-xs leading-5 text-brand-muted">{level.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] bg-brand-primary-dark p-6 text-white shadow-[var(--brand-shadow)] sm:p-8">
            <div className="absolute -right-20 -bottom-24 size-64 rounded-full bg-brand-cyan/10 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">Target architecture</p>
                <span className="rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-brand-yellow">
                  Not implemented
                </span>
              </div>

              <div className="mt-6 text-center">
                <div className="rounded-2xl border border-white/12 bg-white/8 px-5 py-4 text-sm font-semibold">JUMOCOL Command Center</div>
                <div aria-hidden="true" className="py-2 font-bold text-brand-cyan">↓</div>
                <div className="rounded-2xl bg-brand-cyan px-5 py-4 text-sm font-semibold text-brand-primary-dark">AI Orchestrator</div>
                <div aria-hidden="true" className="py-2 font-bold text-brand-cyan">↓</div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {snapshot.targetAgents.map((agent) => (
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-xs font-semibold text-white/85" key={agent.id}>
                      {agent.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-cyan/75">Contrato mínimo por agente</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {snapshot.agentContract.map((item) => (
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[10px] text-white/70" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-12 scroll-mt-44 lg:scroll-mt-28" id="roadmap" aria-labelledby="roadmap-title">
        <SectionHeading
          eyebrow="Technology roadmap"
          id="roadmap-title"
          title="Hecho, en validación, siguiente y futuro"
          description="El roadmap separa evidencia existente de próximos contratos y objetivos de largo plazo para evitar automatización prematura."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {snapshot.roadmap.map((group) => (
            <article className={`rounded-3xl border p-6 ${roadmapClasses[group.id]}`} key={group.id}>
              <div className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${roadmapMarkerClasses[group.id]}`} />
                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-brand-text">{group.label}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li className="flex gap-3 text-sm leading-5 text-brand-graphite" key={item}>
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
