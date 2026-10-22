import "server-only";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

// URL de configuración de reproductores por panel (P1/P2/P3).
// Decisión de Dirección 22/10/2026: son información OPERACIONAL COMPARTIBLE, pero los valores vigentes viven en
// configuración local privada (data/private, ignorada por Git), no en GitHub. Git contiene solo este esquema y su consumo.
//
// Archivo: JUMOCOL_PANEL_ENDPOINTS o data/private/panel-endpoints.json, con la forma:
// { "source": "Pizarra operacional · Dirección", "updatedAt": "2026-10-22",
//   "endpoints": [ { "panel": 1, "status": "VALIDADO", "url": "http://host.example:8080", "note": "opcional" },
//                  { "panel": 3, "status": "REQUIERE_EVIDENCIA", "label": "Tercer dominio de la pizarra", "note": "Escritura ambigua" } ] }
//
// Reglas: una URL REQUIERE_EVIDENCIA nunca lleva "url" (no se guardan ni se muestran lecturas dudosas).
// Una URL VALIDADA solo puede ser esquema + host + puerto: sin usuario, contraseña, ruta, consulta ni fragmento.

export type PanelId = 1 | 2 | 3;
export type PanelEndpoint =
  | { panel: PanelId; status: "VALIDADO"; url: string; note: string | null }
  | { panel: PanelId; status: "REQUIERE_EVIDENCIA"; label: string; note: string | null };
export type PanelEndpointsResult =
  | { state: "OK"; source: string; updatedAt: string; endpoints: PanelEndpoint[]; rejected: number }
  | { state: "NO_CONFIGURADO" | "INVALIDO"; reason: string };

const MAX_TEXT = 160;
const text = (value: unknown) => (typeof value === "string" && value.trim() && value.length <= MAX_TEXT ? value.trim() : null);

/** Esquema + host + puerto explícito; nada que pueda ser credencial o acceso administrativo. */
export function cleanEndpoint(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 200) return null;
  let url: URL;
  try { url = new URL(value.trim()); } catch { return null; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password || url.search || url.hash || (url.pathname && url.pathname !== "/")) return null;
  if (!/^[a-z0-9.-]+$/i.test(url.hostname) || /^\d+(\.\d+){3}$/.test(url.hostname)) return null;
  const explicitPort = value.trim().match(/^https?:\/\/[^/:]+:(\d{1,5})\/?$/i);
  if (!explicitPort) return null;
  return `${url.protocol}//${url.hostname.toLowerCase()}:${explicitPort[1]}`;
}

export function parsePanelEndpoints(raw: unknown): PanelEndpointsResult {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { endpoints?: unknown }).endpoints))
    return { state: "INVALIDO", reason: "El archivo no tiene la lista «endpoints»." };
  const data = raw as { source?: unknown; updatedAt?: unknown; endpoints: unknown[] };
  const endpoints: PanelEndpoint[] = [];
  let rejected = 0;
  for (const item of data.endpoints) {
    const entry = (item ?? {}) as Record<string, unknown>;
    const panel = entry.panel;
    if (panel !== 1 && panel !== 2 && panel !== 3) { rejected++; continue; }
    const note = text(entry.note);
    if (entry.status === "VALIDADO") {
      const url = cleanEndpoint(entry.url);
      if (url) endpoints.push({ panel, status: "VALIDADO", url, note }); else rejected++;
    } else if (entry.status === "REQUIERE_EVIDENCIA" && entry.url === undefined) {
      endpoints.push({ panel, status: "REQUIERE_EVIDENCIA", label: text(entry.label) ?? "Dominio pendiente de confirmar", note });
    } else rejected++;
  }
  return { state: "OK", source: text(data.source) ?? "NO DOCUMENTADO", updatedAt: text(data.updatedAt) ?? "NO DOCUMENTADO", endpoints, rejected };
}

export function panelEndpointsPath() {
  return process.env.JUMOCOL_PANEL_ENDPOINTS ?? path.resolve(process.cwd(), "data/private/panel-endpoints.json");
}

/** Lectura en cada solicitud (archivo pequeño); nunca lanza: un fallo se muestra como estado, no como página rota. */
export function readPanelEndpoints(file = panelEndpointsPath()): PanelEndpointsResult {
  try {
    if (statSync(file).size > 64 * 1024) return { state: "INVALIDO", reason: "Archivo de configuración demasiado grande." };
  } catch {
    return { state: "NO_CONFIGURADO", reason: "No existe la configuración local de URL por panel." };
  }
  try {
    return parsePanelEndpoints(JSON.parse(readFileSync(file, "utf8")));
  } catch {
    return { state: "INVALIDO", reason: "La configuración local de URL por panel no es JSON válido." };
  }
}
