import "server-only";
export async function readInput(request: Request): Promise<Record<string, string>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("Formato inválido.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Solicitud vacía.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); throw new Error("Solicitud demasiado grande."); }
    chunks.push(value);
  }
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.values(parsed).some(v => typeof v !== "string"))
    throw new Error("Solicitud inválida.");
  return parsed as Record<string, string>;
}
