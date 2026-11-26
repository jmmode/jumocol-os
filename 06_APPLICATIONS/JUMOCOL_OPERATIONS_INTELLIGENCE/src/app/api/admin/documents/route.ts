import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { audit } from "@/server/auth/store";
import { documentId, publishDocument } from "@/server/documents/library";
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    const input = await readInput(request);
    const id = documentId(input.id);
    if (!id || !["publish", "revoke"].includes(input.action)) throw new Error("Documento o acción no disponible.");
    const checklist = (input.checklist ?? "").split(",").map(key => key.trim()).filter(Boolean);
    await publishDocument(access.user, id, input.sha256, input.evidence ?? "", input.action === "revoke", checklist);
    return NextResponse.json({ status: "IMPLEMENTADO" });
  } catch (error) {
    audit(access.user.id, "library", "publication", "DENIED");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Acción no disponible." }, { status: 400 });
  }
}
