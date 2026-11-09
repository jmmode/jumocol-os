import test from "node:test";
import assert from "node:assert/strict";

import { buildMonthlyClose } from "../src/core.mjs";
import { DRAFT_MAX_ROWS, assertAllowedDraftTitle } from "../src/draft/contract.mjs";
import { buildDraft, contentSignature, normalizeTechnicalUser, storedSignature } from "../src/draft/builder.mjs";
import { diffDraft, isUniverseId } from "../src/draft/diff.mjs";
import { locatePaymentColumns, normalizePayments } from "../src/draft/payments.mjs";
import { createSheetsIo, normalizeBaseRowsForDraft } from "../src/draft/sheets-io.mjs";
import { syncDraft } from "../src/draft/sync.mjs";

// Datos 100 % ficticios con el contrato de columnas de BASE GENERAL (A..X).
const TITLE = "PAGOS NOVIEMBRE 2026 - BORRADOR";
const PW = "PW-SENTINEL-77";
const HEADER = [
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO",
  "DISPOSITIVOS", "CUMPLEAÑOS", "TIPO_SERVICIO", "CODIGO_CANONICO",
];
const ficha = (n, next, { tc = "1", usd = "15", notes = "", user = `usuario-ficticio-${n}` } = {}) => [
  tc, `Cliente Ficticio ${n}`, `555000${n}`, `ficticio${n}@example.test`, "Al dia", notes, "PLAN 1 MES", "1", "",
  usd, "", "ZELLE", user, `${PW}-${n}`, "PANEL 1", "", "01-10-26", next, "1", "", "", "", "PLAN PRINCIPAL", "PLN_01",
];

function baseRows() {
  return [
    ["", "BASE GENERAL · FICTICIA"],
    HEADER,
    ficha(3, "02-11-26"),
    ficha(4, "06-11-26"),
    ficha(5, "13-11-26"),
    ficha(6, "20-11-26", { notes: "pendiente mes gratis" }),
    ficha(7, "27-11-26"),
    ficha(8, "28-11-26", { usd: "99" }),
    ficha(9, "15-09-26"),
    ficha(10, "", {}),
    ficha(11, "10-11-26", { tc: "0" }),
    ["", "CLIENTES VENCIDOS · ESTADO = VENCIDO"],
    ficha(13, "20-10-26"),
    ["827", "TOTAL GENERAL (TIVIPLAY + MIRA+)"],
    ["", "DESACTIVADOS SEPTIEMBRE 2026"],
    ficha(16, "01-09-26"),
  ];
}

const pay = (over) => ({
  source: "ZELLE (OCT)", row: 4, confirmation: "CONFIRMADO JM", matches: "1", baseRow: 4, amount: "15", amountCop: "",
  currency: "USD", paymentDate: "2026-10-06", link: "ENLAZADO", tariffCheck: "COINCIDE PLAN", proposedNext: "2026-11-06", proposalState: "VALIDADO",
  ...over,
});

const DECISIONS = { targetMonth: "2026-11", rows: { "8": { clase: "BLOQUEADO", categoria: "TARIFA (P0-2)", causa: "Decisión ficticia", responsable: "DIRECCIÓN" } } };

/** Hoja simulada con la forma de la API: filas y celdas vacías finales recortadas, allowlist real. */
function memoryIo(sources, { sheetExists = true, corruptNextWrite = false } = {}) {
  const state = { sources, sheet: sheetExists ? [["(hoja creada vacía)"]] : null, writes: 0, corruptNextWrite };
  const trim = (values) => {
    const rows = values.map((r) => {
      const c = [...r];
      while (c.length && c[c.length - 1] === "") c.pop();
      return c;
    });
    while (rows.length && rows[rows.length - 1].length === 0) rows.pop();
    return rows;
  };
  return {
    state,
    async readSources() {
      return structuredClone(state.sources);
    },
    async readDraft(title) {
      assertAllowedDraftTitle(title);
      return state.sheet ? structuredClone(state.sheet) : null;
    },
    async writeDraft(title, values) {
      assertAllowedDraftTitle(title);
      state.writes += 1;
      state.sheet = trim(values.slice(0, DRAFT_MAX_ROWS));
      if (state.corruptNextWrite) {
        state.corruptNextWrite = false;
        state.sheet[5] = ["CORRUPTO"];
      }
    },
  };
}

