import "server-only";

import type {
  CommercialLead,
  CommercialLeadSummary,
} from "@/domain/commercial-lead";
import { LANDING_PAGE_COMMERCIAL_DEMO_FIXTURE } from "@/features/landing-page-commercial/fixtures";
import type {
  LandingPageCommercialSnapshot,
  LandingPageMetric,
  LandingPageOpportunity,
} from "@/features/landing-page-commercial/types";
import { getLeadRepository } from "@/server/leads/repository";

function mapLeadToOpportunity(lead: CommercialLead): LandingPageOpportunity {
  const mappedStage = lead.stage === "NEW_LEAD"
    ? { stage: "new-lead" as const, stageLabel: "Nuevo lead" }
    : { stage: "unknown" as const, stageLabel: "Estado desconocido" };

  return {
    id: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    product: lead.product,
    source: lead.source,
    utmSource: lead.utmSource,
    owner: lead.owner,
    stage: mappedStage.stage,
    stageLabel: mappedStage.stageLabel,
    sourceStage: lead.sourceStage,
    createdAt: lead.createdAt,
    nextActionAt: lead.nextActionAt,
  };
}

function createRealMetrics(summary: CommercialLeadSummary): readonly LandingPageMetric[] {
  const realMetrics: LandingPageMetric[] = [
    {
      id: "total-leads",
      label: "Total leads",
      value: summary.totalLeads,
      format: "count",
      context: "Registros actuales en LEADS",
      availability: "available",
    },
    {
      id: "new-leads",
      label: "Leads nuevos",
      value: summary.newLeads,
      format: "count",
      context: "Estado NUEVO → NEW_LEAD",
      availability: "available",
    },
    {
      id: "website-leads",
      label: "Desde website",
      value: summary.websiteLeads,
      format: "count",
      context: "Origen registrado como website",
      availability: "available",
    },
    {
      id: "utm-leads",
      label: "Con UTM",
      value: summary.leadsWithUtm,
      format: "count",
      context: "Algún atributo UTM presente",
      availability: "available",
    },
    {
      id: "owner-leads",
      label: "Con responsable",
      value: summary.leadsWithOwner,
      format: "count",
      context: "Owner registrado",
      availability: "available",
    },
    {
      id: "next-action-leads",
      label: "Con próxima acción",
      value: summary.leadsWithNextAction,
      format: "count",
      context: "Fecha de próxima acción registrada",
      availability: "available",
    },
  ];

  const productMetrics: LandingPageMetric[] = summary.leadsByProduct.map(
    ({ product, count }, index) => ({
      id: `product-${index + 1}`,
      label: product,
      value: count,
      format: "count",
      context: "Leads por producto",
      availability: "available",
    }),
  );

  const unavailableMetrics: LandingPageMetric[] = [
    { id: "proposals", label: "Propuestas", value: null, format: "count", context: "Información insuficiente en LEADS", availability: "insufficient" },
    { id: "sales", label: "Ventas", value: null, format: "count", context: "Información insuficiente en LEADS", availability: "insufficient" },
    { id: "collections", label: "Recaudo", value: null, format: "currency", currency: "USD", context: "Información insuficiente en LEADS", availability: "insufficient" },
    { id: "conversion-to-sale", label: "Conversión a venta", value: null, format: "percentage", context: "No existe resultado de venta", availability: "insufficient" },
    { id: "cac", label: "CAC", value: null, format: "currency", currency: "USD", context: "No existen costos de adquisición", availability: "insufficient" },
  ];

  return [...realMetrics, ...productMetrics, ...unavailableMetrics];
}

function createGoogleSheetsSnapshot(
  leads: readonly CommercialLead[],
  summary: CommercialLeadSummary,
): LandingPageCommercialSnapshot {
  return {
    ...LANDING_PAGE_COMMERCIAL_DEMO_FIXTURE,
    source: {
      kind: "google-sheets",
      label: "Datos reales — Google Sheets",
      disclosure: `${summary.totalLeads} registros recuperados en modo solo lectura`,
    },
    pipeline: {
      opportunityCount: summary.totalLeads,
      connectionStatus: "connected-read-only",
      connectionLabel: "Google Sheets · solo lectura",
      disclosure: "Fuente autorizada: JUMOCOL_LEADS_PILOTO_V0_6 · pestaña LEADS",
      opportunities: leads.map(mapLeadToOpportunity),
      unknownStageCount: summary.unknownStageLeads,
    },
    metrics: createRealMetrics(summary),
    backlog: LANDING_PAGE_COMMERCIAL_DEMO_FIXTURE.backlog.filter(
      (item) => item.id !== "automatic-lead-capture",
    ),
  };
}

export async function getLandingPageCommercialSnapshot(): Promise<LandingPageCommercialSnapshot> {
  const repositoryKind = process.env.JUMOCOL_LEAD_REPOSITORY ?? "fixtures";

  if (repositoryKind === "fixtures") {
    return LANDING_PAGE_COMMERCIAL_DEMO_FIXTURE;
  }

  const repository = getLeadRepository();
  const [leads, summary] = await Promise.all([
    repository.listLeads(),
    repository.getLeadSummary(),
  ]);

  return createGoogleSheetsSnapshot(leads, summary);
}
