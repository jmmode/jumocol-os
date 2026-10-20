import { CLIENT_WEB_DELIVERY_DEMO_FIXTURE } from "@/features/client-web-delivery/fixtures";
import { LANDING_PAGE_COMMERCIAL_DEMO_FIXTURE } from "@/features/landing-page-commercial/fixtures";
import { MARKETING_COMMERCIAL_DEMO_FIXTURE } from "@/features/marketing-commercial/fixtures";
import { TIVIPLAY_MARKETING_DEMO_FIXTURE } from "@/features/tiviplay-marketing/fixtures";
import { TECHNOLOGY_AI_ARCHITECTURE_FIXTURE } from "@/features/technology-ai/fixtures";
import type { OperationsDataProvider } from "@/server/data/contracts";

export const fixtureDataProvider: OperationsDataProvider = {
  operations: {
    async getClientWebDeliverySnapshot() {
      return CLIENT_WEB_DELIVERY_DEMO_FIXTURE;
    },
  },
  marketingCommercial: {
    async getSnapshot() {
      return MARKETING_COMMERCIAL_DEMO_FIXTURE;
    },
    async getTiviplaySnapshot() {
      return TIVIPLAY_MARKETING_DEMO_FIXTURE;
    },
    async getLandingPageSnapshot() {
      return LANDING_PAGE_COMMERCIAL_DEMO_FIXTURE;
    },
  },
  technologyAi: {
    async getSnapshot() {
      return TECHNOLOGY_AI_ARCHITECTURE_FIXTURE;
    },
  },
};
