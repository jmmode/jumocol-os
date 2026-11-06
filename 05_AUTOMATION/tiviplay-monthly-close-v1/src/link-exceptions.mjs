const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleUpperCase("es")
  .replace(/\s+/g, " ");
const compact = (value) => canon(value).replace(/[^A-Z0-9]/g, "");

function header(rows, required) {
  for (let i = 0; i < Math.min(rows.length, 12); i += 1) {
    const keys = (rows[i] ?? []).map(canon);
    if (!required.every((r) => keys.includes(canon(r)))) continue;
    const map = new Map();
    keys.forEach((k, j) => { if (k && !map.has(k)) map.set(k, j); });
    return { index: i, col: (...names) => names.map((n) => map.get(canon(n))).find((x) => x != null) ?? null };
  }
  throw new Error(`Header row not found: ${required.join(", ")}`);
}

const at = (row, index) => index == null ? "" : clean(row?.[index]);

function sourceCode(value) {
  const c = canon(value);
  if (c.startsWith("TRANSF")) return "TRANSF";
  if (c.startsWith("PAYPAL")) return "PAYPAL";
  if (c.startsWith("ZELLE")) return "ZELLE";
  return c;
}

function readBase(rows) {
  const h = header(rows, ["TC", "CLIENTE", "USUARIO"]);
  const out = [];
  for (let i = h.index + 1; i < rows.length; i += 1) {
    const r = rows[i] ?? [];
    if (at(r, h.col("TC")) !== "1") continue;
    out.push({
      row: i + 1,
      client: at(r, h.col("CLIENTE")),
      user: compact(at(r, h.col("USUARIO"))),
      email: canon(at(r, h.col("CORREO"))),
      phone: compact(at(r, h.col("TELEFONO"))),
      panel: at(r, h.col("PANEL")),
      last: at(r, h.col("F.ULTIMO PAGO")),
      next: at(r, h.col("F. PRÓXIMO PAGO")),
    });
  }
  return out;
}

function readCartera(rows) {
  const h = header(rows, ["TC", "CLIENTE", "FUENTE_FINANCIERA"]);
  const out = [];
  for (let i = h.index + 1; i < rows.length; i += 1) {
    const r = rows[i] ?? [];
    if (at(r, h.col("TC")) !== "1") continue;
    out.push({
      row: i + 1,
      source: sourceCode(at(r, h.col("FUENTE_FINANCIERA"))),
      sourceRow: Number(at(r, h.col("FILA_FUENTE"))) || null,
      client: at(r, h.col("CLIENTE")),
      user: at(r, h.col("USUARIO")),
      email: at(r, h.col("CORREO")),
      phone: at(r, h.col("TELEFONO")),
      panel: at(r, h.col("PANEL")),
      plan: at(r, h.col("PLAN ACTIVO")),
      last: at(r, h.col("F.ULTIMO PAGO")),
      next: at(r, h.col("F. PRÓXIMO PAGO")),
      financialState: at(r, h.col("ESTADO_FINANCIERO")),
    });
  }
  return out;
}

function readSales(rows) {
  const h = header(rows, ["TC", "CONCEPTO", "CLIENTE"]);
  const out = [];
  for (let i = h.index + 1; i < rows.length; i += 1) {
    const r = rows[i] ?? [];
    if (at(r, h.col("TC")) !== "1") continue;
    out.push({
      row: i + 1,
      client: at(r, h.col("CLIENTE")),
      concept: at(r, h.col("CONCEPTO")),
      campaign: at(r, h.col("ORIGEN")),
      advisor: at(r, h.col("ASESOR")),
      user: at(r, h.col("USUARIO")),
      email: at(r, h.col("CORREO")),
      phone: at(r, h.col("TELEFONO")),
      panel: at(r, h.col("PANEL")),
      plan: at(r, h.col("PLAN ACTIVO")),
      method: at(r, h.col("MÉTODO DE PAGO")),
      last: at(r, h.col("F.ULTIMO PAGO")),
      next: at(r, h.col("F.PRÓXIMO PAGO")),
      confirmation: at(r, h.col("CONFIRMACION")),
    });
  }
  return out;
}

function readPaymentExceptions(source) {
  const { sheet, code, rows } = source;
  const h = header(rows, ["TC", "CLIENTE", "CONFIRMACION"]);
  const out = [];
  for (let i = h.index + 1; i < rows.length; i += 1) {
    const r = rows[i] ?? [];
    if (at(r, h.col("TC")) !== "1") continue;
    if (canon(at(r, h.col("CONFIRMACION"))) !== "CONFIRMADO JM") continue;
    const matches = at(r, h.col("COINCIDENCIAS_BASE"));
    if (matches === "1") continue;
    const dateColumn = code === "PAYPAL" ? h.col("FECHA DE RECIBIDO") : h.col("FECHA");
    out.push({
      ref: `${sheet}!${i + 1}`,
      sheet,
      code,
      row: i + 1,
      client: at(r, h.col("CLIENTE")),
      email: at(r, h.col("CORREO")),
      origin: at(r, h.col("ORIGEN")),
      date: at(r, dateColumn),
      method: code === "TRANSF" ? at(r, h.col("MEDIO DE PAGO")) || "TRANSFERENCIA" : code,
      confirmation: at(r, h.col("CONFIRMACION")),
      formulaMatches: matches,
    });
  }
  return out;
}

