import { randomBytes } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { activate, audit, bootstrapAdmin, createOperator, db, hashPassword, listUsers, login, logout, manageUser, session, type Identity } from "./store";
import { allowed } from "./policy";
import { cookieOptions, trustedOrigin } from "./access";
import { documentId, libraryEntry, libraryInventory, publishDocument } from "@/server/documents/library";
import { readCanonicalDocument } from "@/server/documents/document-repository";
import { discoverLifeosDocuments } from "@/server/documents/lifeos-discovery";
import { OPERATIONAL_STANDARD_KEYS } from "@/server/documents/curation";
import { mkdirSync, writeFileSync } from "node:fs";

const admin: Identity = { id: "julian", name: "Test admin", role: "ADMIN" };
const operator: Identity = { id: "jorge", name: "Test operator", role: "OPERADOR" };
const password = randomBytes(24).toString("base64url");
let encoded: string;
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

beforeAll(async () => {
  process.env.JUMOCOL_AUTH_DB = path.join(mkdtempSync(path.join(tmpdir(), "jumocol-s2-unit-")), "identity.sqlite");
  // Isolate from the real LIFE-OS tree so the canonical-library expectations stay deterministic.
  // Synthetic LIFE-OS tree: one uncurated operational document, so publication rules are exercised deterministically.
  const lifeos = mkdtempSync(path.join(tmpdir(), "jumocol-lifeos-"));
  mkdirSync(path.join(lifeos, "05_OPERACION_Y_TURNOS"));
  writeFileSync(path.join(lifeos, "05_OPERACION_Y_TURNOS", "Procedimiento_sintetico.md"), "# Procedimiento sintético\n\n**Versión:** 1.0\n**Estado:** VIGENTE\n\n## Paso\n\nTexto.\n");
  process.env.TIVIPLAY_DOCS_ROOT = lifeos;
  encoded = await hashPassword(password);
  await bootstrapAdmin(password);
});
beforeEach(() => {
  db().exec("DELETE FROM sessions; DELETE FROM resets; DELETE FROM attempts; DELETE FROM publications;");
  db().prepare("UPDATE users SET active=1,password=?").run(encoded);
});

describe("persistent identity", () => {
  it("stores salted scrypt hashes, never plaintext", async () => {
    const another = await hashPassword(password);
    expect(another).not.toBe(encoded);
    expect(encoded).toMatch(/^scrypt\$32768\$8\$3\$/);
    expect(encoded).not.toContain(password);
    await expect(hashPassword("short")).rejects.toThrow();
  });
  it("rejects incorrect, unknown and inactive credentials", async () => {
    expect(await login("julian", "wrong")).toBeNull();
    expect(await login("unknown", password)).toBeNull();
    db().prepare("UPDATE users SET active=0 WHERE id='jorge'").run();
    expect(await login("jorge", password)).toBeNull();
  });
  it("isolates users, rejects forged tokens and revokes only the logged-out session", async () => {
    const first = (await login("jorge", password))!;
    const second = (await login("heidi", password))!;
    expect(session(first.token)?.id).toBe("jorge");
    expect(session(second.token)?.id).toBe("heidi");
    expect(session("0".repeat(64))).toBeNull();
    logout(first.token);
    expect(session(first.token)).toBeNull();
    expect(session(second.token)?.id).toBe("heidi");
  });
  it("enforces expiry on the server", async () => {
    const result = (await login("jorge", password))!;
    db().exec("UPDATE sessions SET expires=0");
    expect(session(result.token)).toBeNull();
  });
  it("locks repeated attempts persistently before verifying the next credential", async () => {
    for (let i = 0; i < 5; i++) expect(await login("jorge", "wrong")).toBeNull();
    expect(await login("jorge", password)).toBeNull();
    db().exec("UPDATE attempts SET until_ms=0");
    expect(await login("jorge", password)).not.toBeNull();
  });
  it("revokes all sessions on deactivation and reset", async () => {
    const first = (await login("jorge", password))!;
    const second = (await login("jorge", password))!;
    manageUser(admin, "jorge", "deactivate");
    expect(session(first.token)).toBeNull(); expect(session(second.token)).toBeNull();
    manageUser(admin, "jorge", "activate");
    expect(session(first.token)).toBeNull();
    const third = (await login("jorge", password))!;
    const token = manageUser(admin, "jorge", "reset")!;
    expect(session(third.token)).toBeNull();
    expect(await login("jorge", password)).toBeNull();
    expect(await activate(token, password)).toBe(true);
    expect(await activate(token, password)).toBe(false);
    expect(await login("jorge", password)).not.toBeNull();
  });
  it("invalidates activation after deactivation, and rejects expired activation", async () => {
    const token = manageUser(admin, "jorge", "reset")!;
    manageUser(admin, "jorge", "deactivate");
    expect(await activate(token, password)).toBe(false);
    const expired = manageUser(admin, "jorge", "reset")!;
    db().exec("UPDATE resets SET expires=0");
    expect(await activate(expired, password)).toBe(false);
  });
  it("denies operator administration and protects the last administrator", () => {
    expect(() => listUsers(operator)).toThrow();
    expect(() => manageUser(operator, "heidi", "reset")).toThrow();
    expect(() => manageUser(admin, "julian", "deactivate")).toThrow();
    expect(() => manageUser(admin, "julian", "reset")).toThrow();
  });
  it("rechecks live account authority, not the supplied role", () => {
    expect(() => manageUser({ ...operator, role: "ADMIN" }, "heidi", "reset")).toThrow();
  });
  it("audit is append-only and omits passwords and tokens", async () => {
    const result = (await login("jorge", password))!;
    const token = manageUser(admin, "heidi", "reset")!;
    const rows = JSON.stringify(db().prepare("SELECT * FROM audit").all());
    for (const secret of [password, encoded, result.token, token]) expect(rows).not.toContain(secret);
    expect(() => db().exec("DELETE FROM audit")).toThrow();
    expect(() => db().exec("UPDATE audit SET result='rewritten'")).toThrow();
  });
  it("reads the same audit and account state in a fresh Node process", () => {
    audit("julian", "restart-proof", "test", "SUCCESS");
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", "import { db } from './src/server/auth/store.ts'; console.log(db().prepare(\"SELECT count(*) AS n FROM audit WHERE entity='restart-proof'\").get().n);"], { encoding: "utf8", env: process.env });
    expect(child.status, child.stderr).toBe(0);
    expect(child.stdout.trim()).toBe("1");
  });
});