const run = (io, extra = {}) => syncDraft({ io, targetMonth: "2026-11", cutoffDate: "2026-10-29", decisions: DECISIONS, apply: true, ...extra });

function universeRow(values, n) {
  return values.find((r) => r[21] === `BASE GENERAL!${n}`);
}
function universeId(values, n) {
  return universeRow(values, n)?.[37];
}

test("primera sincronización escribe la hoja y la relectura coincide con la firma", async () => {
  const io = memoryIo({ baseRows: baseRows(), payments: [pay()], missingSheets: [] });
  const report = await run(io);
  assert.equal(report.status, "ACTUALIZADO");
  assert.equal(io.state.writes, 1);
  assert.equal(storedSignature(io.state.sheet), report.signature);
  assert.equal(contentSignature(io.state.sheet), report.signature);
  assert.deepEqual(report.summary.classes, { FACTURABLE: 4, REQUIERE_REVISION: 1, BLOQUEADO: 1, PAGADO_SIN_PROPAGAR: 0 });
  // Universo de noviembre (6), cartera (9, 13), bloqueado sin fecha (10), TC_0 (11), histórico (16).
  assert.equal(report.summary.universe, 6);
  assert.equal(report.summary.cartera, 2);
  assert.equal(report.summary.blocked, 1);
  assert.equal(report.summary.excluded, 1);
  assert.equal(report.summary.historicalSections, 1);
  // Cuadre: cada ficha TC=1 operativa cae en un solo destino (3..8 mes, 9 y 13 cartera, 10 sin fecha).
  assert.equal(report.summary.tally.tc1, 9);
  assert.equal(report.summary.reconciled, true);
});

test("cartera con pago confirmado que vence en el mes entra a su semana, sin duplicarse en cartera", async () => {
  const sources = { baseRows: baseRows(), payments: [pay(), pay({ row: 12, baseRow: 13, paymentDate: "2026-10-27", proposedNext: "2026-11-27" })], missingSheets: [] };
  const io = memoryIo(sources);
  const report = await run(io);
  const b13 = universeRow(io.state.sheet, 13);
  assert.equal(b13[17], "2026-11-27");
  assert.equal(b13[32], 5);
  assert.equal(b13[34], "PROPAGACIÓN PENDIENTE");
  assert.equal(io.state.sheet.some((r) => r[0] === "NOV26-CV13"), false);
  assert.equal(report.summary.movedFromCartera, 1);
  assert.equal(report.summary.reconciled, true);
  assert.equal(sources.baseRows[12][17], "20-10-26"); // BASE intacta
});

test("columnas del equipo (AM:AP) se conservan por ID aunque la ficha cambie de semana", async () => {
  const sources = { baseRows: baseRows(), payments: [pay()], missingSheets: [] };
  const io = memoryIo(sources);
  await run(io);
  const initialId = universeId(io.state.sheet, 5);
  const i = io.state.sheet.findIndex((r) => r[37] === initialId);
  assert.equal(io.state.sheet[i][38], "PENDIENTE");
  io.state.sheet[i][38] = "CONTACTADO";
  io.state.sheet[i][41] = "Promete pagar el viernes";
  // Editar solo columnas del equipo no provoca reescritura.
  assert.equal((await run(io)).status, "NO_CHANGES");

  sources.baseRows[4][17] = "21-11-26"; // la ficha 5 se mueve de S3 a S4
  const report = await run(io);
  assert.equal(report.status, "ACTUALIZADO");
  const b5 = universeRow(io.state.sheet, 5);
  assert.equal(b5[32], 4);
  assert.equal(b5[38], "CONTACTADO");
  assert.equal(b5[41], "Promete pagar el viernes");
  assert.equal(universeRow(io.state.sheet, 3)[38], "PENDIENTE");
});

test("segunda ejecución sin cambios: NO_CHANGES, sin escritura y sin registros duplicados", async () => {
  const io = memoryIo({ baseRows: baseRows(), payments: [pay()], missingSheets: [] });
  await run(io);
  const before = structuredClone(io.state.sheet);
  const second = await run(io);
  assert.equal(second.status, "NO_CHANGES");
  assert.equal(second.written, false);
  assert.equal(io.state.writes, 1);
  assert.deepEqual(io.state.sheet, before);
  assert.equal(second.diff.unchanged, true);
  const ids = io.state.sheet.flatMap((r) => [r[37], String(r[0]).startsWith("NOV26-") ? r[0] : null]).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length);
});

