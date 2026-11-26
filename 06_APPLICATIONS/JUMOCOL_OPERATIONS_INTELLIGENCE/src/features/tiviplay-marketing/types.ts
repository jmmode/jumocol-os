export type TiviplayWorkflowStageStatus = "completed" | "next";

export type TiviplayWorkflowStage = {
  id: string;
  sequence: number;
  label: string;
  status: TiviplayWorkflowStageStatus;
  statusLabel: string;
  items: readonly string[];
};

export type TiviplayActivityStatus = "published";

export type TiviplayDailyActivity = {
  id: string;
  date: string;
  dateLabel: string;
  brand: "TiviPlay";
  campaign: string | null;
  source: string;
  objective: string;
  asset: string | null;
  channel: string;
  responsible: string;
  status: TiviplayActivityStatus;
  statusLabel: string;
  conversations: number | null;
  leads: number | null;
  sales: number | null;
  collections: number | null;
  learning: string | null;
  nextAction: string;
};

export type TiviplayBacklogItem = {
  id: string;
  label: string;
  horizon: "current" | "future";
};

export type TiviplayAutomationLevel = {
  id: "manual-assisted" | "semiautomatic" | "supervised-agent" | "automated";
  label: string;
  description: string;
  state: "current" | "planned";
};

export type TiviplayMarketingSnapshot = {
  source: {
    kind: "fixture";
    label: string;
    disclosure: string;
  };
  workflow: readonly TiviplayWorkflowStage[];
  activity: TiviplayDailyActivity;
  backlog: readonly TiviplayBacklogItem[];
  automationLevels: readonly TiviplayAutomationLevel[];
};
