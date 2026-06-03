import { redirect } from "next/navigation";

import { getBusinessProfile } from "@/features/settings/server/queries";
import { InvoiceBuilderForm } from "@/features/invoices/components/invoice-builder-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewInvoicePage() {
  const profile = await getBusinessProfile();

  if (!profile) {
    redirect("/settings?error=no-business");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load customers directory: ${error.message}`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <InvoiceBuilderForm customers={customers || []} />
    </div>
  );
}