test("confirmación nueva: solo cambia la ficha pagada; las demás quedan intactas", async () => {
  const sources = { baseRows: baseRows(), payments: [pay()], missingSheets: [] };
  const io = memoryIo(sources);
  await run(io);
  const before = structuredClone(io.state.sheet);

  // BO registra un pago de la ficha 7 y Dirección lo confirma: plan de 6 meses → PROP fuera de noviembre.
  sources.payments.push(pay({ row: 9, baseRow: 7, amount: "70", paymentDate: "2026-10-27", proposedNext: "2027-05-27" }));
  const report = await run(io);
  assert.equal(report.status, "ACTUALIZADO");
  const id7 = universeId(before, 7);
  assert.deepEqual(report.diff.classChanges, [{ id: id7, before: "FACTURABLE", after: "PAGADO_SIN_PROPAGAR" }]);
  assert.ok(report.diff.added.some((id) => id.startsWith("NOV26-AJU")));
  const touchedUniverse = report.diff.modified.map((m) => m.id).filter(isUniverseId);
  assert.deepEqual(touchedUniverse, [id7]);
  for (const n of [3, 4, 5, 6, 8]) assert.deepEqual(universeRow(io.state.sheet, n), universeRow(before, n));
});

test("corrección de fecha: la ficha cambia de semana y no altera otras fichas", async () => {
  const sources = { baseRows: baseRows(), payments: [pay()], missingSheets: [] };
  const io = memoryIo(sources);
  await run(io);
  const before = structuredClone(io.state.sheet);

  sources.baseRows[4][17] = "21-11-26"; // ficha 5: 13/11 (S3) → 21/11 (S4)
  const report = await run(io);
  assert.equal(report.status, "ACTUALIZADO");
  const id5 = universeId(before, 5);
  const b5 = report.diff.modified.find((m) => m.id === id5);
  assert.deepEqual(b5.changes.map((c) => c.kind).sort(), ["FECHA", "SEMANA"]);
  assert.equal(universeRow(io.state.sheet, 5)[32], 4);
  assert.deepEqual(report.diff.modified.map((m) => m.id).filter(isUniverseId), [id5]);
  for (const n of [3, 4, 6, 7, 8]) assert.deepEqual(universeRow(io.state.sheet, n), universeRow(before, n));

  const again = await run(io);
  assert.equal(again.status, "NO_CHANGES");
  assert.equal(io.state.writes, 2);
});

test("excepciones aisladas: una decisión o una fecha inválida no reclasifica fichas independientes", () => {
  const rows = baseRows();
  const close = buildMonthlyClose(rows, "2026-11", { cutoffDate: "2026-10-29" });
  const plain = buildDraft({ baseRows: rows, close, payments: [pay()], decisions: { targetMonth: "2026-11", rows: {} }, cutoffDate: "2026-10-29" });
  const decided = buildDraft({ baseRows: rows, close, payments: [pay()], decisions: DECISIONS, cutoffDate: "2026-10-29" });
  const diff = diffDraft(plain.values, decided.values, "NOV26");
  assert.deepEqual(diff.modified.map((m) => m.id).filter(isUniverseId), [universeId(plain.values, 8)]);
  assert.equal(decided.classByRow[8], "BLOQUEADO");
  for (const n of [3, 4, 5, 7]) assert.equal(decided.classByRow[n], plain.classByRow[n]);
});

test("el borrador y el reporte nunca contienen contraseñas, teléfonos ni correos", async () => {
  const io = memoryIo({ baseRows: baseRows(), payments: [pay()], missingSheets: [] });
  const report = await run(io);
  const sheet = JSON.stringify(io.state.sheet);
  for (const leak of [PW, "555000", "@example.test"]) assert.equal(sheet.includes(leak), false, leak);
  // El reporte enmascara CLIENTE y USUARIO incluso en el diff.
  const sources = io.state.sources;
  sources.baseRows[2][1] = "Cliente Renombrado";
  const second = await run(io);
  const text = JSON.stringify([report, second]);
  for (const leak of [PW, "555000", "@example.test", "Cliente Renombrado", "Cliente Ficticio"]) assert.equal(text.includes(leak), false, leak);
});

