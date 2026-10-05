const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value).toLocaleUpperCase("es").replace(/\s+/g, " ");

function normalizeHeaders(row) {
  const map = new Map();
  row.forEach((value, index) => {
    const key = canon(value);
    if (key) map.set(key, index);
  });
  return map;
}

function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const h = normalizeHeaders(rows[i] ?? []);
    if (h.has("TC") && h.has("CLIENTE")) return i;
  }
  throw new Error("Header row not found");
}

function findColumn(headers, aliases) {
  for (const alias of aliases) {
    const key = canon(alias);
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

export function reconcileConfirmedSalesToBase(salesRows, baseRows) {
  const salesHeaderIndex = findHeaderRow(salesRows);
  const baseHeaderIndex = findHeaderRow(baseRows);

  const sh = normalizeHeaders(salesRows[salesHeaderIndex] ?? []);
  const bh = normalizeHeaders(baseRows[baseHeaderIndex] ?? []);

  const sc = {
    tc: findColumn(sh, ["TC"]),
    cliente: findColumn(sh, ["CLIENTE"]),
    telefono: findColumn(sh, ["TELEFONO"]),
    correo: findColumn(sh, ["CORREO"]),
    usuario: findColumn(sh, ["USUARIO"]),
    panel: findColumn(sh, ["PANEL"]),
    estado: findColumn(sh, ["ESTADO"]),
    confirmacion: findColumn(sh, ["CONFIRMACION", "CONFIRMACIÓN"]),
  };

  const bc = {
    tc: findColumn(bh, ["TC"]),
    cliente: findColumn(bh, ["CLIENTE"]),
    telefono: findColumn(bh, ["TELEFONO"]),
    correo: findColumn(bh, ["CORREO"]),
    usuario: findColumn(bh, ["USUARIO"]),
    panel: findColumn(bh, ["PANEL"]),
  };

  if (sc.tc == null || sc.confirmacion == null) {
    throw new Error("Sales sheet requires TC and CONFIRMACION columns");
  }

  const baseIndex = new Map();
  for (let i = baseHeaderIndex + 1; i < baseRows.length; i++) {
    const row = baseRows[i] ?? [];
    if (valueAt(row, bc.tc) !== "1") continue;
    const key = identityKey(row, bc);
    if (!baseIndex.has(key)) baseIndex.set(key, []);
    baseIndex.get(key).push(i + 1);
  }

  const confirmed = [];
  const exceptions = [];

  for (let i = salesHeaderIndex + 1; i < salesRows.length; i++) {
    const row = salesRows[i] ?? [];
    if (valueAt(row, sc.tc) !== "1") continue;
    if (canon(valueAt(row, sc.confirmacion)) !== "CONFIRMADO JM") continue;

    const key = identityKey(row, sc);
    const matches = baseIndex.get(key) ?? [];

    const record = {
      salesRow: i + 1,
      client: valueAt(row, sc.cliente),
      state: valueAt(row, sc.estado),
      baseRows: matches,
    };

    confirmed.push(record);

    if (matches.length === 0) {
      exceptions.push({
        salesRow: i + 1,
        client: valueAt(row, sc.cliente),
        type: "CONFIRMED_SALE_NOT_FOUND_IN_BASE",
        action: "REQUIERE_REVISION",
      });
    } else if (matches.length > 1) {
      exceptions.push({
        salesRow: i + 1,
        client: valueAt(row, sc.cliente),
        type: "AMBIGUOUS_BASE_MATCH",
        baseRows: matches,
        action: "REQUIERE_REVISION",
      });
    }
  }

  return {
    confirmedCount: confirmed.length,
    matchedConfirmed: confirmed.filter((x) => x.baseRows.length === 1).length,
    exceptions,
    confirmed,
  };
}
