export const TECHNOLOGY_STATUSES = [
  "VALIDATED",
  "ACTIVE",
  "IN VALIDATION",
  "PLANNED",
  "BLOCKED",
  "DEPRECATED",
] as const;

export type TechnologyStatus = (typeof TECHNOLOGY_STATUSES)[number];

export type TechnologyStackGroup = {
  id: string;
  title: string;
  description: string;
  status: TechnologyStatus;
  items: readonly string[];
};

export type ArchitectureLayer = {
  id: string;
  label: string;
  detail: string;
};

export type IntegrationNode = {
  id: string;
  name: string;
  status: TechnologyStatus;
  role: string;
  evidence: string;
};

export type TechnicalFlow = {
  id: string;
  name: string;
  status: TechnologyStatus;
  statusDetail: string;
  description: string;
  steps: readonly string[];
};

export type ArchitectureDecision = {
  id: string;
  statement: string;
};

export type AiMaturityLevel = {
  level: number;
  name: string;
  current: boolean;
  description: string;
};

export type TargetAgent = {
  id: string;
  name: string;
};

export type RoadmapGroup = {
  id: "done" | "in-validation" | "next" | "future";
  label: "DONE" | "IN VALIDATION" | "NEXT" | "FUTURE";
  items: readonly string[];
};

export type TechnologyAiSnapshot = {
  source: {
    kind: "architecture-fixture";
    label: string;
    disclosure: string;
    canonicalDocument: string;
  };
  overview: {
    status: TechnologyStatus;
    statusLabel: string;
    lastUpdated: string;
    environment: string;
    architecture: string;
    currentMilestone: string;
  };
  stack: readonly TechnologyStackGroup[];
  architectureLayers: readonly ArchitectureLayer[];
  integrations: readonly IntegrationNode[];
  flows: readonly TechnicalFlow[];
  decisions: readonly ArchitectureDecision[];
  readModelSteps: readonly string[];
  writeModelSteps: readonly string[];
  aiMaturity: readonly AiMaturityLevel[];
  targetAgents: readonly TargetAgent[];
  agentContract: readonly string[];
  roadmap: readonly RoadmapGroup[];
};