test("guardas: fuente inestable, hoja inexistente, conflicto y relectura fallida", async () => {
  // Fuente que cambia entre las dos lecturas → no se escribe.
  let calls = 0;
  const unstable = memoryIo({ baseRows: baseRows(), payments: [], missingSheets: [] });
  unstable.readSources = async () => {
    const rows = baseRows();
    if (calls++ === 1) rows[2][17] = "03-11-26";
    return { baseRows: rows, payments: [], missingSheets: [] };
  };
  assert.equal((await run(unstable)).status, "BLOQUEADO_FUENTE_INESTABLE");
  assert.equal(unstable.state.writes, 0);

  // El motor nunca crea la hoja.
  const missing = memoryIo({ baseRows: baseRows(), payments: [], missingSheets: [] }, { sheetExists: false });
  assert.equal((await run(missing)).status, "BLOQUEADO_HOJA_NO_EXISTE");
  assert.equal(missing.state.writes, 0);

  // Alguien edita la hoja entre el diff y la escritura → conflicto, sin escritura.
  const conflict = memoryIo({ baseRows: baseRows(), payments: [], missingSheets: [] });
  const original = conflict.readDraft;
  let reads = 0;
  conflict.readDraft = async (title) => {
    const v = await original(title);
    return reads++ === 1 ? [["EDITADO A MANO"]] : v;
  };
  assert.equal((await run(conflict)).status, "BLOQUEADO_CONFLICTO");
  assert.equal(conflict.state.writes, 0);

  // Relectura que no coincide → se restauran los valores previos.
  const corrupt = memoryIo({ baseRows: baseRows(), payments: [], missingSheets: [] }, { corruptNextWrite: true });
  const before = structuredClone(corrupt.state.sheet);
  const report = await run(corrupt);
  assert.equal(report.status, "RESTAURADO");
  assert.deepEqual(corrupt.state.sheet, before);

  // Ensayo (dry-run): calcula y compara, nunca escribe.
  const dry = memoryIo({ baseRows: baseRows(), payments: [], missingSheets: [] });
  assert.equal((await run(dry, { apply: false })).status, "PLAN");
  assert.equal(dry.state.writes, 0);
});

test("identidad técnica normaliza prefijos históricos VENCIO/ y LIBERADO/", () => {
  assert.equal(normalizeTechnicalUser(" VENCIO/Pl3346540M "), "PL3346540M");
  assert.equal(normalizeTechnicalUser("LIBERADO/LP1015675"), "LP1015675");
  assert.equal(normalizeTechnicalUser("VENCIO/LIBERADO/User 01"), "USER01");
});

test("BASE GENERAL se proyecta por encabezado aunque ID desplace USUARIO", () => {
  const raw = [
    ["", "BASE"],
    ["TC","CLIENTE","TELEFONO","CORREO","ESTADO","OBSERVACIONES GESTION","PLAN ACTIVO","PANTALLAS","CELULAR","USD","COP","MÉTODO DE PAGO","ID","USUARIO","CONTRASEÑA","PANEL","F.VENCIMIENTO","F.ULTIMO PAGO","F. PRÓXIMO PAGO","T","TIPO_SERVICIO","CODIGO_CANONICO"],
    ["1","Cliente","555","x@example.test","Al dia","gestión","PLAN 1 MES","1","","15","","ZELLE","ID-1","VENCIO/User 01","SECRETO","PANEL 1","01-11-26","01-10-26","01-11-26","1","PLAN PRINCIPAL","PLN_01"],
  ];
  const projected = normalizeBaseRowsForDraft(raw);
  assert.equal(projected[2][12], "VENCIO/User 01");
  assert.equal(projected[2][13], "");
  assert.equal(projected[2][14], "PANEL 1");
  assert.equal(projected[2][17], "01-11-26");
  assert.equal(JSON.stringify(projected).includes("SECRETO"), false);
});

test("migración ID_BORRADOR legado → estable conserva AM:AP y queda idempotente", async () => {
  const sources = { baseRows: baseRows(), payments: [pay()], missingSheets: [] };
  const io = memoryIo(sources);
  const noDecisions = { targetMonth: "2026-11", rows: {} };

  // Construye el estado nuevo una vez y luego simula el borrador productivo legado por fila.
  await run(io, { decisions: noDecisions });
  const row = universeRow(io.state.sheet, 5);
  const stableId = row[37];
  row[37] = "NOV26-B5";
  row[38] = "CONTACTADO";
  row[39] = "2026-11-08";
  row[40] = "ASESOR-01";
  row[41] = "historial legado";

  const migrated = await run(io, { decisions: noDecisions });
  assert.equal(migrated.status, "ACTUALIZADO");
  assert.equal(migrated.idMigration.migrated.length, 1);
  assert.equal(migrated.idMigration.blocked.length, 0);

  const after = universeRow(io.state.sheet, 5);
  assert.equal(after[37], stableId);
  assert.deepEqual(after.slice(38, 42), ["CONTACTADO", "2026-11-08", "ASESOR-01", "historial legado"]);

  const again = await run(io, { decisions: noDecisions });
  assert.equal(again.status, "NO_CHANGES");
  assert.equal(again.idMigration.migrated.length, 0);
  assert.equal(again.idMigration.blocked.length, 0);
});

