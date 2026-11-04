// Acceso de escritura a una sola celda de OBSERVACIONES. Separado del cliente de lectura del motor.
export const GESTION_WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const RETRY_MS = [1000, 3000, 8000, 20000];

const quote = (title: string) => `'${title.replace(/'/g, "''")}'`;

export function gestionHeadersValid(headers: readonly string[]) {
  return headers[0] === "TC" && headers[1] === "CLIENTE" && !!headers[5]?.startsWith("OBSERVACIONES") && headers[12] === "USUARIO";
}

/** Lectura sin caché y escritura RAW limitadas a la columna F de una fila. */
export function gestionCell(spreadsheetId: string, sheet: string, row: number, token: string) {
  const range = `${quote(sheet)}!F${row}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const auth = { Authorization: `Bearer ${token}` };
  return {
    read: async () => {
      // Con cuota agotada se reintenta: la relectura decide si la escritura quedó confirmada.
      let response = await fetch(`${url}?valueRenderOption=FORMULA`, { cache: "no-store", headers: auth });
      for (const wait of RETRY_MS) {
        if (response.status !== 429 && response.status < 500) break;
        await new Promise((done) => setTimeout(done, wait));
        response = await fetch(`${url}?valueRenderOption=FORMULA`, { cache: "no-store", headers: auth });
      }
      if (!response.ok) throw new Error(`lectura ${response.status}`);
      const body = (await response.json()) as { values?: unknown[][] };
      return String(body.values?.[0]?.[0] ?? "");
    },
    write: async (next: string) => (await fetch(`${url}?valueInputOption=RAW`, {
      method: "PUT", cache: "no-store",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[next]] }),
    })).status,
  };
}
