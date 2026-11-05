export type KpiTone = "blue" | "cyan" | "green" | "yellow" | "navy";

export type MarketingKpi = {
  id: string;
  label: string;
  value: string;
  context: string;
  tone: KpiTone;
};

export type WorkstreamStatus = "active" | "building";

export type MarketingWorkstream = {
  id: string;
  title: string;
  objective: string;
  status: WorkstreamStatus;
  statusLabel: string;
  currentActivity: string;
  nextAction: string;
  futureHref: string;
  routeStatus: "available" | "planned";
};

export type MarketingCommercialSnapshot = {
  source: {
    kind: "fixture";
    label: string;
    disclosure: string;
  };
  kpis: readonly MarketingKpi[];
  workstreams: readonly MarketingWorkstream[];
};
