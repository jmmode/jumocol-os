import { currentUser } from "@/server/auth/access";
import { TiviplayNavigationClient } from "@/features/tiviplay-command-center/tiviplay-navigation-client";

/** Rol comprobado en servidor; los operadores solo ven Turno, Atención y Manuales. */
export async function TiviplayNavigation() {
  const actor = await currentUser();
  return <TiviplayNavigationClient operator={actor?.role === "OPERADOR"} />;
}
