export type LandingPageFunnelStageId =
  | "new-lead"
  | "contacted"
  | "diagnosis"
  | "information-received"
  | "proposal"
  | "negotiation"
  | "won"
  | "payment"
  | "handoff"
  | "onboarding";

export type LandingPageFunnelStage = {
  id: LandingPageFunnelStageId;
  sequence: number;
  name: string;
  purpose: string;
  entryCondition: string;
  advanceCondition: string;
  typicalNextAction: string;
};

export type LandingPageOpportunityStage = LandingPageFunnelStageId | "unknown";

export type LandingPageOpportunity = {
  id: string;
  companyName: string | null;
  contactName: string | null;
  product: string | null;
  source: string | null;
  utmSource: string | null;
  owner: string | null;
  stage: LandingPageOpportunityStage;
  stageLabel: string;
  sourceStage: string | null;
  createdAt: string;
  nextActionAt: string | null;
};

export type LandingPageAcquisitionChannelStatus = "active" | "preparation" | "to-confirm" | "to-define";

export type LandingPageAcquisitionChannel = {
  id: string;
  name: string;
  status: LandingPageAcquisitionChannelStatus;
  statusLabel: string;
};

export type LandingPageMetric = {
  id: string;
  label: string;
  value: number | null;
  format: "count" | "currency" | "percentage";
  currency?: "USD";
  context: string;
  availability: "available" | "insufficient";
};

export type LandingPageBacklogItem = {
  id: string;
  label: string;
  horizon: "current" | "future";
};

export type LandingPageCommercialSnapshot = {
  source: {
    kind: "fixture" | "google-sheets";
    label: string;
    disclosure: string;
  };
  product: {
    id: "landing-page-professional";
    name: string;
    startingPrice: {
      amount: 350;
      currency: "USD";
      label: string;
    };
    objective: string;
    status: "active";
    statusLabel: string;
    priorityChannel: string;
    priorityChannelStatus: "planned";
    priorityChannelStatusLabel: string;
    primaryConversion: string;
  };
  funnelStages: readonly LandingPageFunnelStage[];
  pipeline: {
    opportunityCount: number;
    connectionStatus: "disconnected" | "connected-read-only";
    connectionLabel: string;
    disclosure: string;
    opportunities: readonly LandingPageOpportunity[];
    unknownStageCount: number;
  };
  acquisitionChannels: readonly LandingPageAcquisitionChannel[];
  metrics: readonly LandingPageMetric[];
  backlog: readonly LandingPageBacklogItem[];
  handoff: {
    steps: readonly string[];
    fromStage: "payment";
    toStage: "handoff";
    entryGate: "payment_confirmed";
    completionGate: "handoff_complete";
    closingResponsibility: string;
    openingResponsibility: string;
    destination: string;
    outcome: string;
    extensionHref: string;
    destinationHref: string;
  };
};
