import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { allowed } from "@/server/auth/policy";
import { bootstrapAdmin, db, type Identity } from "@/server/auth/store";
import { discoverLifeosDocuments } from "./lifeos-discovery";
import { documentId, libraryEntry, libraryInventory, publishDocument } from "./library";
import { readCanonicalDocument } from "./document-repository";
import { OPERATIONAL_STANDARD_KEYS } from "./curation";
import { deflateRawSync } from "node:zlib";
const STANDARD = [...OPERATIONAL_STANDARD_KEYS];

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
const admin: Identity = { id: "julian", name: "Test admin", role: "ADMIN" };
const operator: Identity = { id: "jorge", name: "Test operator", role: "OPERADOR" };
let root: string;
const doc = (title: string, version: string, status: string, body = "Contenido operativo.") =>
  `# ${title}\n\n**Versión:** ${version}\n**Estado:** ${status}\n**Responsable:** Dirección\n\n## Procedimiento\n\n${body}\n`;
const write = (relative: string, content: string) => {
  const full = path.join(root, relative);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
};

// Minimal valid DOCX (ZIP, deflate) with word/document.xml, built in memory for the reader test.
function makeDocx(xmlBody: string) {
  const xml = Buffer.from(`<?xml version="1.0"?><w:document xmlns:w="w"><w:body>${xmlBody}</w:body></w:document>`);
  const data = deflateRawSync(xml); const name = Buffer.from("word/document.xml");
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(8, 8); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(xml.length, 22); local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(8, 10); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(xml.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(0, 42);
  const centralOffset = local.length + name.length + data.length;
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10); end.writeUInt32LE(central.length + name.length, 12); end.writeUInt32LE(centralOffset, 16);
  return Buffer.concat([local, name, data, central, name, end]);
}
const para = (text: string, style = "") => `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ""}<w:r><w:t>${text}</w:t></w:r></w:p>`;
const byPath = (suffix: string) => discoverLifeosDocuments({ fresh: true }).documents.find(d => d.relativePath.endsWith(suffix))!;

beforeAll(async () => {
  process.env.JUMOCOL_AUTH_DB = path.join(mkdtempSync(path.join(tmpdir(), "jumocol-lib-")), "identity.sqlite");
  root = mkdtempSync(path.join(tmpdir(), "lifeos-"));
  process.env.TIVIPLAY_DOCS_ROOT = root;
  write("03_VENTAS_Y_FACTURACION/PROTOCOLO_COBRO_CARTERA_v1_0.md", doc("Protocolo de cobro de cartera", "1.0", "VIGENTE"));
  write("03_VENTAS_Y_FACTURACION/PROTOCOLO_COBRO_CARTERA_v1_1.md", doc("Protocolo de cobro de cartera", "1.1", "VIGENTE", "Versión corregida."));
  write("03_VENTAS_Y_FACTURACION/Planes_y_precios.md", doc("Planes y precios", "2.0", "VIGENTE"));
  write("05_OPERACION_Y_TURNOS/Guion_atencion_WhatsApp.md", doc("Guion de atención WhatsApp", "1.0", "APROBADO"));
  write("05_OPERACION_Y_TURNOS/sub/Guion_atencion_WhatsApp_copia.md", doc("Guion de atención WhatsApp", "1.0", "APROBADO"));
  write("10_FORMACION_Y_CAPACITACION/Falla_de_senal_soporte.md", doc("Soporte: falla de señal", "1.0", "BORRADOR"));
  write("10_FORMACION_Y_CAPACITACION/Induccion_general.md", doc("Inducción general", "1.0", "VIGENTE"));
  write("12_BACK_OFFICE/Accesos_paneles.md", doc("Accesos a paneles", "1.0", "VIGENTE", "Usuario panel: ops\ncontraseña: Sup3rSecreta"));
  write("06_CALIDAD_Y_AUDITORIA/Auditoria_interna.md", doc("Auditoría interna", "1.0", "CONFIDENCIAL"));
  write("12_BACK_OFFICE/Conciliacion_A.md", doc("Conciliación diaria", "3.0", "VIGENTE", "A"));
  write("12_BACK_OFFICE/Conciliacion_A_final.md", doc("Conciliación diaria", "3.0", "VIGENTE", "B"));
  write("12_BACK_OFFICE/Manual_escaneado.pdf", "%PDF-1.4");
  write("99_OTRA_CARPETA/Fuera_de_alcance.md", doc("Fuera de alcance", "1.0", "VIGENTE"));
  // Curated real paths (contents synthetic): proposed current DOCX, historic PDF, confidential MD, historic MD.
  mkdirSync(path.join(root, "05_OPERACION_Y_TURNOS"), { recursive: true });
  writeFileSync(path.join(root, "05_OPERACION_Y_TURNOS/Documento_7_Funciones_por_Turno_TIVIPLAY.docx"), makeDocx(para("TURNO AM", "Heading1") + para("Revisar planilla de pendientes &amp; enviar facturas.") + "<w:tbl><w:tr><w:tc>" + para("Paso") + "</w:tc><w:tc>" + para("Acción") + "</w:tc></w:tr><w:tr><w:tc>" + para("1") + "</w:tc><w:tc>" + para("Cobrar") + "</w:tc></w:tr></w:tbl>" + para("Contraseña:")));
  write("05_OPERACION_Y_TURNOS/FUNCIONES POR TURNOS TIVIPLAY.pdf", "%PDF-1.4");
  write("05_OPERACION_Y_TURNOS/PROCESO_REACTIVACION_CLIENTES_TVPLAY.md", doc("Proceso de reactivación", "1.0", "VIGENTE"));
  write("12_BACK_OFFICE/MANUAL_ELABORACION_PLANILLA_FACTURACION_MENSUAL_TIVIPLAY_V2_0.md", doc("Manual planilla de facturación", "2.0", "ACTIVO"));
  const outside = mkdtempSync(path.join(tmpdir(), "outside-"));
  writeFileSync(path.join(outside, "secreto.md"), doc("Secreto", "1.0", "VIGENTE"));
  try { symlinkSync(path.join(outside, "secreto.md"), path.join(root, "12_BACK_OFFICE", "enlace.md")); } catch { /* symlinks may be unavailable */ }
  await bootstrapAdmin(randomBytes(24).toString("base64url"));
  db().exec("UPDATE users SET active=1");
});