function strongBaseCandidates(base, identity) {
  const user = compact(identity.user);
  const email = canon(identity.email);
  const phone = compact(identity.phone);
  const found = base.filter((b) =>
    (user && b.user === user) ||
    (email && b.email === email) ||
    (phone && b.phone === phone)
  );
  return [...new Map(found.map((b) => [b.row, b])).values()];
}

function selectSaleCandidate(sales, payment) {
  const candidates = sales.filter((s) => {
    if (canon(s.client) !== canon(payment.client)) return false;
    const dateOk = !payment.date || !s.last || canon(s.last) === canon(payment.date);
    const methodOk = !payment.method || !s.method || canon(s.method).includes(canon(payment.method)) || canon(payment.method).includes(canon(s.method));
    return dateOk && methodOk;
  });
  return candidates.length === 1 ? candidates[0] : null;
}

function classify({ payment, sale, candidates, missingFormula }) {
  const origin = canon(payment.origin);
  const concept = canon(sale?.concept);
  const campaign = canon(sale?.campaign);

  if (campaign === "MIRA+" || campaign.includes("MIRA+")) {
    return { action: "EXCLUSION", reason: "ORIGEN MIRA+; fuera del circuito TIVIPLAY" };
  }
  if (missingFormula) {
    return { action: "REQUIERE_DECISION", reason: "PAYPAL O:P sin fórmulas originales; no completar por inferencia" };
  }
  if (candidates.length > 1) {
    return { action: "REQUIERE_DECISION", reason: `${candidates.length} candidatos BASE por identificadores fuertes` };
  }
  if (origin === "VENTA" && sale) {
    if (concept.includes("REACTIV")) {
      return candidates.length === 1
        ? { action: "REACTIVACION", reason: "Reactivación + identidad fuerte única" }
        : { action: "REQUIERE_DECISION", reason: "Reactivación sin registro histórico BASE demostrable" };
    }
    if (concept.includes("CLIENTE NUEVO") || concept.includes("REFERIDO")) {
      return candidates.length === 0
        ? { action: "ALTA", reason: "Venta confirmada, identidad de venta y sin candidato BASE" }
        : { action: "ACTUALIZACION", reason: "Venta confirmada pero identidad fuerte ya existe en BASE" };
    }
    return { action: "REQUIERE_DECISION", reason: `Concepto de venta no gobernado: ${sale.concept || "vacío"}` };
  }
  if (origin.includes("RECONEX")) {
    return candidates.length === 1
      ? { action: "REACTIVACION", reason: "Reconexión + identidad fuerte única" }
      : { action: "REQUIERE_DECISION", reason: "Reconexión sin identidad BASE única" };
  }
  if (origin.includes("FACTUR")) {
    return candidates.length === 1
      ? { action: "ACTUALIZACION", reason: "Facturación + identidad fuerte única" }
      : { action: "REQUIERE_DECISION", reason: "Facturación sin identidad BASE única" };
  }
  return { action: "REQUIERE_DECISION", reason: `Origen sin regla suficiente: ${payment.origin || "vacío"}` };
}

export function projectLinkExceptions({ paymentSources, carteraRows, baseRows, salesRows, missingFormulaRefs = [] }) {
  const base = readBase(baseRows);
  const cartera = readCartera(carteraRows);
  const sales = readSales(salesRows);
  const missing = new Set(missingFormulaRefs);
  const exceptions = paymentSources.flatMap(readPaymentExceptions).sort((a, b) => a.ref.localeCompare(b.ref));
  const items = exceptions.map((payment) => {
    const carteraMatches = cartera.filter((c) => c.source === payment.code && c.sourceRow === payment.row);
    const carteraItem = carteraMatches.length === 1 ? carteraMatches[0] : null;
    const sale = selectSaleCandidate(sales, payment);
    const identity = {
      user: carteraItem?.user || sale?.user || "",
      email: carteraItem?.email || sale?.email || payment.email || "",
      phone: carteraItem?.phone || sale?.phone || "",
    };
    const candidates = strongBaseCandidates(base, identity);
    const decision = classify({ payment, sale, candidates, missingFormula: missing.has(payment.ref) });
    return {
      sourceRef: payment.ref,
      client: payment.client,
      origin: payment.origin,
      campaign: sale?.campaign || null,
      saleType: sale?.concept || null,
      jm: canon(payment.confirmation) === "CONFIRMADO JM" ? "CONFIRMADO JM" : payment.confirmation,
      carteraRow: carteraItem?.row ?? null,
      usuario: carteraItem?.user || sale?.user || null,
      panel: carteraItem?.panel || sale?.panel || null,
      plan: carteraItem?.plan || sale?.plan || null,
      candidateBaseRows: candidates.map((c) => c.row).sort((a, b) => a - b),
      paymentDate: payment.date || null,
      lastPayment: carteraItem?.last || sale?.last || null,
      nextPayment: carteraItem?.next || sale?.next || null,
      action: decision.action,
      reason: decision.reason,
    };
  });
  const sourceRefs = items.map((x) => x.sourceRef);
  const duplicates = sourceRefs.filter((x, i) => sourceRefs.indexOf(x) !== i);
  return {
    count: items.length,
    duplicates: [...new Set(duplicates)],
    byAction: items.reduce((acc, x) => ({ ...acc, [x.action]: (acc[x.action] ?? 0) + 1 }), {}),
    items,
  };
}