test("migración bloquea identidad técnica ambigua y no escribe", async () => {
  const rows = baseRows();
  rows[2][12] = "VENCIO/SharedUser";
  rows[3][12] = "LIBERADO/SharedUser";
  const sources = { baseRows: rows, payments: [], missingSheets: [] };
  const noDecisions = { targetMonth: "2026-11", rows: {} };

  const close = buildMonthlyClose(rows, "2026-11", { cutoffDate: "2026-10-29" });
  const next = buildDraft({ baseRows: rows, close, payments: [], decisions: noDecisions, cutoffDate: "2026-10-29" });
  const current = structuredClone(next.values);
  const a = current.find((r) => r[12] === "VENCIO/SharedUser");
  const b = current.find((r) => r[12] === "LIBERADO/SharedUser");
  a[37] = "NOV26-B3";
  b[37] = "NOV26-B4";
  a[38] = "CONTACTADO";
  a[39] = "2026-11-08";
  a[40] = "ASESOR-A";
  a[41] = "no migrar ambiguo";

  const io = memoryIo(sources);
  io.state.sheet = current;
  const report = await run(io, { decisions: noDecisions });

  assert.equal(report.status, "BLOQUEADO_MIGRACION_IDENTIDAD");
  assert.equal(report.written, false);
  assert.equal(report.idMigration.migrated.length, 0);
  assert.equal(report.idMigration.blocked.length, 1);
  assert.equal(io.state.writes, 0);
  assert.deepEqual(io.state.sheet, current);
});

test("insertar o mover filas de BASE recalcula ORIGEN BASE sin perder ID ni gestión", async () => {
  const sources = { baseRows: baseRows(), payments: [pay()], missingSheets: [] };
  const io = memoryIo(sources);
  const noDecisions = { targetMonth: "2026-11", rows: {} };
  await run(io, { decisions: noDecisions });

  const user = "usuario-ficticio-5";
  const beforeRow = io.state.sheet.find((r) => r[12] === user);
  assert.ok(beforeRow);
  const stableId = beforeRow[37];
  assert.equal(beforeRow[21], "BASE GENERAL!5");
  beforeRow[38] = "CONTACTADO";
  beforeRow[41] = "gestión preservada";

  // Inserción física antes de la ficha: la identidad sigue siendo el USUARIO, no la fila anterior.
  sources.baseRows.splice(4, 0, ["", "RÓTULO TEMPORAL"]);
  const moved = await run(io, { decisions: noDecisions });
  assert.equal(moved.status, "ACTUALIZADO");
  const afterInsert = io.state.sheet.find((r) => r[12] === user);
  assert.equal(afterInsert[37], stableId);
  assert.equal(afterInsert[21], "BASE GENERAL!6");
  assert.equal(afterInsert[38], "CONTACTADO");
  assert.equal(afterInsert[41], "gestión preservada");

  // Reordenar dos fichas obliga a recalcular la fila; nunca conserva la referencia del otro cliente.
  const a = sources.baseRows[2];
  sources.baseRows[2] = sources.baseRows[3];
  sources.baseRows[3] = a;
  const reordered = await run(io, { decisions: noDecisions });
  assert.equal(reordered.status, "ACTUALIZADO");
  const current = io.state.sheet.find((r) => r[12] === user);
  const sourceRow = sources.baseRows.findIndex((r) => r?.[12] === user) + 1;
  assert.equal(current[21], `BASE GENERAL!${sourceRow}`);
  assert.equal(current[37], stableId);
  assert.equal(current[38], "CONTACTADO");
  assert.equal(current[41], "gestión preservada");

  const again = await run(io, { decisions: noDecisions });
  assert.equal(again.status, "NO_CHANGES");
});

