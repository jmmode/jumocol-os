import { currentUser } from "@/server/auth/access";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default async function IntranetLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <AppShell user={user}>{children}</AppShell>;
}
