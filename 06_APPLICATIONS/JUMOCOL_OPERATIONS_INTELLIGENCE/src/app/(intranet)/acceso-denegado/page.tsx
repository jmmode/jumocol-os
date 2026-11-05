import Link from "next/link";
import { requirePage } from "@/server/auth/access";
export default async function DeniedPage() {
  await requirePage("/acceso-denegado");
  return <div><h1 className="text-2xl font-semibold">Acceso denegado</h1><p className="my-4">Su perfil no tiene permiso para esta área o acción.</p><Link href="/operaciones/tiviplay">Volver a TiviPlay</Link></div>;
}
