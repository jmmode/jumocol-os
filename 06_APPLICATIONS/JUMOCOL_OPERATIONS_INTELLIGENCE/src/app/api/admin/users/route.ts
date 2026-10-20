import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { audit, createOperator, manageUser } from "@/server/auth/store";
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    const { id, action, name } = await readInput(request);
    if (!["create", "activate", "deactivate", "reset"].includes(action)) throw new Error("Acción inválida.");
    const token = action === "create"
      ? createOperator(access.user, id, name)
      : manageUser(access.user, id, action as "activate" | "deactivate" | "reset");
    return NextResponse.json({ token: token ?? null, message: token ? "Código de un solo uso, válido 30 minutos. Entréguelo en privado al titular." : "Estado actualizado." });
  } catch (error) {
    audit(access.user.id, "users", "manage", "DENIED");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Operación no disponible." }, { status: 400 });
  }
}
