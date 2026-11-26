import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { cleanEndpoint, parsePanelEndpoints, readPanelEndpoints } from "./panel-endpoints";

// Dominios ficticios (.invalid): los endpoints reales viven solo en data/private.
describe("panel endpoints (configuración local)", () => {
  it("accepts only scheme + host + explicit port", () => {
    expect(cleanEndpoint("http://panel-a.example.invalid:8080")).toBe("http://panel-a.example.invalid:8080");
    expect(cleanEndpoint("https://Panel-B.example.invalid:443")).toBe("https://panel-b.example.invalid:443");
    expect(cleanEndpoint("http://panel-a.example.invalid")).toBeNull(); // sin puerto explícito
    expect(cleanEndpoint("http://user:pw@panel-a.example.invalid:8080")).toBeNull();
    expect(cleanEndpoint("http://panel-a.example.invalid:8080/reseller/login")).toBeNull();
    expect(cleanEndpoint("http://panel-a.example.invalid:8080/?username=x")).toBeNull();
    expect(cleanEndpoint("http://10.0.0.1:8080")).toBeNull(); // sin IP
    expect(cleanEndpoint("ftp://panel-a.example.invalid:21")).toBeNull();
  });
  it("never keeps a URL for a REQUIERE_EVIDENCIA entry and rejects malformed rows", () => {
    const r = parsePanelEndpoints({ source: "Prueba", updatedAt: "2026-10-22", endpoints: [
      { panel: 1, status: "VALIDADO", url: "http://panel-a.example.invalid:8080", note: "Funcionando" },
      { panel: 1, status: "REQUIERE_EVIDENCIA", label: "Primer dominio" },
      { panel: 3, status: "REQUIERE_EVIDENCIA", label: "Dudoso", url: "http://adivinado.example.invalid:2082" },
      { panel: 4, status: "VALIDADO", url: "http://x.example.invalid:80" },
      { panel: 2, status: "VALIDADO", url: "http://u:p@x.example.invalid:80" },
    ] });
    expect(r.state).toBe("OK");
    if (r.state !== "OK") return;
    expect(r.endpoints).toEqual([
      { panel: 1, status: "VALIDADO", url: "http://panel-a.example.invalid:8080", note: "Funcionando" },
      { panel: 1, status: "REQUIERE_EVIDENCIA", label: "Primer dominio", note: null },
    ]);
    expect(r.rejected).toBe(3);
    expect(JSON.stringify(r)).not.toMatch(/adivinado|u:p@/);
  });
  it("reports missing or invalid configuration as a state, without throwing", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "endpoints-"));
    expect(readPanelEndpoints(path.join(dir, "no-existe.json")).state).toBe("NO_CONFIGURADO");
    writeFileSync(path.join(dir, "bad.json"), "{no json");
    expect(readPanelEndpoints(path.join(dir, "bad.json")).state).toBe("INVALIDO");
    writeFileSync(path.join(dir, "ok.json"), JSON.stringify({ endpoints: [{ panel: 2, status: "VALIDADO", url: "https://b.example.invalid:443" }] }));
    expect(readPanelEndpoints(path.join(dir, "ok.json")).state).toBe("OK");
  });
});