describe("operator creation", () => {
  it("lets ADMIN create an individual inactive OPERADOR with one-time activation and audit", async () => {
    const before = db().prepare("SELECT * FROM users WHERE id IN ('julian','jorge','heidi') ORDER BY id").all();
    const token = createOperator(admin, "  Operador.Prueba ", "Operador de prueba");
    const created = db().prepare("SELECT id,name,role,active,password FROM users WHERE id='operador.prueba'").get() as { role: string; active: number; password: string | null };
    expect(created).toMatchObject({ role: "OPERADOR", active: 0, password: null });
    expect(await login("operador.prueba", password)).toBeNull();
    expect(await activate(token, password)).toBe(true);
    const result = (await login("operador.prueba", password))!;
    expect(result.user.role).toBe("OPERADOR");
    expect(allowed(result.user.role, "/administracion/usuarios")).toBe(false);
    expect(db().prepare("SELECT * FROM users WHERE id IN ('julian','jorge','heidi') ORDER BY id").all()).toEqual(before);
    const rows = JSON.stringify(db().prepare("SELECT * FROM audit WHERE action='create-operator'").all());
    expect(rows).toContain("user:operador.prueba");
    expect(rows).not.toContain(token);
  });
  it("never alters existing accounts, rejects invalid identities and non-admin actors", () => {
    expect(() => createOperator(admin, "jorge", "Otro Jorge")).toThrow("ya existe");
    expect(() => createOperator(admin, "julian", "Suplantación")).toThrow("ya existe");
    expect(() => createOperator(admin, "../x", "Nombre")).toThrow();
    expect(() => createOperator(admin, "ab", "Nombre")).toThrow();
    expect(() => createOperator(admin, "valido", "<script>")).toThrow();
    expect(() => createOperator(operator, "intruso", "Intruso")).toThrow();
    expect(() => createOperator({ ...operator, role: "ADMIN" }, "intruso2", "Intruso")).toThrow();
    expect(db().prepare("SELECT count(*) AS n FROM users WHERE id LIKE 'intruso%'").get()).toEqual({ n: 0 });
  });
});