describe("LIFE-OS discovery", () => {
  it("only reads the five authorized folders and apt formats, without following links outside the root", () => {
    const result = discoverLifeosDocuments({ fresh: true });
    const paths = result.documents.map(d => d.relativePath);
    expect(paths.some(p => p.startsWith("99_OTRA_CARPETA"))).toBe(false);
    expect(paths.some(p => p.endsWith("enlace.md"))).toBe(false);
    expect(result.skipped.some(s => s.relativePath.endsWith("Manual_escaneado.pdf"))).toBe(true);
    expect(result.documents.every(d => /^lo-[a-z0-9-]+$/.test(d.id) && !d.sourceReference.match(/^[A-Za-z]:/))).toBe(true);
  });
  it("classifies by content first and by folder as fallback", () => {
    expect(byPath("PROTOCOLO_COBRO_CARTERA_v1_1.md").category).toBe("Cobros y facturación");
    expect(byPath("Planes_y_precios.md").category).toBe("Ventas");
    expect(byPath("Guion_atencion_WhatsApp.md").category).toBe("Servicio al cliente");
    expect(byPath("Falla_de_senal_soporte.md").category).toBe("Servicio técnico");
    expect(byPath("Induccion_general.md").category).toBe("Formación inicial");
    expect(byPath("Conciliacion_A.md").category).toBe("Back Office");
  });
  it("keeps only the newest version current and marks identical copies as duplicates", () => {
    expect(byPath("PROTOCOLO_COBRO_CARTERA_v1_1.md").disposition).toBe("vigente");
    expect(byPath("PROTOCOLO_COBRO_CARTERA_v1_0.md").disposition).toBe("version-superada");
    expect([byPath("Guion_atencion_WhatsApp.md").disposition, byPath("Guion_atencion_WhatsApp_copia.md").disposition].sort()).toEqual(["duplicado", "vigente"]);
  });
  it("flags restricted documents, credentials and same-version contradictions", () => {
    expect(byPath("Accesos_paneles.md").restriction).toMatch(/credencial/);
    expect(byPath("Auditoria_interna.md").restriction).toMatch(/restringido/);
    expect(byPath("Conciliacion_A.md").restriction ?? byPath("Conciliacion_A_final.md").restriction).toMatch(/conflicto/);
  });
});

