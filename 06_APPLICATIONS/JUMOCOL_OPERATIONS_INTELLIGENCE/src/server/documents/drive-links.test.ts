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
});
