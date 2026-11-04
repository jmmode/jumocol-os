import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TiviplayCommandCenter } from "@/features/tiviplay-command-center/tiviplay-command-center";

export const metadata: Metadata = {
  title: "TiviPlay · Command Center",
};

export default async function TiviplayPage() {
  const identity = await requirePage("/operaciones/tiviplay");
  if (identity.role === "OPERADOR") redirect("/operaciones/tiviplay/turno");
  return <TiviplayCommandCenter admin={identity.role === "ADMIN"} />;
}

