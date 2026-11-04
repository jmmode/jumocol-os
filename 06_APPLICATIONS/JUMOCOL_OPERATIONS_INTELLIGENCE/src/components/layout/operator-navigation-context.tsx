"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Rol de presentación inyectado por el layout autenticado del servidor.
 * No autoriza rutas o datos: esa validación sigue en la capa server/auth.
 */
const OperatorNavigationContext = createContext(false);

export function OperatorNavigationProvider({ operator, children }: { operator: boolean; children: ReactNode }) {
  return <OperatorNavigationContext.Provider value={operator}>{children}</OperatorNavigationContext.Provider>;
}

export function useOperatorNavigation() {
  return useContext(OperatorNavigationContext);
}
