"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { formatCurrency } from "@/features/tiviplay-payments/analytics";
import type { PaymentRecord } from "@/features/tiviplay-payments/domain";

export type PaymentColumnKey =
  | "date"
  | "client"
  | "status"
  | "plan"
  | "amount"
  | "method"
  | "advisor"
  | "origin"
  | "panel"
  | "reconciliation"
  | "observation"
  | "dueDate"
  | "nextPaymentDate";

type SortState = { key: PaymentColumnKey; direction: "asc" | "desc" };

const COLUMNS: Array<{ key: PaymentColumnKey; label: string }> = [
  { key: "date", label: "Fecha" },
  { key: "client", label: "Cliente" },
  { key: "status", label: "Estado" },
  { key: "plan", label: "Plan" },
  { key: "amount", label: "Valor / moneda" },
  { key: "method", label: "Método" },
  { key: "advisor", label: "Asesor" },
  { key: "origin", label: "Origen" },
  { key: "panel", label: "Panel" },
  { key: "reconciliation", label: "Conciliación" },
  { key: "observation", label: "Observación" },
  { key: "dueDate", label: "Vencimiento" },
  { key: "nextPaymentDate", label: "Próximo pago" },
];

const DEFAULT_VISIBLE = new Set<PaymentColumnKey>([
  "date",
  "client",
  "status",
  "plan",
  "amount",
  "method",
  "advisor",
  "origin",
  "panel",
  "reconciliation",
]);

