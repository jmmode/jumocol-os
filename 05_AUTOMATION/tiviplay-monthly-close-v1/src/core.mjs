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

// Señales de cartera vencida (S0-B): solo subestado/revisión, nunca exclusión.
const CARTERA_SIGNALS = [
  ["USUARIO_LIBERADO", /LIBERAD/],
  ["DESACTIVADO", /DESACTIV/],
  ["NO_RENUEVA", /NO\s+RENUEV|NO\s+VA\s+RENOVAR|NO\s+RENOVAR/],
  ["MES_GRATIS", /MES\s+GRATIS/],
  ["EXCEPCION", /EXCEPCI[ÓO]N/],
  ["MIGRACION", /MIGRA/],
  ["CUENTA_UNIFICADA", /UNIFIC/],
];

function detectCarteraSignals({ status, observations, referredBy }) {
  const text = canon([status, observations, referredBy].filter(Boolean).join(" | "));
  return CARTERA_SIGNALS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

export function normalizeCutoffDate(value) {
  if (value == null || value === "") return null;
  const s = clean(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T00:00:00Z`))) {
    throw new Error(`cutoffDate must be YYYY-MM-DD, received: ${value}`);
  }
  return s;
}

function daysBetween(fromIso, toIso) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}

function classifyCandidate({ status, observations, referredBy }) {
  const text = canon([status, observations, referredBy].filter(Boolean).join(" | "));
  const reviewReasons = [];

  if (/NO\s+RENUEV|NO\s+VA\s+RENOVAR|NO\s+RENOVAR/.test(text)) {
    reviewReasons.push("POSSIBLE_NO_RENEWAL");
  }

  if (/MES\s+GRATIS|OTORGAR\s+MES\s+GRATIS|PDTE\s+MES\s+GRATIS|PENDIENTE\s+MES\s+GRATIS/.test(text)) {
    reviewReasons.push("POSSIBLE_FREE_MONTH");
  }

  if (/EXCEPCI[ÓO]N/.test(text)) {
    reviewReasons.push("EXPLICIT_EXCEPTION");
  }

  return {
    classification: reviewReasons.length ? "REQUIERE_REVISION" : "FACTURAR_CANDIDATO",
    reviewReasons,
  };
}

export function buildMonthlyClose(rows, targetMonth, options = {}) {
  // Fecha de corte explícita: el motor nunca usa la fecha de ejecución.
  const cutoffDate = normalizeCutoffDate(options.cutoffDate);
  const headerRowIndex = findHeaderRow(rows);
  const headers = normalizeHeaders(rows[headerRowIndex] ?? []);

  const cols = {
    tc: findColumn(headers, ["TC"]),
    cliente: findColumn(headers, ["CLIENTE"]),
    telefono: findColumn(headers, ["TELEFONO"]),
    correo: findColumn(headers, ["CORREO"]),
    estado: findColumn(headers, ["ESTADO"]),
    observaciones: findColumn(headers, ["OBSERVACIONES"]),
    plan: findColumn(headers, ["PLAN ACTIVO", "PLAN"]),
    pantallas: findColumn(headers, ["PANTALLAS"]),
    celular: findColumn(headers, ["CELULAR"]),
    usd: findColumn(headers, ["USD"]),
    cop: findColumn(headers, ["COP"]),
    metodoPago: findColumn(headers, ["MÉTODO DE PAGO", "METODO DE PAGO", "MÉTODO", "METODO"]),
    usuario: findColumn(headers, ["USUARIO"]),
    contrasena: findColumn(headers, ["CONTRASEÑA", "CONTRASENA"]),
    panel: findColumn(headers, ["PANEL"]),
    vencimiento: findColumn(headers, ["F.VENCIMIENTO"]),
    ultimoPago: findColumn(headers, ["F.ULTIMO PAGO", "F. ÚLTIMO PAGO"]),
    proximoPago: findColumn(headers, ["F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"]),
    referido: findColumn(headers, ["REFERIDO"]),
    dispositivos: findColumn(headers, ["DISPOSITIVOS", "DISPOSITIVO"]),
    tipoServicio: findColumn(headers, ["TIPO_SERVICIO", "TIPO SERVICIO"]),
  };

  if (cols.tc == null || cols.proximoPago == null) {
    throw new Error("Required columns TC and F. PRÓXIMO PAGO were not found");
  }

  const { start, end } = monthBounds(targetMonth);
  const selected = [];
  const exceptions = [];
  const carteraVencida = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    if (clean(row[cols.tc]) !== "1") continue;

    const rawDate = valueAt(row, cols.proximoPago);
    const date = parseOperationalDate(rawDate);

    if (!date) {
      // Una ficha TC=1 sin F. PRÓXIMO PAGO válida nunca desaparece en silencio.
      exceptions.push({
        sourceRow: i + 1,
        type: "INVALID_NEXT_PAYMENT_DATE",
        cause: rawDate ? "UNPARSEABLE_NEXT_PAYMENT_DATE" : "EMPTY_NEXT_PAYMENT_DATE",
        rawValue: rawDate,
        action: "REQUIERE_CORRECCION",
      });
      continue;
    }

    if (date < start) {
      // Cartera vencida: población separada del ciclo mensual, trazable a su fila.
      const signals = detectCarteraSignals({
        status: valueAt(row, cols.estado),
        observations: valueAt(row, cols.observaciones),
        referredBy: valueAt(row, cols.referido),
      });
      const lastPayment = parseOperationalDate(valueAt(row, cols.ultimoPago));
      carteraVencida.push({
        sourceRow: i + 1,
        origin: `BASE GENERAL!${i + 1}`,
        nextPaymentDate: date,
        dueMonth: date.slice(0, 7),
        lastPaymentDate: lastPayment,
        daysPastDue: cutoffDate ? daysBetween(date, cutoffDate) : null,
        classification: signals.length ? "REQUIERE_REVISION" : "CARTERA_VENCIDA",
        signals,
      });
      continue;
    }

    if (date > end) continue;

    const identity = identityKey(row, cols);
    const status = valueAt(row, cols.estado);
    const observations = valueAt(row, cols.observaciones);
    const referredBy = valueAt(row, cols.referido);
    const classification = classifyCandidate({ status, observations, referredBy });

    selected.push({
      sourceRow: i + 1,
      week: weekBucket(date),
      classification: classification.classification,
      reviewReasons: classification.reviewReasons,
      tc: valueAt(row, cols.tc),
      client: valueAt(row, cols.cliente),
      phone: valueAt(row, cols.telefono),
      email: valueAt(row, cols.correo),
      status,
      observations,
      plan: valueAt(row, cols.plan),
      screens: valueAt(row, cols.pantallas),
      mobile: valueAt(row, cols.celular),
      usd: valueAt(row, cols.usd),
      cop: valueAt(row, cols.cop),
      paymentMethod: valueAt(row, cols.metodoPago),
      username: valueAt(row, cols.usuario),
      password: valueAt(row, cols.contrasena),
      panel: valueAt(row, cols.panel),
      expirationDate: valueAt(row, cols.vencimiento),
      lastPaymentDate: valueAt(row, cols.ultimoPago),
      nextPaymentDate: date,
      referredBy,
      devices: valueAt(row, cols.dispositivos),
      serviceType: valueAt(row, cols.tipoServicio),
      origin: `BASE GENERAL!${i + 1}`,
      identity,
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
  selected.forEach((item) => weeks[item.week - 1]++);

  const stableRows = selected
    .map((item) => ({
      sourceRow: item.sourceRow,
      nextPaymentDate: item.nextPaymentDate,
      identityHash: sha256(item.identity),
    }))
    .sort((a, b) => a.sourceRow - b.sourceRow);

  const signature = sha256(JSON.stringify(stableRows));

  const classificationCounts = selected.reduce((acc, item) => {
    acc[item.classification] = (acc[item.classification] ?? 0) + 1;
    return acc;
  }, {});

  const reviewReasonCounts = selected.flatMap((item) => item.reviewReasons).reduce((acc, reason) => {
    acc[reason] = (acc[reason] ?? 0) + 1;
    return acc;
  }, {});

  carteraVencida.sort((a, b) => b.dueMonth.localeCompare(a.dueMonth) || a.sourceRow - b.sourceRow);
  const carteraByMonth = Object.entries(
    carteraVencida.reduce((acc, item) => ((acc[item.dueMonth] = (acc[item.dueMonth] ?? 0) + 1), acc), {}),
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, count]) => ({ month, count }));
  const carteraSignalCounts = carteraVencida.flatMap((item) => item.signals).reduce((acc, name) => {
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  // Firma de la salida completa (ciclo + cartera + excepciones + corte). `signature` se conserva intacta.
  const outputSignature = sha256(JSON.stringify({
    targetMonth,
    cutoffDate,
    monthly: stableRows,
    cartera: carteraVencida,
    exceptions: exceptions.map(({ sourceRow, cause }) => ({ sourceRow, cause })),
  }));

  return {
    targetMonth,
    cutoffDate,
    total: selected.length,
    weeks,
    classificationCounts,
    reviewReasonCounts,
    preview: selected.map(({ identity, ...item }) => item),
    duplicates,
    exceptions,
    signature,
    carteraVencida,
    carteraByMonth,
    carteraSignalCounts,
    outputSignature,
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
