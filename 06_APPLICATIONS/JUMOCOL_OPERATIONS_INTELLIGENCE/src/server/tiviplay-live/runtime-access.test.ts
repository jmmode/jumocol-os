import { describe, expect, it } from "vitest";
import { buildRuntimeReadModel } from "./runtime-read-model";
import { buildSyncModel } from "./runtime-sync-model";
import { runtimeForRole } from "./runtime-access";
import type { TiviplayRuntimeLive } from "./runtime-source";
describe("runtime role projection", () => {
  it("removes management aggregates and panel balances from the serialized operator response", () => {
    const model: TiviplayRuntimeLive = {
      ...buildRuntimeReadModel({ sheets: [], values: {}, today: "2026-10-12" }),
      sync: buildSyncModel({ sheets: [], values: {}, salesSheets: [], salesValues: {}, today: "2026-10-12", salesError: null }),
      source: { workbook: "Synthetic", sheetsRead: [], salesWorkbook: "Synthetic", salesSheetsRead: [], signature: "test", cached: false },
    };
    const projected = runtimeForRole(model, "OPERADOR");
    const serialized = JSON.stringify(projected);
    for (const key of ['"management"', '"totals"', '"panels"', '"collectedMonth"', '"currentBalance"']) expect(serialized).not.toContain(key);
    expect(projected).toHaveProperty("operations");
    expect(projected).toHaveProperty("clientIndex");
    expect(runtimeForRole(model, "ADMIN")).toBe(model);
    expect(model).toHaveProperty("management");
  });
});
