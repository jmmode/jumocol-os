import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getPendingConfirmadoJm } from "./confirmado-jm";
import { buildPendingConfirmations } from "./confirmado-jm-projection";

// Encabezados reales de octubre (20–21/10/2026); valores 100 % ficticios.
const ZELLE_HEADER = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "TIPO_SERVICIO", "PLAN_CANONICO", "DURACION_MESES", "PANTALLAS", "ESTADO_ENLACE", "MONEDA_PAGO", "VALOR_PAGO"];
const PAYPAL_HEADER = ["TC", "CLIENTE", "CORREO", "FACTURA ENVIADA", "COMISION PAYPAL", "MONTO RECIBIDO", "FECHA DE RECIBIDO", "Link de confirmación", "FECHA DE CREACION", "ASESOR", "ORIGEN", "OBSERVACIÓN", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "TIPO_SERVICIO", "PLAN_CANONICO", "DURACION_MESES", "PANTALLAS", "ESTADO_ENLACE"];
const TRANSF_HEADER = ["TC", "CLIENTE", "VALOR EN PESOS", "USD", "CAD", "MEDIO DE PAGO", "FECHA", "ASESOR", "ORIGEN", "OBSERVACIÓN", "CONFIRMACION", "CLIENTE_KEY"];

const zelle = (client: string, confirmation: string) => ["1", client, "$70", "08-10-26", "JORGE", "FACTURACIÓN", "nota", confirmation, "", "1", "120", "PLAN PRINCIPAL", "PLAN 3 MESES", "3", "1", "ENLAZADO", "USD", "70"];

describe("Bloque 3 · pendientes de Confirmado JM", () => {
  it("solo PENDIENTE CONFIRMACION aparece; CONFIRMADO JM, revisión, vacío y variantes no", () => {
    const rows = [[], ["", "ZELLE OCTUBRE"], ZELLE_HEADER,
      zelle("Cliente Uno", "CONFIRMADO JM"), zelle("Cliente Dos", "REQUIERE REVISIÓN"), zelle("Cliente Tres", "PENDIENTE CONFIRMACION"),
      zelle("Cliente Cuatro", ""), zelle("Cliente Cinco", "Pendiente"), zelle("Cliente Seis", "pendiente confirmación")];
    const r = buildPendingConfirmations("ZELLE", "ZELLE (OCT)", rows);
    expect(r.status).toBe("OK");
    expect(r.items.map((i) => i.row)).toEqual([6, 9]);
    expect(r.items.every((i) => /^PENDIENTE CONFIRMACI[OÓ]N$/i.test(i.confirmation))).toBe(true);
    expect(JSON.stringify(r)).not.toContain("CONFIRMADO JM");
    expect(r.items[0]).toMatchObject({ source: "ZELLE", reference: "ZELLE (OCT)!H6", amount: "USD 70", plan: "PLAN 3 MESES", link: "ENLAZADO", date: "08-10-26" });
  });

  it("localiza CONFIRMACION por encabezado en estructuras distintas (PAYPAL M, TRANSF K) sin exponer correo ni enlaces", () => {
    const paypal = buildPendingConfirmations("PAYPAL", "PAYPAL (OCT)", [["", "PAYPAL OCTUBRE"], PAYPAL_HEADER,
      ["1", "Cliente P", "p@example.test", "50", "2", "48", "10-10-26", "https://paypal.example/x", "09-10-26", "Jorge", "FACTURACIÓN", "", "PENDIENTE CONFIRMACION", "", "1", "40", "PLAN PRINCIPAL", "PLAN 1 MES", "1", "1", "ENLAZADO"]]);
    expect(paypal.items[0].reference).toBe("PAYPAL (OCT)!M3");
    expect(paypal.items[0].amount).toBe("USD 48");
    expect(JSON.stringify(paypal)).not.toMatch(/example\.test|paypal\.example/);

    const transf = buildPendingConfirmations("TRANSF", "TRANSF (OCT)", [["", "TRANSFERENCIAS OCTUBRE"], TRANSF_HEADER,
      ["1", "Cliente T", "$32,200", "0.00", "0.00", "NEQUI", "09-10-26", "Heidy", "FACTURACIÓN", "", "PENDIENTE CONFIRMACION", ""],
      ["1", "Cliente U", "", "21.00", "0.00", "DAVIVIENDA", "09-10-26", "Heidy", "FACTURACIÓN", "", "CONFIRMADO JM", ""]]);
    expect(transf.items).toHaveLength(1);
    expect(transf.items[0]).toMatchObject({ reference: "TRANSF (OCT)!K3", amount: "COP $32,200" });
  });

  it("si la estructura no permite identificar la columna, la fuente queda en REQUIERE_DECISION (no cero)", () => {
    expect(buildPendingConfirmations("ZELLE", "ZELLE (OCT)", [["TC", "Cliente"], ["1", "X"]]).status).toBe("REQUIERE_DECISION");
    expect(buildPendingConfirmations("ZELLE", "ZELLE (OCT)", [["TC", "CONFIRMACION", "CONFIRMACION"]]).status).toBe("REQUIERE_DECISION");
  });

  const saved = process.env.TIVIPLAY_SPREADSHEET_ID;
  afterEach(() => { if (saved === undefined) delete process.env.TIVIPLAY_SPREADSHEET_ID; else process.env.TIVIPLAY_SPREADSHEET_ID = saved; });

  it("fuente ilegible → REQUIERE_REVISION por cada fuente, nunca 0 pendientes", async () => {
    delete process.env.TIVIPLAY_SPREADSHEET_ID;
    const r = await getPendingConfirmadoJm("2026-10", "2026-10-21");
    expect(r.map((s) => [s.source, s.status])).toEqual([["ZELLE", "REQUIERE_REVISION"], ["PAYPAL", "REQUIERE_REVISION"], ["TRANSF", "REQUIERE_REVISION"]]);
  });

  it("solo lectura: reutiliza el cliente readonly, sin fetch propio ni métodos de escritura; operador no dispara la lectura", () => {
    const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf8");
    for (const f of ["./confirmado-jm.ts", "./confirmado-jm-projection.ts"]) expect(read(f)).not.toMatch(/fetch\(|batchUpdate|values:update|:append|method:\s*["'](POST|PUT|PATCH)/);
    expect(read("./confirmado-jm.ts")).toContain('from "@/server/tiviplay-live/sheets-client"');
    const page = read("../../app/(intranet)/operaciones/tiviplay/hoy/page.tsx");
    expect(page).toContain('isAdmin ? getPendingConfirmadoJm(targetMonth, today) : Promise.resolve(null)');
    expect(page).toContain("Bloque reservado a Dirección.");
  });
});