test("usuarios ambiguos tras normalizar no reciben ORIGEN BASE", () => {
  const rows = baseRows();
  rows[2][12] = "VENCIO/SharedUser";
  rows[3][12] = "LIBERADO/SharedUser";
  const close = buildMonthlyClose(rows, "2026-11", { cutoffDate: "2026-10-29" });
  const draft = buildDraft({ baseRows: rows, close, payments: [], decisions: { targetMonth: "2026-11", rows: {} }, cutoffDate: "2026-10-29" });
  const ambiguous = draft.values.filter((r) => ["VENCIO/SharedUser", "LIBERADO/SharedUser"].includes(r[12]));
  assert.equal(ambiguous.length, 2);
  for (const row of ambiguous) {
    assert.equal(row[21], "");
    assert.equal(row[33], "REQUIERE_REVISION");
    assert.match(String(row[35]), /ambiguo/i);
  }
});

test("allowlist: ninguna otra hoja es escribible", () => {
  for (const title of ["BASE GENERAL", "PAGOS OCTUBRE 2026", "CONTROL", "ZELLE (OCT)", "PAGOS NOVIEMBRE 2026"]) {
    assert.throws(() => assertAllowedDraftTitle(title), /no es una hoja BORRADOR autorizada/);
  }
  assert.equal(assertAllowedDraftTitle(TITLE), TITLE);
});

test("normalizePayments localiza columnas por encabezado y no requiere CLIENTE ni CORREO", () => {
  const header = ["TC", "CLIENTE", "CORREO", "MONTO RECIBIDO", "FECHA DE RECIBIDO", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "ESTADO_ENLACE", "MONEDA_PAGO", "VALOR_PAGO", "VALIDACION_TARIFA", "PROP_F_PROXIMO", "ESTADO_PROPUESTA"];
  const { headerRow, columns } = locatePaymentColumns([["", "PAYPAL"], header]);
  assert.equal(headerRow, 2);
  assert.equal(columns.amount, 3);
  assert.equal(Object.values(columns).includes(1), false);
  assert.equal(Object.values(columns).includes(2), false);
  const col = (v) => [[""], [""], [v]];
  const payments = normalizePayments("PAYPAL (OCT)", {
    headerRow,
    rowsByField: { confirmation: col("CONFIRMADO JM"), matches: col("1"), baseRow: col("7"), amount: col("70.00"), paymentDate: col("27-10-26"), proposedNext: col("27/5/2027"), tariffCheck: col("COINCIDE PLAN") },
  });
  assert.equal(payments.length, 1);
  assert.equal(payments[0].row, 3);
  assert.equal(payments[0].baseRow, 7);
  assert.equal(payments[0].paymentDate, "2026-10-27");
  assert.equal(payments[0].proposedNext, "2027-05-27");
});

test("sheets-io: escritura RAW en rango fijo de la hoja autorizada; otras hojas se rechazan antes de llamar a la API", async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: decodeURIComponent(url), method: init.method ?? "GET", body: init.body });
    if (url.includes("fields=sheets.properties.title")) {
      return { ok: true, json: async () => ({ sheets: [{ properties: { title: TITLE } }] }) };
    }
    return { ok: true, json: async () => ({}) };
  };
  const io = createSheetsIo({ spreadsheetId: "libro", targetMonth: "2026-11", readToken: async () => "r", writeToken: async () => "w", fetchImpl });
  await assert.rejects(() => io.writeDraft("BASE GENERAL", [["x"]]), /no es una hoja BORRADOR autorizada/);
  await assert.rejects(() => io.writeDraft(TITLE, new Array(601).fill(["x"])), /fuera del rango/);
  assert.equal(calls.length, 0);

  await io.writeDraft(TITLE, [["a"], ["b"]]);
  const put = calls.find((c) => c.method === "PUT");
  const clear = calls.find((c) => c.method === "POST");
  assert.match(put.url, /'PAGOS NOVIEMBRE 2026 - BORRADOR'!A1:AP2\?valueInputOption=RAW$/);
  assert.match(clear.url, /'PAGOS NOVIEMBRE 2026 - BORRADOR'!A3:AP600:clear$/);
  assert.equal(calls.some((c) => c.method !== "GET" && !c.url.includes(TITLE)), false);

  const readOnly = createSheetsIo({ spreadsheetId: "libro", targetMonth: "2026-11", readToken: async () => "r", fetchImpl });
  await assert.rejects(() => readOnly.writeDraft(TITLE, [["a"]]), /no hay credencial de escritura/);
});
