import type {
  ClientOperationalEntity,
  ClientOperationalState,
  CommercialToOperationsHandoff,
  OperationalGateId,
} from "@/domain/client-operation";

export type ClientWebLifecycleStageId =
  | "closed-sale"
  | "confirmed-payment"
  | "handoff"
  | "project"
  | "onboarding"
  | "brief"
  | "assets"
  | "infrastructure"
  | "design-development"
  | "qa"
  | "client-approval"
  | "publication"
  | "delivery"
  | "support";

export type ClientWebLifecycleStage = {
  id: ClientWebLifecycleStageId;
  sequence: number;
  name: string;
  purpose: string;
  entryCondition: string;
  primaryActivity: string;
  exitCondition: string;
  conceptualOwner: string;
  nextAction: string;
};

export type ClientWebRequirement = {
  id: string;
  label: string;
};

export type ClientWebOnboardingCategory = {
  id: "identity" | "business" | "contact" | "content" | "infrastructure" | "approval";
  name: string;
  requirements: readonly ClientWebRequirement[];
};

export type ClientWebProjectItemStatus = "pending" | "in-progress" | "blocked" | "in-review" | "completed";

export type ClientWebProjectPhaseItem = ClientWebRequirement & {
  status: ClientWebProjectItemStatus | null;
};

export type ClientWebProjectPhase = {
  id: "project-setup" | "onboarding" | "production" | "qa" | "delivery" | "closure-support";
  name: string;
  purpose: string;
  items: readonly ClientWebProjectPhaseItem[];
};

export type ClientWebProject = {
  id: string;
  client: string;
  company: string;
  product: string;
  responsible: string | null;
  saleDate: string;
  paymentDate: string | null;
  onboardingDate: string | null;
  currentPhase: ClientWebProjectPhase["id"];
  status: ClientWebProjectItemStatus;
  progress: number | null;
  nextAction: string | null;
  targetDate: string | null;
  blockers: readonly string[];
  notes: string | null;
};

export type ClientWebContractField = {
  id: string;
  label: string;
  purpose: string;
};

export type ClientWebCanonicalState = {
  id: ClientOperationalState;
  label: string;
  entity: ClientOperationalEntity;
  kind: "primary" | "exception";
};

export type ClientWebOperationalGate = {
  id: OperationalGateId;
  sequence: number;
  name: string;
  requiredState: ClientOperationalState;
  unlocks: string;
  rule: string;
  evidence: string;
};

export type ClientWebConceptualProgressStep = {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
};

export type ClientWebMilestone = {
  id: "operational-forms-structured-persistence";
  name: string;
  status: "documented-not-implemented";
  statusLabel: string;
  disclosure: string;
  forms: readonly string[];
};

export type ClientWebMetric = {
  id: "active-projects" | "onboarding" | "production" | "review" | "blocked" | "delivered" | "average-delivery-time";
  label: string;
  value: number | null;
  format: "count" | "duration";
  context: string;
};

export type ClientWebAlertDefinition = {
  id: "missing-information" | "pending-domain" | "pending-access" | "late-approval" | "blocked-project" | "overdue-target";
  label: string;
  trigger: string;
  activeCount: number | null;
};

export type ClientWebDeliverySnapshot = {
  source: {
    kind: "fixture";
    label: string;
    disclosure: string;
  };
  summary: {
    product: string;
    objective: string;
    status: "active-structuring";
    statusLabel: string;
    lifecycleLabel: string;
  };
  canonicalStates: readonly ClientWebCanonicalState[];
  conceptualProgress: {
    disclosure: string;
    steps: readonly ClientWebConceptualProgressStep[];
  };
  operationalGates: readonly ClientWebOperationalGate[];
  lifecycleStages: readonly ClientWebLifecycleStage[];
  responsibilities: {
    commercial: {
      name: string;
      stages: readonly string[];
      closesAt: string;
    };
    handoff: {
      name: string;
      transfers: readonly string[];
    };
    operations: {
      name: string;
      stages: readonly string[];
      startsAt: string;
    };
    path: readonly string[];
  };
  onboardingRequirements: readonly ClientWebOnboardingCategory[];
  projectPhases: readonly ClientWebProjectPhase[];
  projects: {
    count: number;
    connectionStatus: "disconnected";
    disclosure: string;
    records: readonly ClientWebProject[];
  };
  metrics: readonly ClientWebMetric[];
  alerts: readonly ClientWebAlertDefinition[];
  handoffContract: {
    status: "conceptual";
    disclosure: string;
    fields: readonly ClientWebContractField[];
    records: readonly CommercialToOperationsHandoff[];
  };
  paymentContract: {
    status: "conceptual";
    disclosure: string;
    distinction: string;
    fields: readonly ClientWebContractField[];
  };
  nextMilestone: ClientWebMilestone;
  deliveryRequirements: readonly ClientWebRequirement[];
};
