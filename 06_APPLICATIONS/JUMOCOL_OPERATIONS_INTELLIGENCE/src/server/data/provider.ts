import type { OperationsDataProvider } from "@/server/data/contracts";
import { fixtureDataProvider } from "@/server/data/providers/fixtures";
import { getLandingPageCommercialSnapshot } from "@/server/leads/landing-page-snapshot";

const composedDataProvider: OperationsDataProvider = {
  ...fixtureDataProvider,
  marketingCommercial: {
    ...fixtureDataProvider.marketingCommercial,
    getLandingPageSnapshot: getLandingPageCommercialSnapshot,
  },
};

export function getDataProvider(): OperationsDataProvider {
  const provider = process.env.JUMOCOL_DATA_PROVIDER ?? "fixtures";

  if (provider !== "fixtures") {
    throw new Error(`Proveedor de datos no autorizado para el MVP: ${provider}`);
  }

  return composedDataProvider;
}
