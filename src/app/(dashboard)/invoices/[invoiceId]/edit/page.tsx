import { notFound, redirect } from "next/navigation";

import { getInvoiceForEdit } from "@/features/invoices/server/queries";
import { InvoiceBuilderForm } from "@/features/invoices/components/invoice-builder-form";
import { createClient } from "@/lib/supabase/server";

type EditInvoicePageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceForEdit(invoiceId);

  if (!invoice) {
    notFound();
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
      <InvoiceBuilderForm customers={customers || []} initialInvoice={invoice} />
    </div>
  );
}
