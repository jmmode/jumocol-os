import test from "node:test";
import assert from "node:assert/strict";
import { reconcileConfirmedSalesToBase } from "../src/reconcile-sales.mjs";

test("confirmed JM sales reconcile against base and expose unmatched cases", () => {
  const sales = [
    ["", "VENTAS"],
    ["TC","CLIENTE","TELEFONO","CORREO","ESTADO","USUARIO","PANEL","CONFIRMACION"],
    ["1","Cliente A","100","a@example.com","VALIDADA PARA BASE","user-a","P1","CONFIRMADO JM"],
    ["1","Cliente B","200","b@example.com","VALIDADA PARA BASE","user-b","P2","CONFIRMADO JM"],
  ];

  const base = [
    ["", "BASE"],
    ["TC","CLIENTE","TELEFONO","CORREO","ESTADO","USUARIO","PANEL"],
    ["1","Cliente A","100","a@example.com","Al dia","user-a","P1"],
  ];

  const result = reconcileConfirmedSalesToBase(sales, base);

  assert.equal(result.confirmedCount, 2);
  assert.equal(result.matchedConfirmed, 1);
  assert.equal(result.exceptions.length, 1);
  assert.equal(result.exceptions[0].type, "CONFIRMED_SALE_NOT_FOUND_IN_BASE");
});
