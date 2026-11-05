import type { ReactNode } from "react";

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ eyebrow, title, description, action, children, className = "" }: SectionCardProps) {
  return (
    <section className={`min-w-0 rounded-3xl border border-brand-border bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-brand-text">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-brand-muted">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "blue" | "green" | "yellow" | "red" | "cyan";
}) {
  const toneClass = {
    blue: "border-brand-blue/25 bg-brand-blue-soft text-brand-primary-dark",
    green: "border-brand-green/35 bg-brand-green/10 text-status-success",
    yellow: "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
    red: "border-brand-red/25 bg-brand-red/5 text-status-error",
    cyan: "border-brand-cyan bg-brand-cyan/15 text-brand-primary-dark",
  }[tone];

  return (
    <article className={`min-w-0 rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.14em] opacity-75">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tracking-[-0.035em] tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] leading-4 opacity-70">{detail}</p>
    </article>
  );
}

export type BarDatum = {
  key: string;
  label: string;
  value: number;
  secondary?: string;
};

export function InteractiveBarList({
  data,
  formatValue,
  onSelect,
  activeKey,
  emptyLabel = "No hay datos para el filtro actual.",
}: {
  data: BarDatum[];
  formatValue: (value: number) => string;
  onSelect: (key: string) => void;
  activeKey?: string;
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 0);
  if (!data.length) return <EmptyChart label={emptyLabel} />;

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <button
          key={item.key}
          aria-pressed={activeKey === item.key}
          className="group w-full rounded-2xl border border-transparent p-2 text-left transition hover:border-brand-blue/30 hover:bg-brand-blue-soft/40 aria-pressed:border-brand-blue aria-pressed:bg-brand-blue-soft"
          onClick={() => onSelect(item.key)}
          title={`Filtrar por ${item.label}: ${formatValue(item.value)}`}
          type="button"
        >
          <span className="flex items-end justify-between gap-3 text-xs">
            <span className="min-w-0 truncate font-semibold text-brand-graphite">{item.label}</span>
            <span className="shrink-0 font-bold tabular-nums text-brand-primary-dark">{formatValue(item.value)}</span>
          </span>
          <span className="mt-2 block h-2 overflow-hidden rounded-full bg-brand-surface">
            <span
              className="block h-full rounded-full bg-brand-primary transition-[width] duration-300 group-hover:bg-brand-primary-dark"
              style={{ width: `${max ? Math.max(2, (item.value / max) * 100) : 0}%` }}
            />
          </span>
          {item.secondary ? <span className="mt-1 block text-[10px] text-brand-muted">{item.secondary}</span> : null}
        </button>
      ))}
    </div>
  );
}

export type DailyDatum = {
  date: string;
  total: number;
  segments: Array<{ method: string; value: number }>;
};

