import crypto from "node:crypto";

const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value).toLocaleUpperCase("es");

export function parseOperationalDate(value) {
  const s = clean(value);
  if (!s) return null;

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (!m) return null;

  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

export function monthBounds(targetMonth) {
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    throw new Error(`targetMonth must be YYYY-MM, received: ${targetMonth}`);
  }
  const [year, month] = targetMonth.split("-").map(Number);
  const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${targetMonth}-01`,
    end: `${targetMonth}-${String(endDay).padStart(2, "0")}`,
  };
}

export function weekBucket(isoDate) {
  const day = Number(isoDate.slice(-2));
  if (day <= 4) return 1;
  if (day <= 11) return 2;
  if (day <= 18) return 3;
  if (day <= 25) return 4;
  return 5;
}

export function normalizeHeaders(row) {
  const map = new Map();
  row.forEach((value, index) => {
    const key = canon(value).replace(/\s+/g, " ");
    if (key) map.set(key, index);
  });
  return map;
}

function findHeaderRow(rows) {
  const required = ["TC", "CLIENTE"];
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const headers = normalizeHeaders(rows[i] ?? []);
    if (required.every((key) => headers.has(key))) return i;
  }
  throw new Error("Header row not found");
}

function findColumn(headers, aliases) {
  for (const alias of aliases) {
    const key = canon(alias).replace(/\s+/g, " ");
    if (headers.has(key)) return headers.get(key);
  }
  return null;
}

function valueAt(row, index) {
  return index == null ? "" : clean(row[index]);
}

function identityKey(row, cols) {
  return [
    valueAt(row, cols.usuario),
    valueAt(row, cols.cliente),
    valueAt(row, cols.telefono) || valueAt(row, cols.correo),
    valueAt(row, cols.panel),
  ].map(canon).join("|");
}

export function buildMonthlyClose(rows, targetMonth) {
  const headerRowIndex = findHeaderRow(rows);
  const headers = normalizeHeaders(rows[headerRowIndex] ?? []);

  const cols = {
    tc: findColumn(headers, ["TC"]),
    cliente: findColumn(headers, ["CLIENTE"]),
    telefono: findColumn(headers, ["TELEFONO"]),
    correo: findColumn(headers, ["CORREO"]),
    usuario: findColumn(headers, ["USUARIO"]),
    panel: findColumn(headers, ["PANEL"]),
    proximoPago: findColumn(headers, ["F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"]),
  };

  if (cols.tc == null || cols.proximoPago == null) {
    throw new Error("Required columns TC and F. PRÓXIMO PAGO were not found");
  }

  const { start, end } = monthBounds(targetMonth);
  const selected = [];
  const exceptions = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    if (clean(row[cols.tc]) !== "1") continue;

    const rawDate = valueAt(row, cols.proximoPago);
    const date = parseOperationalDate(rawDate);

    if (!date) {
      if (rawDate) {
        exceptions.push({ row: i + 1, type: "INVALID_NEXT_PAYMENT_DATE" });
      }
      continue;
    }

    if (date < start || date > end) continue;

    selected.push({
      sourceRow: i + 1,
      client: valueAt(row, cols.cliente),
      nextPaymentDate: date,
      identity: identityKey(row, cols),
    });
  }

  const duplicateMap = new Map();
  for (const item of selected) {
    if (!item.identity.replace(/\|/g, "")) continue;
    if (!duplicateMap.has(item.identity)) duplicateMap.set(item.identity, []);
    duplicateMap.get(item.identity).push(item.sourceRow);
  }

  const duplicates = [...duplicateMap.entries()]
    .filter(([, sourceRows]) => sourceRows.length > 1)
    .map(([identity, sourceRows]) => ({ identityHash: sha256(identity), sourceRows }));

  const weeks = [0, 0, 0, 0, 0];
  selected.forEach((item) => weeks[weekBucket(item.nextPaymentDate) - 1]++);

  const stableRows = selected
    .map((item) => ({
      sourceRow: item.sourceRow,
      nextPaymentDate: item.nextPaymentDate,
      identityHash: sha256(item.identity),
    }))
    .sort((a, b) => a.sourceRow - b.sourceRow);

  const signature = sha256(JSON.stringify(stableRows));

  return {
    targetMonth,
    total: selected.length,
    weeks,
    duplicates,
    exceptions,
    signature,
  };
}

export function compareRuns(a, b) {
  return {
    identical: a.signature === b.signature,
    sameCount: a.total === b.total,
    sameWeeks: JSON.stringify(a.weeks) === JSON.stringify(b.weeks),
  };
}

export function validateOracle(result, expectedCount, expectedWeeks) {
  const errors = [];
  if (expectedCount != null && result.total !== expectedCount) {
    errors.push(`Expected count ${expectedCount}, got ${result.total}`);
  }
  if (expectedWeeks && JSON.stringify(result.weeks) !== JSON.stringify(expectedWeeks)) {
    errors.push(`Expected weeks ${expectedWeeks.join(",")}, got ${result.weeks.join(",")}`);
  }
  return { valid: errors.length === 0, errors };
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
