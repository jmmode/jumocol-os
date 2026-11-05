export type CommercialLeadStage = "NEW_LEAD" | "UNKNOWN";

export type CommercialLeadPrivacyConsent = {
  granted: boolean | null;
  version: string | null;
  grantedAt: string | null;
  purpose: string | null;
};

export type CommercialLead = {
  id: string;
  createdAt: string;
  product: string | null;
  source: string | null;
  landingPath: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  contactName: string | null;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  need: string | null;
  message: string | null;
  stage: CommercialLeadStage;
  sourceStage: string | null;
  owner: string | null;
  nextActionAt: string | null;
  notes: string | null;
  privacyConsent: CommercialLeadPrivacyConsent;
};

export type CommercialLeadProductSummary = {
  product: string;
  count: number;
};

export type CommercialLeadSummary = {
  totalLeads: number;
  newLeads: number;
  websiteLeads: number;
  leadsByProduct: readonly CommercialLeadProductSummary[];
  leadsWithUtm: number;
  leadsWithOwner: number;
  leadsWithNextAction: number;
  unknownStageLeads: number;
};

function hasUtmAttribution(lead: CommercialLead): boolean {
  return Boolean(
    lead.utmSource ||
      lead.utmMedium ||
      lead.utmCampaign ||
      lead.utmContent ||
      lead.utmTerm,
  );
}

export function summarizeCommercialLeads(
  leads: readonly CommercialLead[],
): CommercialLeadSummary {
  const productCounts = new Map<string, number>();

  let newLeads = 0;
  let websiteLeads = 0;
  let leadsWithUtm = 0;
  let leadsWithOwner = 0;
  let leadsWithNextAction = 0;
  let unknownStageLeads = 0;

  for (const lead of leads) {
    const product = lead.product ?? "Sin producto registrado";
    productCounts.set(product, (productCounts.get(product) ?? 0) + 1);

    if (lead.stage === "NEW_LEAD") newLeads += 1;
    if (lead.stage === "UNKNOWN") unknownStageLeads += 1;
    if (lead.source?.trim().toLowerCase() === "website") websiteLeads += 1;
    if (hasUtmAttribution(lead)) leadsWithUtm += 1;
    if (lead.owner) leadsWithOwner += 1;
    if (lead.nextActionAt) leadsWithNextAction += 1;
  }

  const leadsByProduct = Array.from(productCounts, ([product, count]) => ({ product, count }))
    .sort((left, right) => right.count - left.count || left.product.localeCompare(right.product));

  return {
    totalLeads: leads.length,
    newLeads,
    websiteLeads,
    leadsByProduct,
    leadsWithUtm,
    leadsWithOwner,
    leadsWithNextAction,
    unknownStageLeads,
  };
}