describe("server policy and transport", () => {
  it.each(["/administracion/usuarios", "/administracion/auditoria", "/finanzas-contabilidad", "/tecnologia-ia", "/marketing-comercial", "/operaciones/tiviplay/pagos", "/operaciones/tiviplay/dashboard", "/api/admin/users", "/api/admin/documents", "/administracion/biblioteca", "/api/operations/tiviplay/payments/refresh"])("denies an operator direct access to %s", route => {
    expect(allowed("OPERADOR", route)).toBe(false);
    expect(allowed("OPERADOR", route, "POST")).toBe(false);
  });
  it("allows only enumerated operational reads and denies future financial writes", () => {
    expect(allowed("OPERADOR", "/operaciones/tiviplay/runtime")).toBe(true);
    expect(allowed("OPERADOR", "/operaciones/tiviplay/hoy")).toBe(true);
    expect(allowed("OPERADOR", "/operaciones/tiviplay/hoy", "POST")).toBe(false);
    expect(allowed("OPERADOR", "/api/operations/tiviplay/monthly-close")).toBe(true);
    expect(allowed("OPERADOR", "/api/operations/tiviplay/monthly-close", "POST")).toBe(false);
    expect(allowed("OPERADOR", "/api/operations/tiviplay/confirmado-jm", "POST")).toBe(false);
  });
  it("requires exact configured Origin and rejects HTTP on LAN", () => {
    process.env.JUMOCOL_APP_ORIGIN = "https://intranet.example.test";
    expect(trustedOrigin(new Request("http://127.0.0.1/api/auth/login", { headers: { Origin: "https://intranet.example.test" } }))).toBe(true);
    expect(trustedOrigin(new Request("http://127.0.0.1/api/auth/login", { headers: { Origin: "https://attacker.test" } }))).toBe(false);
    expect(trustedOrigin(new Request("http://127.0.0.1/api/auth/login"))).toBe(false);
    expect(cookieOptions()).toMatchObject({ secure: true, httpOnly: true, sameSite: "strict" });
    process.env.JUMOCOL_APP_ORIGIN = "http://192.168.0.4:3000";
    expect(() => cookieOptions()).toThrow("HTTPS");
    process.env.JUMOCOL_APP_ORIGIN = "http://127.0.0.1:3000";
    expect(cookieOptions().secure).toBe(false);
  });
});

const syntheticId = () => discoverLifeosDocuments({ fresh: true }).documents[0].id;
const STANDARD = [...OPERATIONAL_STANDARD_KEYS];

describe("governed document library", () => {
  it("excludes unapproved documents and metadata from operator inventory", async () => {
    expect(await libraryInventory(operator)).toEqual([]);
    expect((await libraryInventory(admin)).length).toBe(9);
    expect(await libraryEntry("tiviplay-context", operator)).toBeNull();
  });
  it("rejects arbitrary filesystem paths and IDs", async () => {
    expect(documentId("../../.env.local")).toBeNull();
    expect(documentId("C:/Windows/system.ini")).toBeNull();
    await expect(readCanonicalDocument("../../.env.local" as never)).rejects.toThrow("no permitido");
  });
  it("prevents publication of a draft even by an admin", async () => {
    const doc = await readCanonicalDocument("tiviplay-context");
    await expect(publishDocument(admin, doc.id, doc.sha256, "Synthetic authorization test", false, STANDARD)).rejects.toThrow();
  });
  it("never publishes internal governance documents to operators", async () => {
    const doc = await readCanonicalDocument("tiviplay-s0-contract");
    await expect(publishDocument(admin, doc.id, doc.sha256, "Synthetic authorization test", false, STANDARD)).rejects.toThrow("RESTRINGIDO");
    expect(await libraryEntry(doc.id, operator)).toBeNull();
  });
  it("publishes only an explicitly approved hash and automatically hides a mismatch", async () => {
    const doc = await readCanonicalDocument(syntheticId());
    await publishDocument(admin, doc.id, doc.sha256, "Synthetic authorization test", false, STANDARD);
    expect((await libraryEntry(doc.id, operator))?.published).toBe(true);
    db().prepare("UPDATE publications SET sha256=? WHERE document_id=?").run("changed-source", doc.id);
    expect(await libraryEntry(doc.id, operator)).toBeNull();
    expect((await libraryEntry(doc.id, admin))?.published).toBe(false);
  });
  it("revokes publication without changing the original document", async () => {
    const doc = await readCanonicalDocument(syntheticId());
    await publishDocument(admin, doc.id, doc.sha256, "Synthetic authorization test", false, STANDARD);
    await publishDocument(admin, doc.id, doc.sha256, "", true);
    expect(await libraryEntry(doc.id, operator)).toBeNull();
    expect((await readCanonicalDocument(doc.id)).sha256).toBe(doc.sha256);
  });
  it("prevents operator publication and rejects stale approval requests", async () => {
    const doc = await readCanonicalDocument(syntheticId());
    await expect(publishDocument(operator, doc.id, doc.sha256, "Synthetic authorization test", false, STANDARD)).rejects.toThrow();
    await expect(publishDocument(admin, doc.id, "stale", "Synthetic authorization test", false, STANDARD)).rejects.toThrow();
  });
});