export function DailyRevenueChart({
  data,
  goal,
  formatValue,
  onSelect,
  activeDate,
}: {
  data: DailyDatum[];
  goal: number;
  formatValue: (value: number) => string;
  onSelect: (date: string, method: string) => void;
  activeDate?: string;
}) {
  if (!data.length) return <EmptyChart label="No hay pagos USD confirmados con fecha para construir la serie." />;
  const max = Math.max(goal, ...data.map((item) => item.total), 1);
  const goalPosition = 100 - (goal / max) * 100;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative min-w-[620px] pt-7">
        <div
          aria-label={`Meta diaria ${formatValue(goal)}`}
          className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-brand-red/70"
          style={{ top: `${28 + (goalPosition / 100) * 210}px` }}
        >
          <span className="absolute -top-5 right-0 text-[9px] font-black uppercase tracking-[0.12em] text-status-error">
            Meta {formatValue(goal)}
          </span>
        </div>
        <div className="flex h-56 items-end gap-2 border-b border-brand-border px-1">
          {data.map((day) => (
            <div key={day.date} className="flex h-full min-w-8 flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-[9px] font-bold tabular-nums text-brand-muted">{formatValue(day.total)}</span>
              <div
                className={`flex w-full flex-col-reverse overflow-hidden rounded-t-lg ring-offset-2 ${activeDate === day.date ? "ring-2 ring-brand-primary" : ""}`}
                style={{ height: `${Math.max(2, (day.total / max) * 86)}%` }}
              >
                {day.segments.map((segment, index) => (
                  <button
                    key={`${day.date}-${segment.method}`}
                    aria-label={`${day.date}, ${segment.method}, ${formatValue(segment.value)}. Aplicar filtro.`}
                    className={index % 3 === 0 ? "bg-brand-primary hover:bg-brand-primary-dark" : index % 3 === 1 ? "bg-brand-green hover:bg-status-success" : "bg-brand-yellow hover:bg-status-warning"}
                    onClick={() => onSelect(day.date, segment.method)}
                    style={{ height: `${day.total ? (segment.value / day.total) * 100 : 0}%`, minHeight: "3px" }}
                    title={`${day.date} · ${segment.method}: ${formatValue(segment.value)}`}
                    type="button"
                  />
                ))}
              </div>
              <span className="mt-2 truncate text-center text-[9px] font-semibold text-brand-muted">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComparisonBars({
  rows,
  formatValue,
  onSelect,
}: {
  rows: Array<{ key: string; label: string; expected: number; confirmed: number; pending: number }>;
  formatValue: (value: number) => string;
  onSelect: (key: string) => void;
}) {
  const max = Math.max(...rows.flatMap((row) => [row.expected, row.confirmed, row.pending]), 0);
  if (!rows.length) return <EmptyChart label="No hay periodos con facturación o recaudo para esta selección." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-brand-muted">
        <Legend color="bg-brand-primary" label="Esperado" />
        <Legend color="bg-brand-green" label="Confirmado" />
        <Legend color="bg-brand-yellow" label="Saldo" />
      </div>
      {rows.map((row) => (
        <button
          key={row.key}
          className="w-full rounded-2xl border border-brand-border p-3 text-left transition hover:border-brand-primary hover:bg-brand-blue-soft/30"
          onClick={() => onSelect(row.key)}
          type="button"
        >
          <span className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-brand-graphite">{row.label}</span>
            <span className="text-brand-muted">{row.expected ? `${Math.min(999, (row.confirmed / row.expected) * 100).toFixed(1)}%` : "Sin base"}</span>
          </span>
          <span className="mt-3 grid gap-1.5">
            {[
              ["bg-brand-primary", row.expected],
              ["bg-brand-green", row.confirmed],
              ["bg-brand-yellow", row.pending],
            ].map(([color, value]) => (
              <span key={String(color)} className="flex items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-brand-surface">
                  <span className={`block h-full rounded-full ${color}`} style={{ width: `${max ? (Number(value) / max) * 100 : 0}%` }} />
                </span>
                <span className="w-24 text-right text-[10px] font-semibold tabular-nums text-brand-muted">{formatValue(Number(value))}</span>
              </span>
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}

export function OperationalHeatmap({
  dates,
  advisors,
  values,
  formatValue,
  onSelect,
}: {
  dates: string[];
  advisors: string[];
  values: Record<string, number>;
  formatValue: (value: number) => string;
  onSelect: (date: string, advisor: string) => void;
}) {
  const max = Math.max(...Object.values(values), 0);
  if (!dates.length || !advisors.length) return <EmptyChart label="No hay fechas y asesores suficientes para construir el mapa de calor." />;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[640px]" style={{ display: "grid", gridTemplateColumns: `110px repeat(${dates.length}, minmax(34px, 1fr))` }}>
        <span />
        {dates.map((date) => <span key={date} className="pb-2 text-center text-[9px] font-bold text-brand-muted">{date.slice(5)}</span>)}
        {advisors.flatMap((advisor) => [
          <span key={`${advisor}-label`} className="flex items-center pr-2 text-[10px] font-bold text-brand-graphite">{advisor}</span>,
          ...dates.map((date) => {
            const key = `${date}|${advisor}`;
            const amount = values[key] ?? 0;
            const opacity = max ? 0.08 + (amount / max) * 0.82 : 0.05;
            return (
              <button
                key={key}
                aria-label={`${date}, ${advisor}: ${formatValue(amount)}. Aplicar filtros.`}
                className="m-0.5 aspect-square rounded-md border border-brand-primary/10 transition hover:scale-105 hover:border-brand-primary"
                onClick={() => onSelect(date, advisor)}
                style={{ backgroundColor: `rgba(0, 105, 181, ${opacity})` }}
                title={`${date} · ${advisor}: ${formatValue(amount)}`}
                type="button"
              />
            );
          }),
        ])}
      </div>
    </div>
  );
}

export function EmptyChart({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface/60 px-5 py-8 text-center text-xs leading-5 text-brand-muted">
      {label}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={`size-2.5 rounded-full ${color}`} />{label}</span>;
}
