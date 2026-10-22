import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { bootstrapAdmin, type Identity } from "@/server/auth/store";
import { DRIVE_ORIGINAL_PATHS, OPERATIONAL_STANDARD_KEYS, driveUrlFor } from "./curation";
import { libraryEntry, libraryInventory, publishDocument } from "./library";

// WO-TIVI-DOC-001: enlaces a originales de Drive sin exponer documentos restringidos ni no publicados.
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
const admin: Identity = { id: "julian", name: "Test admin", role: "ADMIN" };
const operator: Identity = { id: "jorge", name: "Test operator", role: "OPERADOR" };
const DECK = "10_FORMACION_Y_CAPACITACION/1) INSTALACIÓN CELULAR-TABLET ANDROID (XCIPTV).pptx";
const RESTRICTED = "12_BACK_OFFICE/CUENTAS AMAZON para (Fire stick).docx";

beforeAll(async () => {
  process.env.JUMOCOL_AUTH_DB = path.join(mkdtempSync(path.join(tmpdir(), "jumocol-drive-")), "identity.sqlite");
  const root = mkdtempSync(path.join(tmpdir(), "lifeos-drive-"));
  process.env.TIVIPLAY_DOCS_ROOT = root;
  for (const [relative, content] of [[DECK, "PK synthetic deck"], [RESTRICTED, "synthetic"], ["10_FORMACION_Y_CAPACITACION/Trabajo en equipo.mp4", "video"]] as const) {
    mkdirSync(path.join(root, path.dirname(relative)), { recursive: true });
    writeFileSync(path.join(root, relative), content);
  }
  await bootstrapAdmin(randomBytes(24).toString("base64url"));
});