describe("LIFE-OS library access", () => {
  it("hides every unpublished document from operators, also on the server entry point", async () => {
    expect(await libraryInventory(operator)).toEqual([]);
    const id = byPath("Planes_y_precios.md").id;
    expect(documentId(id)).toBe(id);
    expect(await libraryEntry(id, operator)).toBeNull();
    expect((await libraryEntry(id, admin))?.published).toBe(false);
    expect(allowed("OPERADOR", `/operaciones/tiviplay/manuales/${id}`)).toBe(true); // route open, content gated by publication
  });
  it("publishes only an ADMIN-approved current version, pinned to its hash", async () => {
    const entry = (await libraryEntry(byPath("Planes_y_precios.md").id, admin))!;
    await expect(publishDocument(operator, entry.id, entry.document.sha256, "Acta comercial 2026-10", false, STANDARD)).rejects.toThrow();
    await expect(publishDocument(admin, entry.id, entry.document.sha256, "Acta comercial 2026-10", false, STANDARD.slice(0, 6))).rejects.toThrow("escalamiento");
    await publishDocument(admin, entry.id, entry.document.sha256, "Acta comercial 2026-10", false, STANDARD);
    expect((await libraryInventory(operator)).map(x => x.id)).toEqual([entry.id]);
    // Source edited after approval -> automatically withdrawn for operators. Original restored afterwards.
    const file = path.join(root, "03_VENTAS_Y_FACTURACION/Planes_y_precios.md");
    const original = readFileSync(file, "utf8");
    writeFileSync(file, original + "\nCambio no aprobado.\n");
    expect(await libraryEntry(entry.id, operator)).toBeNull();
    writeFileSync(file, original);
    expect((await libraryEntry(entry.id, operator))?.published).toBe(true);
  });
  it("refuses publication of drafts, superseded versions, duplicates, restricted and conflicting documents", async () => {
    for (const suffix of ["Falla_de_senal_soporte.md", "PROTOCOLO_COBRO_CARTERA_v1_0.md", "Auditoria_interna.md", "Conciliacion_A.md"]) {
      const entry = (await libraryEntry(byPath(suffix).id, admin))!;
      expect(entry.draft, suffix).toBe(true);
      await expect(publishDocument(admin, entry.id, entry.document.sha256, "Intento de publicación indebida", false, STANDARD)).rejects.toThrow("No publicable");
    }
    const copies = ["Guion_atencion_WhatsApp.md", "Guion_atencion_WhatsApp_copia.md"].map(byPath);
    const duplicate = copies.find(d => d.disposition === "duplicado")!;
    await expect(publishDocument(admin, duplicate.id, duplicate.sha256, "Intento de publicación indebida", false, STANDARD)).rejects.toThrow("No publicable");
  });
  it("lets ADMIN read pending documents but never renders content flagged with possible credentials", async () => {
    for (const suffix of ["Falla_de_senal_soporte.md", "PROTOCOLO_COBRO_CARTERA_v1_0.md", "Auditoria_interna.md", "Guion_atencion_WhatsApp.md"]) {
      const entry = await libraryEntry(byPath(suffix).id, admin);
      expect(entry?.document.markdown.length, suffix).toBeGreaterThan(10);
      expect(entry?.published).toBe(false);
    }
    const secret = byPath("Accesos_paneles.md");
    expect(await libraryEntry(secret.id, admin)).toBeNull();
    expect(await libraryEntry(secret.id, operator)).toBeNull();
    await expect(publishDocument(admin, secret.id, secret.sha256, "Intento de publicación indebida", false, STANDARD)).rejects.toThrow();
    const listed = (await libraryInventory(admin)).find(x => x.id === secret.id);
    expect(listed).toMatchObject({ unavailable: true });
    expect(JSON.stringify(listed)).not.toContain("Sup3rSecreta");
  });
  it("reads DOCX originals in memory as Markdown (headings, text, tables) without flagging empty form labels", async () => {
    const d7 = byPath("Documento_7_Funciones_por_Turno_TIVIPLAY.docx");
    expect(d7).toMatchObject({ category: "Servicio al cliente", catalogStatus: "PENDIENTE_VALIDACION", proposedCurrent: true, restriction: null });
    const entry = (await libraryEntry(d7.id, admin))!;
    expect(entry.document.title).toBe("Documento 7 Funciones por Turno TIVIPLAY");
    expect(entry.document.markdown).toContain("## TURNO AM");
    expect(entry.document.markdown).toContain("Revisar planilla de pendientes & enviar facturas.");
    expect(entry.document.markdown).toContain("| 1 | Cobrar |");
    expect(entry.catalogLabel).toBe("PENDIENTE DE VALIDACIÓN");
  });
  it("applies the curated catalogue: historic and restricted documents are never publishable", async () => {
    const skipped = discoverLifeosDocuments({ fresh: true }).skipped.find(x => x.relativePath.endsWith("FUNCIONES POR TURNOS TIVIPLAY.pdf"))!;
    expect(skipped).toMatchObject({ catalogStatus: "HISTORICO", section: "Servicio al cliente" });
    for (const [suffix, label] of [["PROCESO_REACTIVACION_CLIENTES_TVPLAY.md", "HISTÓRICO"], ["MANUAL_ELABORACION_PLANILLA_FACTURACION_MENSUAL_TIVIPLAY_V2_0.md", "RESTRINGIDO"]] as const) {
      const entry = (await libraryEntry(byPath(suffix).id, admin))!;
      expect(entry.draft).toBe(true);
      expect(entry.catalogLabel).toContain(label);
      await expect(publishDocument(admin, entry.id, entry.document.sha256, "Intento de publicación indebida", false, STANDARD)).rejects.toThrow(label);
      expect(await libraryEntry(entry.id, operator)).toBeNull();
    }
  });
  it("rejects arbitrary IDs and paths", async () => {
    expect(documentId("../../.env.local")).toBeNull();
    expect(documentId("lo-inexistente-000000")).toBeNull();
    await expect(readCanonicalDocument("../../03_VENTAS_Y_FACTURACION/Planes_y_precios.md")).rejects.toThrow("no permitido");
  });
});
