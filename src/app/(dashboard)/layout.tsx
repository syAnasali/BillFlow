import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side auth boundary for all protected routes.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : undefined;

  return <DashboardShell userEmail={email}>{children}</DashboardShell>;
}
