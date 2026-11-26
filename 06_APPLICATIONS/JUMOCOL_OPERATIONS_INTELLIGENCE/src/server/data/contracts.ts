import type { ClientWebDeliverySnapshot } from "@/features/client-web-delivery/types";
import type { LandingPageCommercialSnapshot } from "@/features/landing-page-commercial/types";
import type { MarketingCommercialSnapshot } from "@/features/marketing-commercial/types";
import type { TiviplayMarketingSnapshot } from "@/features/tiviplay-marketing/types";
import type { TechnologyAiSnapshot } from "@/features/technology-ai/types";

export type OperationsDataProvider = {
  operations: {
    getClientWebDeliverySnapshot: () => Promise<ClientWebDeliverySnapshot>;
  };
  marketingCommercial: {
    getSnapshot: () => Promise<MarketingCommercialSnapshot>;
    getTiviplaySnapshot: () => Promise<TiviplayMarketingSnapshot>;
    getLandingPageSnapshot: () => Promise<LandingPageCommercialSnapshot>;
  };
  technologyAi: {
    getSnapshot: () => Promise<TechnologyAiSnapshot>;
  };
};