describe("Drive originals", () => {
  it("only maps well-formed Google Drive URLs and never a restricted document", () => {
    expect(DRIVE_ORIGINAL_PATHS.length).toBeGreaterThanOrEqual(20);
    for (const p of DRIVE_ORIGINAL_PATHS) {
      const url = driveUrlFor(p);
      if (url) expect(url).toMatch(/^https:\/\/(drive|docs)\.google\.com\//);
    }
    expect(DRIVE_ORIGINAL_PATHS.some(p => /CUENTAS AMAZON|INSTALACIONES ESCRITAS|Dispositivos-Mapa|Incentivo/i.test(p))).toBe(false);
    expect(driveUrlFor(RESTRICTED)).toBeNull();
    expect(driveUrlFor("../../.env.local")).toBeNull();
    expect(driveUrlFor(DECK)).toMatch(/^https:\/\/drive\.google\.com\/file\/d\//);
  });

  it("offers an unreadable deck as a link-only entry that operators see only after ADMIN publication", async () => {
    const pending = (await libraryInventory(admin)).find(e => "linkOnly" in e && e.linkOnly?.relativePath === DECK);
    expect(pending && "document" in pending ? pending.published : "missing").toBe(false);
    expect(pending?.driveUrl).toBe(driveUrlFor(DECK));
    expect(await libraryInventory(operator)).toEqual([]);
    expect(await libraryEntry(pending!.id, operator)).toBeNull();

    const entry = (await libraryEntry(pending!.id, admin))!;
    await publishDocument(admin, entry.id, entry.document.sha256, "Revisado por Dirección (test)", false, [...OPERATIONAL_STANDARD_KEYS]);
    const visible = await libraryInventory(operator);
    expect(visible).toHaveLength(1);
    expect(visible[0]).toMatchObject({ id: entry.id, driveUrl: driveUrlFor(DECK), published: true });
  });

  it("keeps restricted and uncurated files out of the catalogue for everyone", async () => {
    const all = await libraryInventory(admin);
    expect(all.some(e => "linkOnly" in e && /CUENTAS AMAZON|Trabajo en equipo/.test(e.linkOnly?.relativePath ?? ""))).toBe(false);
    expect(all.every(e => !e.driveUrl || /^https:\/\/(drive|docs)\.google\.com\//.test(e.driveUrl))).toBe(true);
  });

  it("serves the pilot financial/renewal manual as a canonical, publishable document hidden until ADMIN approval", async () => {
    const id = "tiviplay-manual-financiero-renovacion";
    expect(await libraryEntry(id, operator)).toBeNull();
    const entry = (await libraryEntry(id, admin))!;
    expect(entry.document.title).toMatch(/Gestión financiera y renovación/);
    expect(entry.draft).toBe(false);
    expect(entry.document.markdown).not.toMatch(/(contrase[nñ]a|password)[ \t]*[:=][ \t]*\S{4,}/i);
  });

  it("serves the October HOY instruction once, readable, publishable and visible to operators only after ADMIN publication", async () => {
    const id = "tiviplay-manual-lista-octubre-hoy";
    expect(await libraryEntry(id, operator)).toBeNull();
    const entry = (await libraryEntry(id, admin))!;
    expect(entry.document.title).toBe("Manual operativo — Lista de octubre");
    expect(entry.draft).toBe(false);
    expect(entry.category).toBe("Cobros y facturación");
    const md = entry.document.markdown;
    const rules = md.split("## 1. Reglas aprobadas por Dirección")[1].split("\n## ")[0];
    expect(rules.match(/^\d+\. /gm)).toHaveLength(10);
    for (const sheet of ["ZELLE (OCT) — columnas A a H", "PAYPAL (OCT) — columnas A a M", "TRANSF (OCT) — columnas A a K"]) expect(md).toContain(sheet);
    expect(md).toContain("Nunca selecciones `CONFIRMADO JM`");
    expect(md).toContain("Intranet → Operaciones → TiviPlay → HOY");
    expect(md).toContain("exclusivamente a Dirección mediante `CONFIRMADO JM`");
    expect(md).not.toMatch(/@\w|\b\d{7,}\b|\(\d{3}\)\s?\d|(contrase[nñ]a|password)\s*[:=]|docs\.google\.com/i);
    const titles = (await libraryInventory(admin)).map(e => ("document" in e && e.document ? e.document.title : ""));
    expect(titles.filter(t => /Lista de octubre/.test(t))).toHaveLength(1);
    await publishDocument(admin, id, entry.document.sha256, "Aprobado por Dirección 20/10/2026 (test)", false, OPERATIONAL_STANDARD_KEYS);
    expect((await libraryEntry(id, operator))?.published).toBe(true);
  });

  it("documents the approved operational gate as observed in the live sheets, without declaring it validated", async () => {
    const md = (await libraryEntry("tiviplay-manual-financiero-renovacion", admin))!.document.markdown;
    expect(md).toMatch(/\*\*Versión:\*\* 0\.2/);
    for (const section of ["## 2. Gate operacional", "## 7. CAPA DE SERVICIO", "## 8. Cruce entre capas", "## 12. Evidencia", "## 13. Estado del gate operacional y evidencia E2E", "## 14. Decisiones pendientes", "## 15. Riesgos"])
      expect(md).toContain(section);
    expect(md).toContain("= HABILITADO PARA ACTUALIZAR BASE GENERAL");
    expect(md).toMatch(/\| H \| \*\*`F\.VENCIMIENTO`\*\*/);
    expect(md).toMatch(/\*\*Estado: PARCIAL\.\*\*/);
    expect(md).not.toMatch(/Estado:\*\* VALIDADO/);
    expect(md).toContain("Solo Dirección (JM)");
  });
  it("serves the shift quick guide (templates, S0-safe payment scripts, players, Fire Stick) hidden until ADMIN publication", async () => {
    const id = "tiviplay-guia-rapida-turno";
    expect(await libraryEntry(id, operator)).toBeNull();
    const entry = (await libraryEntry(id, admin))!;
    expect(entry.draft).toBe(false);
    expect(entry.category).toBe("Servicio al cliente");
    const md = entry.document.markdown;
    for (const h of ["### 2.1 Caída de panel", "### 2.2 Intermitencia general", "### 2.3 Actualización de canales", "### 2.4 Actualización de películas y series (movies/series)", "### 2.5 Seguimiento de la incidencia", "### 2.6 Servicio normalizado",
      "### 3.1 Recepción inicial", "### 3.2 Mensaje de espera mientras verificas", "### 3.3 Recepción de comprobante", "### 3.4 Pago pendiente de validación (el cliente pregunta)", "### 3.5 Cierre de gestión",
      "## 4. Reproductores y configuración por dispositivo", "## 5. URL de configuración por panel", "## 6. Fire Stick → Downloader → código TiviPlay", "## 7. Información que todavía requiere evidencia"]) expect(md).toContain(h);
    // S0: ningún mensaje al cliente afirma que el pago está confirmado.
    const messages = [...md.matchAll(/```mensaje\n([\s\S]*?)```/g)].map(m => m[1]);
    expect(messages.length).toBeGreaterThanOrEqual(12);
    for (const m of messages) expect(m).not.toMatch(/pago (ha sido |fue |est[aá] )?(exitoso|aprobado)|confirmamos (que )?(su|tu) pago|pago confirmado|tu pago est[aá] confirmado/i);
    expect(md).toContain("`PENDIENTE CONFIRMACION ≠ CONFIRMADO JM`");
    // AT&T y URL por panel quedan como faltantes, sin solución inventada.
    expect(md).toMatch(/\| AT&T[^\n]*REQUIERE EVIDENCIA/);
    // URL por panel: solo marcadores; los valores viven en configuración local (data/private), nunca en Git.
    const section5 = md.slice(md.indexOf("\n## 5. "), md.indexOf("\n## 6. "));
    expect(section5.match(/^```endpoints [123]$/gm)).toHaveLength(3);
    expect(section5).not.toMatch(/https?:\/\/[a-z0-9]/i);
    expect(md).not.toMatch(/\b(8\.8\.8\.8|1\.1\.1\.1)\b|nordvpn|expressvpn/i);
    // Sin credenciales, hosts de servidor ni direcciones IP.
    expect(md).not.toMatch(/(contrase[nñ]a|password|usuario|username)[ \t]*[:=][ \t]*\S{3,}|https?:\/\/\d|\b\d{1,3}(\.\d{1,3}){3}\b|:\d{4}\b|\/reseller|\/accesoprivado|\/Revendedor/i);
    expect(md).toContain("2865004");
  });
});
