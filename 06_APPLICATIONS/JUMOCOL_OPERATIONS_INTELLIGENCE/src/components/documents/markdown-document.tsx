import { Fragment, type ReactNode } from "react";
import { CopyableMessage } from "./copyable-message";
import { headingIdAllocator } from "./section-search";

type MarkdownDocumentProps = {
  markdown: string;
};

const STATUS_CLASSES: Readonly<Record<string, string>> = {
  VALIDADO: "border-brand-green/35 bg-brand-green/10 text-status-success",
  "PENDIENTE DE VALIDACIÓN": "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
  CONTRADICTORIO: "border-brand-red/30 bg-brand-red/8 text-status-error",
  "NO DOCUMENTADO": "border-brand-border bg-brand-surface text-brand-muted",
  "DRAFT — IN REVIEW": "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
  "IN VALIDATION": "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
};

function renderCode(value: string, key: string): ReactNode {
  const statusClass = STATUS_CLASSES[value];
  if (statusClass) {
    return (
      <span className={`mx-0.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${statusClass}`} key={key}>
        {value}
      </span>
    );
  }

  return <code className="rounded bg-brand-surface px-1.5 py-0.5 text-[0.88em] text-brand-primary-dark" key={key}>{value}</code>;
}

function renderInline(value: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(value)) !== null) {
    if (match.index > cursor) nodes.push(value.slice(cursor, match.index));
    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("**")) {
      nodes.push(<strong className="font-semibold text-brand-text" key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(renderCode(token.slice(1, -1), key));
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = link?.[2] ?? "";
      const safeHref = /^(https?:\/\/|#|\/)/.test(href) ? href : undefined;
      nodes.push(
        safeHref ? (
          <a className="font-semibold text-brand-primary underline decoration-brand-cyan underline-offset-4" href={safeHref} key={key}>{link?.[1]}</a>
        ) : (
          <span key={key}>{link?.[1]}</span>
        ),
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function splitTableRow(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return (
    /^#{1,4}\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^(?:[-*]\s+|\d+\.\s+)/.test(line) ||
    /^---+$/.test(line.trim()) ||
    (line.includes("|") && isTableSeparator(next))
  );
}

export function MarkdownDocument({ markdown }: MarkdownDocumentProps) {
  const lines = markdown.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  const allocateId = headingIdAllocator();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const label = heading[2].trim();
      if (level === 1 && blocks.length === 0) {
        index += 1;
        continue;
      }
      const id = allocateId(label);
      const className = level === 2
        ? "mt-12 scroll-mt-28 border-t border-brand-border pt-8 text-2xl font-semibold tracking-[-0.035em] text-brand-text sm:text-3xl"
        : "mt-8 scroll-mt-28 text-xl font-semibold tracking-[-0.025em] text-brand-text";
      const content = renderInline(label);
      blocks.push(level === 2 ? <h2 className={className} id={id} key={id}>{content}</h2> : <h3 className={className} id={id} key={id}>{content}</h3>);
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      // ```mensaje: plantilla o dato de uso frecuente, legible en móvil y con botón Copiar.
      const copyable = /^```mensaje\s*$/.test(line);
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      if (copyable) { blocks.push(<CopyableMessage key={`message-${index}`} text={code.join("\n").trim()} />); continue; }
      blocks.push(<pre className="mt-5 overflow-x-auto rounded-2xl bg-brand-primary-dark p-5 text-xs leading-6 text-white" key={`code-${index}`}><code>{code.join("\n")}</code></pre>);
      continue;
    }

    if (line.includes("|") && isTableSeparator(lines[index + 1] ?? "")) {
      const header = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border" key={`table-${index}`}>
          <table className="w-full min-w-[680px] border-collapse text-left text-xs leading-5">
            <thead className="bg-brand-primary-dark text-white"><tr>{header.map((cell, cellIndex) => <th className="px-4 py-3 font-bold" key={cellIndex}>{renderInline(cell)}</th>)}</tr></thead>
            <tbody className="divide-y divide-brand-border bg-brand-background">{rows.map((row, rowIndex) => <tr className="align-top" key={rowIndex}>{header.map((_, cellIndex) => <td className="px-4 py-3 text-brand-graphite" key={cellIndex}>{renderInline(row[cellIndex] ?? "")}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[2]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
        if (!item || /\d+\./.test(item[2]) !== ordered) break;
        items.push(item[3]);
        index += 1;
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(<ListTag className={`mt-4 space-y-2 pl-6 text-sm leading-6 text-brand-graphite ${ordered ? "list-decimal" : "list-disc"}`} key={`list-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ListTag>);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(<blockquote className="mt-5 rounded-r-2xl border-l-4 border-brand-primary bg-brand-blue-soft px-5 py-4 text-sm font-semibold leading-6 text-brand-primary-dark" key={`quote-${index}`}>{renderInline(quote.join(" "))}</blockquote>);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr className="my-8 border-brand-border" key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p className="mt-4 text-sm leading-7 text-brand-graphite" key={`paragraph-${index}`}>{paragraph.map((part, partIndex) => <Fragment key={partIndex}>{partIndex > 0 ? " " : null}{renderInline(part)}</Fragment>)}</p>);
  }

  return <div>{blocks}</div>;
}

