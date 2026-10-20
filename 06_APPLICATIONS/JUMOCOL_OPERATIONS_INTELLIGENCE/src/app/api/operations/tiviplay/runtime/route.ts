import { runtimeForRole } from "@/server/tiviplay-live/runtime-access";
import { requireApi } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { NextResponse } from "next/server";

import { getTiviplayRuntimeLive } from "@/server/tiviplay-live/runtime-source";

export const dynamic = "force-dynamic";

/**
 * GET /api/operations/tiviplay/runtime
 *   ?refresh=1  fuerza relectura (ignora caché de 60 s)
 *   ?view=summary  omite índice de clientes y filas (respuesta liviana)
 *   ?cliente=<texto>  devuelve solo fichas de cliente que coinciden
 *   ?view=sync  colas Ventas/Cobros/Servicio/Listo para Base/Excepciones (preview, solo lectura)
 */
export async function GET(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  audit(access.user.id, "tiviplay-runtime", "read", "REQUESTED");
  const url = new URL(request.url);
  if (access.user.role === "OPERADOR" && ["gerencial", "management", "summary"].includes(url.searchParams.get("view") ?? "")) {
    audit(access.user.id, "tiviplay-management", "read", "DENIED");
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }
  try {
    const model = await getTiviplayRuntimeLive({ force: url.searchParams.get("refresh") === "1" });
    const query = url.searchParams.get("cliente");

    if (query) {
      const q = query.toLocaleUpperCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
      return NextResponse.json({
        generatedAt: model.generatedAt,
        scope: model.scope,
        query,
        results: q.length < 2
          ? []
          : model.clientIndex.filter((c) => c.key.includes(q)).slice(0, 50).map((c) => ({
              ...c,
              chain: {
                venta: model.sync.sales.filter((x) => x.identity.baseRow === c.baseRow).map((x) => ({ id: x.id, type: x.type, gate: x.gate })),
                financiero: model.sync.financial.filter((x) => x.identity.baseRow === c.baseRow).map((x) => ({ id: x.id, state: x.state, amount: x.amount, date: x.date })),
                servicio: model.sync.service.filter((x) => x.identity.baseRow === c.baseRow).map((x) => ({ id: x.id, panel: x.panel, state: x.state, date: x.date })),
                baseGeneral: model.sync.sync.find((x) => x.baseRow === c.baseRow) ?? null,
              },
            })),
      });
    }

    if (url.searchParams.get("view") === "sync") {
      return NextResponse.json({ generatedAt: model.generatedAt, today: model.today, sync: model.sync });
    }

    if (access.user.role === "OPERADOR") {
      return NextResponse.json(runtimeForRole(model, access.user.role));
    }

    if (url.searchParams.get("view") === "summary") {
      const { clientIndex, operations, payments, sync, ...rest } = model;
      return NextResponse.json({
        ...rest,
        clientIndexSize: clientIndex.length,
        operations: { ...operations, items: operations.items.length },
        payments: { ...payments, month: payments.month.length },
        sync: { readOnly: sync.readOnly, month: sync.month, sources: sync.sources, counts: sync.counts, byState: sync.byState, decisions: sync.decisions },
      });
    }

    return NextResponse.json(model);
  } catch {
    return NextResponse.json(
      { status: "BLOQUEADO", error: "Fuente temporalmente no disponible" },
      { status: 502 },
    );
  }
}
