import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { TiviplayCommandCenter } from "@/features/tiviplay-command-center/tiviplay-command-center";

export const metadata: Metadata = {
  title: "TiviPlay · Command Center",
};

export default async function TiviplayPage() {
  const identity = await requirePage("/operaciones/tiviplay");
  return <TiviplayCommandCenter admin={identity.role === "ADMIN"} />;
}

