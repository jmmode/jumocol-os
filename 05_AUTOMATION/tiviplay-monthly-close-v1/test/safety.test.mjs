import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMonthlyClose,
  compareRuns,
  redactSensitiveColumns,
  validateOracle,
} from "../src/core.mjs";
import { buildEvidence, findLeaks, renderMarkdown, toPrivateCsv } from "../src/evidence.mjs";
import {
  allowedSegments,
  normalizePrivateKey,
  parseA1Range,
  readSheetValues,
} from "../src/google-sheets.mjs";

// Datos ficticios con los encabezados reales de BASE GENERAL (A:W).
const HEADER = [
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR",
  "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO",
  "F. PRÓXIMO PAGO", "T", "REFERIDO", "DISPOSITIVOS", "CUMPLEAÑOS", "TIPO_SERVICIO",
];
const PW = "PW-SENTINEL-9f3";
const row = (n, next, tc = "1") => [
  tc, `Cliente Ficticio ${n}`, `555000${n}`, `ficticio${n}@example.test`, "", "", "PLAN 1 MES", "1", "",
  "15", "", "ZELLE", `usuario-ficticio-${n}`, `${PW}-${n}`, "P1", "", "", next, "", "", "", "", "PLAN PRINCIPAL",
];

const ROWS = [
  ["", "BASE GENERAL · TIVIPLAY"],
  HEADER,
  row(1, "05-11-26"),
  row(2, "19-11-26"),
  row(3, "30-09-26"),
  row(4, ""),
  row(5, "10-11-26", "0"),
];

function sampleEvidence(run) {
  return buildEvidence({
    generatedAt: "2026-10-29T00:00:00.000Z",
    source: { sheetName: "BASE GENERAL", hashAtRead1: "h", hashAtRead2: "h", stableDuringRun: true },
    targetMonth: "2026-11",
    run1: run,
    run2: run,
    repeatability: compareRuns(run, run),
    oracle: { provided: false, valid: true, errors: [] },
    status: "VALIDADO_TECNICO",
  });
}

test("el motor nunca expone la contraseña aunque la entrada la traiga", () => {
  const result = buildMonthlyClose(ROWS, "2026-11", { cutoffDate: "2026-10-31" });
  assert.equal(result.total, 2);
  for (const item of result.preview) assert.equal("password" in item, false);
  assert.equal(JSON.stringify(result).includes(PW), false);
});

test("redactSensitiveColumns vacía la columna CONTRASEÑA y no toca el resto", () => {
  const redacted = redactSensitiveColumns(ROWS);
  const index = HEADER.indexOf("CONTRASEÑA");
  for (const r of redacted.slice(2)) assert.equal(r[index], "");
  assert.equal(redacted[2][1], ROWS[2][1]);
  assert.equal(ROWS[2][index].startsWith(PW), true, "la entrada original no se muta");
});

test("evidencia JSON y Markdown sin datos personales ni contraseña", () => {
  const result = buildMonthlyClose(ROWS, "2026-11", { cutoffDate: "2026-10-31" });
  const evidence = sampleEvidence(result);
  const text = JSON.stringify(evidence) + renderMarkdown(evidence);
  for (const forbidden of [PW, "Cliente Ficticio", "@example.test", "usuario-ficticio", "5550001", '"preview"', '"password"']) {
    assert.equal(text.includes(forbidden), false, `filtrado: ${forbidden}`);
  }
  assert.equal(findLeaks(text, result.preview), 0);
  assert.deepEqual(evidence.run1.candidates.map((c) => c.sourceRow), [3, 4]);
  assert.equal(evidence.pii, "EXCLUDED");
});

test("findLeaks detecta un dato personal inyectado en la evidencia", () => {
  const result = buildMonthlyClose(ROWS, "2026-11");
  assert.equal(findLeaks(`... ${result.preview[0].email} ...`, result.preview), 1);
});

test("el preview privado CSV no tiene columna de contraseña", () => {
  const result = buildMonthlyClose(ROWS, "2026-11");
  const csv = toPrivateCsv(result.preview);
  assert.equal(csv.split("\n")[0].includes("password"), false);
  assert.equal(csv.includes(PW), false);
});

