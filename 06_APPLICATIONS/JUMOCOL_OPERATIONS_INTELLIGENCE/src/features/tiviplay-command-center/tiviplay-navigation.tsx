"use client";

import { useOperatorNavigation } from "@/components/layout/operator-navigation-context";
import { TiviplayNavigationClient } from "@/features/tiviplay-command-center/tiviplay-navigation-client";

/** Navegación client-safe: puede importarse desde páginas Server o componentes Client. */
export function TiviplayNavigation() {
  const operator = useOperatorNavigation();
  return <TiviplayNavigationClient operator={operator} />;
}
