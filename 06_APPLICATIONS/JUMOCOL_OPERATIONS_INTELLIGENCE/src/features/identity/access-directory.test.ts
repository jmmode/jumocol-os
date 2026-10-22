import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allowed } from "@/server/auth/policy";
import { ACCESS_DIRECTORY, PRIVATE_REMOTE_ACCESS, canonicalOrigin } from "./access-directory";

const APP = path.resolve(__dirname, "../../app");
const pageExists = (route: string) => [path.join(APP, route, "page.tsx"), path.join(APP, "(intranet)", route, "page.tsx")].some(existsSync);

describe("JUMOCOL OS — Accesos", () => {
  it("lists only routes that exist in the app", () => {
    for (const entry of ACCESS_DIRECTORY) expect(pageExists(entry.path), entry.path).toBe(true);
  });
  it("keeps admin routes admin-only and operator routes reachable by operators", () => {
    for (const entry of ACCESS_DIRECTORY) {
      if (entry.audience === "Operador") expect(allowed("OPERADOR", entry.path)).toBe(true);
      if (entry.path.startsWith("/administracion")) expect(allowed("OPERADOR", entry.path)).toBe(false);
    }
  });
  it("never carries credentials and does not invent an Oracle access", () => {
    const text = JSON.stringify([ACCESS_DIRECTORY, PRIVATE_REMOTE_ACCESS]);
    expect(text).not.toMatch(/contrase[nñ]a\s*[:=]|password\s*[:=]|token\s*[:=]|oracle/i);
    expect(PRIVATE_REMOTE_ACCESS.detail).toMatch(/Funnel no se usa/);
  });
  it("exposes only a clean origin", () => {
    expect(canonicalOrigin("https://192.168.0.4:3443")).toBe("https://192.168.0.4:3443");
    expect(canonicalOrigin("https://user:pw@host:3443")).toBeNull();
    expect(canonicalOrigin("https://host:3443/?token=x")).toBeNull();
    expect(canonicalOrigin("")).toBeNull();
  });
});