test("la lectura nunca pide la columna CONTRASEÑA a la API", async () => {
  const urls = [];
  const sheet = [["", "BASE GENERAL · TIVIPLAY"], HEADER, row(1, "05-11-26"), row(2, "19-11-26")];
  const fetchImpl = async (url) => {
    urls.push(decodeURIComponent(url));
    const u = new URL(url);
    const json = (body) => ({ ok: true, json: async () => body });
    if (u.pathname.endsWith("values:batchGet")) {
      const valueRanges = u.searchParams.getAll("ranges").map((r) => {
        const [, from, to] = r.match(/!([A-Z]+)\d+:([A-Z]+)\d+$/);
        const a = parseA1Range(`${from}1:${to}1`);
        return { values: sheet.slice(2).map((cells) => cells.slice(a.startCol, a.endCol + 1)) };
      });
      return json({ valueRanges });
    }
    const n = Number(decodeURIComponent(u.pathname).match(/!A(\d+):/)[1]);
    return json({ values: [sheet[n - 1]] });
  };

  const rows = await readSheetValues(
    { spreadsheetId: "test-id", sheetName: "BASE GENERAL", range: "A1:W5000" },
    { fetchImpl, accessToken: "test-token" },
  );

  const batch = urls.find((u) => u.includes("values:batchGet"));
  assert.ok(batch.includes("!A3:M5000") && batch.includes("!O3:W5000"));
  assert.equal(urls.some((u) => /![A-Z]*N\d|!N\d|:N\d/.test(u.split("values:batchGet")[1] ?? "")), false);
  assert.equal(urls.filter((u) => !u.includes("batchGet")).length, 2, "solo se sondean título y encabezado");
  assert.equal(JSON.stringify(rows).includes(PW), false);
  assert.equal(rows[2][HEADER.indexOf("CONTRASEÑA")], "");
  assert.equal(rows[2][HEADER.indexOf("F. PRÓXIMO PAGO")], "05-11-26");
  assert.equal(buildMonthlyClose(rows, "2026-11").total, 2);
});

test("allowedSegments separa los tramos alrededor de columnas sensibles", () => {
  assert.deepEqual(allowedSegments(23, new Set([13])), [[0, 12], [14, 22]]);
  assert.deepEqual(allowedSegments(5, new Set()), [[0, 4]]);
});

test("normalizePrivateKey corrige comillas, \\n literales y CRLF", () => {
  const pem = "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n";
  assert.equal(normalizePrivateKey(`"${pem.replaceAll("\n", "\\n")}"`), pem.trim());
  assert.equal(normalizePrivateKey(pem.replaceAll("\n", "\r\n")), pem.trim());
  assert.equal(normalizePrivateKey(pem), pem.trim());
});

test("oracle sintético 99 · 13/30/27/16/13: MATCH y repetible", () => {
  const plan = [[1, 13], [5, 30], [12, 27], [19, 16], [26, 13]];
  const rows = [["", "PAGOS OCTUBRE 2026 - PRELIMINAR"], HEADER];
  let n = 0;
  for (const [day, count] of plan) {
    for (let k = 0; k < count; k++) rows.push(row(++n, `${String(day + (k % 4)).padStart(2, "0")}-10-26`));
  }
  rows.push(row(900, "10-10-26", "0"), row(901, "02-11-26"), row(902, "28-09-26"));

  const a = buildMonthlyClose(rows, "2026-10", { cutoffDate: "2026-09-30" });
  const b = buildMonthlyClose(rows, "2026-10", { cutoffDate: "2026-09-30" });
  assert.equal(validateOracle(a, 99, [13, 30, 27, 16, 13]).valid, true);
  assert.equal(compareRuns(a, b).identical, true);
  assert.equal(a.outputSignature, b.outputSignature);
  assert.equal(a.duplicates.length, 0);
  assert.equal(a.carteraVencida.length, 1);
  assert.equal(validateOracle(a, 100, [13, 30, 27, 16, 14]).valid, false);
});