export function PaymentsTable({
  records,
  onFilterClient,
}: {
  records: PaymentRecord[];
  onFilterClient: (clientLabel: string) => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("es-CO"));
  const [sort, setSort] = useState<SortState>({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [visible, setVisible] = useState<Set<PaymentColumnKey>>(() => new Set(DEFAULT_VISIBLE));
  const [detail, setDetail] = useState<PaymentRecord | null>(null);

  const filtered = useMemo(() => {
    const searched = deferredSearch
      ? records.filter((record) =>
          [
            record.date,
            record.clientLabel,
            record.status,
            record.plan,
            record.paymentMethod,
            record.advisor,
            record.origin,
            record.panel,
            record.reconciliationStatus,
            record.observation,
          ]
            .join(" ")
            .toLocaleLowerCase("es-CO")
            .includes(deferredSearch),
        )
      : records;
    return searched.toSorted((left, right) => {
      const result = sortableValue(left, sort.key).localeCompare(sortableValue(right, sort.key), "es", {
        numeric: true,
      });
      return sort.direction === "asc" ? result : -result;
    });
  }, [deferredSearch, records, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleColumns = COLUMNS.filter((column) => visible.has(column.key));

  function toggleColumn(key: PaymentColumnKey) {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function updateSort(key: PaymentColumnKey) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function exportCsv() {
    const csv = buildPaymentsCsv(filtered, visibleColumns);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiviplay-pagos-filtrados-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="min-w-[220px] flex-1">
          <span className="sr-only">Buscar en la tabla</span>
          <input
            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-brand-text placeholder:text-brand-muted"
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Buscar cliente enmascarado, método, asesor…"
            type="search"
            value={search}
          />
        </label>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-brand-graphite">
            Columnas ({visible.size})
          </summary>
          <div className="absolute left-0 right-auto z-20 mt-2 grid w-64 gap-2 rounded-2xl border border-brand-border bg-white p-4 shadow-[var(--brand-shadow)] sm:left-auto sm:right-0">
            {COLUMNS.map((column) => (
              <label key={column.key} className="flex items-center gap-2 text-xs text-brand-graphite">
                <input checked={visible.has(column.key)} onChange={() => toggleColumn(column.key)} type="checkbox" />
                {column.label}
              </label>
            ))}
          </div>
        </details>
        <button className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark" onClick={exportCsv} type="button">
          Exportar vista CSV
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-border">
        <table className="w-full min-w-[980px] border-collapse text-left text-xs">
          <thead className="bg-brand-surface text-brand-muted">
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} className="border-b border-brand-border px-3 py-3 font-black uppercase tracking-[0.08em]">
                  <button className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => updateSort(column.key)} type="button">
                    {column.label}
                    <span aria-hidden="true">{sort.key === column.key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                  </button>
                </th>
              ))}
              <th aria-label="Acciones" className="border-b border-brand-border px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <tr key={record.id} className="border-b border-brand-border/70 bg-white align-top last:border-b-0 hover:bg-brand-blue-soft/25">
                {visibleColumns.map((column) => (
                  <td key={column.key} className="max-w-56 px-3 py-3 text-brand-graphite">
                    {column.key === "status" ? <StatusBadge label={record.status} /> : column.key === "reconciliation" ? <StatusBadge label={record.reconciliationStatus} /> : cellText(record, column.key)}
                  </td>
                ))}
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button className="font-bold text-brand-primary hover:underline" onClick={() => onFilterClient(record.clientLabel)} type="button">Filtrar</button>
                    <button className="font-bold text-brand-primary-dark hover:underline" onClick={() => setDetail(record)} type="button">Detalle</button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr><td className="px-4 py-10 text-center text-brand-muted" colSpan={visibleColumns.length + 1}>Sin registros para la vista actual.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-muted">
        <span>{filtered.length} registros · página {currentPage} de {pageCount}</span>
        <div className="flex items-center gap-2">
          <label>Página:
            <select className="ml-2 rounded-lg border border-brand-border bg-white px-2 py-1" onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} value={pageSize}>
              {[10, 15, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <button className="rounded-lg border border-brand-border px-3 py-1 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Anterior</button>
          <button className="rounded-lg border border-brand-border px-3 py-1 disabled:opacity-40" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} type="button">Siguiente</button>
        </div>
      </div>

      {detail ? <RecordDetail record={detail} onClose={() => setDetail(null)} /> : null}
    </>
  );
}

function StatusBadge({ label }: { label: string }) {
  const tone = /Conciliado|Al día/.test(label)
    ? "bg-brand-green/10 text-status-success"
    : /Vencido|No conciliado/.test(label)
      ? "bg-brand-red/10 text-status-error"
      : "bg-brand-yellow/15 text-status-warning";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${tone}`}>{label}</span>;
}

function RecordDetail({ record, onClose }: { record: PaymentRecord; onClose: () => void }) {
  const fields = [
    ["Registro", record.id],
    ["Fecha", record.date ?? "Sin fecha"],
    ["Cliente", record.clientLabel],
    ["Valor", formatCurrency(record.amount, record.currency)],
    ["Evidencia", record.confirmationEvidence],
    ["Conciliación", record.reconciliationReason],
    ["Origen fuente", `${record.sourceSheet} · fila ${record.sourceRow}`],
    ["Banderas de calidad", record.qualityFlags.join(", ") || "Sin banderas"],
  ];
  return (
    <div aria-label="Detalle del registro" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-brand-primary-dark/55 p-4" role="dialog">
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[var(--brand-shadow)]">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">Trazabilidad</p><h3 className="mt-2 text-xl font-semibold text-brand-text">Detalle normalizado</h3></div>
          <button aria-label="Cerrar detalle" className="rounded-full border border-brand-border px-3 py-1 text-lg text-brand-muted" onClick={onClose} type="button">×</button>
        </div>
        <dl className="mt-5 grid gap-3">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-brand-surface p-3"><dt className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">{label}</dt><dd className="mt-1 break-words text-xs leading-5 text-brand-graphite">{value}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-[10px] leading-4 text-brand-muted">Los datos personales y credenciales no forman parte de este detalle.</p>
      </div>
    </div>
  );
}

function cellText(record: PaymentRecord, key: PaymentColumnKey): string {
  const values: Record<PaymentColumnKey, string> = {
    date: record.date ?? "Sin fecha",
    client: record.clientLabel,
    status: record.status,
    plan: record.plan,
    amount: formatCurrency(record.amount, record.currency),
    method: record.paymentMethod,
    advisor: record.advisor,
    origin: record.origin,
    panel: record.panel,
    reconciliation: record.reconciliationStatus,
    observation: record.observation || "—",
    dueDate: record.dueDate ?? "—",
    nextPaymentDate: record.nextPaymentDate ?? "—",
  };
  return values[key];
}

function sortableValue(record: PaymentRecord, key: PaymentColumnKey): string {
  if (key === "amount") return String(record.amount).padStart(20, "0");
  if (key === "date") return record.date ?? "";
  return cellText(record, key);
}

function csvSafe(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildPaymentsCsv(
  records: PaymentRecord[],
  columns: Array<{ key: PaymentColumnKey; label: string }>,
): string {
  const header = columns.map((column) => column.label);
  const rows = records.map((record) => columns.map((column) => csvSafe(cellText(record, column.key))));
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n")}`;
}
