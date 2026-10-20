export const CLIENT_OPERATIONAL_STATES = [
  "lead",
  "diagnostic",
  "quote_sent",
  "accepted",
  "payment_pending",
  "payment_confirmed",
  "handoff_pending",
  "handoff_incomplete",
  "handoff_complete",
  "project_created",
  "onboarding_pending",
  "onboarding_complete",
  "in_production",
  "qa_pending",
  "qa_failed",
  "qa_approved",
  "ready_for_delivery",
  "delivered",
  "closed",
  "support_active",
] as const;

export type ClientOperationalState = (typeof CLIENT_OPERATIONAL_STATES)[number];

export type ClientOperationalEntity =
  | "lead"
  | "sale"
  | "payment"
  | "handoff"
  | "project"
  | "onboarding"
  | "production"
  | "qa"
  | "delivery"
  | "support";

export type HandoffStatus = Extract<
  ClientOperationalState,
  "handoff_pending" | "handoff_incomplete" | "handoff_complete"
>;

export type OperationalGateId =
  | "payment-to-handoff"
  | "handoff-to-execution"
  | "onboarding-to-production"
  | "qa-to-delivery"
  | "delivery-evidence-to-close";

export const CLIENT_OPERATIONAL_EVENT_CANDIDATES = [
  "lead.created",
  "payment.confirmed",
  "handoff.completed",
  "project.created",
  "onboarding.completed",
  "production.completed",
  "qa.approved",
  "delivery.completed",
  "project.closed",
  "whatsapp.cta_clicked",
  "whatsapp.message_received",
  "email.received",
] as const;

export type ClientOperationalEventName =
  (typeof CLIENT_OPERATIONAL_EVENT_CANDIDATES)[number];

export type CommercialToOperationsHandoff = {
  handoffId: string;
  clientId: string;
  leadId: string | null;
  saleId: string;
  paymentId: string;
  status: HandoffStatus;
  client: {
    identification: string;
    contactName: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
  };
  sale: {
    product: string;
    amount: number;
    currency: string;
    soldAt: string;
    commercialOwner: string;
  };
  scope: {
    service: string;
    deliverables: readonly string[];
    includedItems: readonly string[];
    excludedItems: readonly string[];
    revisionLimit: number | null;
    agreedTimeline: string | null;
  };
  commitments: {
    promises: readonly string[];
    promisedDates: readonly string[];
    specialConditions: readonly string[];
    discounts: readonly string[];
    bonuses: readonly string[];
  };
  commercialOwner: string;
  operationsOwner: string;
  notes: string | null;
  evidenceReferences: readonly string[];
  completedAt: string | null;
};
