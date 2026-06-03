import { createClient } from "@/lib/supabase/server";
import type { InvoicePdfData } from "@/features/invoices/types/invoice-pdf";

type InvoicePdfRow = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  status: string;
  notes: string | null;
  currency: string;
  business_name: string;
  business_phone: string | null;
  business_email: string | null;
  business_address: string | null;
  business_gst_number: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  subtotal: number | string;
  tax_rate: number | string;
  tax_total: number | string;
  discount_total: number | string;
  grand_total: number | string;
  invoice_items: Array<{
    id: string;
    item_name: string;
    quantity: number | string;
    rate: number | string;
    line_total: number | string;
    sort_order: number;
  }>;
};

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

/**
 * Loads a complete user-owned invoice and maps database rows to a delivery
 * model that can also serve future print, email, and WhatsApp workflows.
 */
export async function getInvoicePdfData(
  invoiceId: string,
): Promise<InvoicePdfData | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
        id,
        invoice_number,
        invoice_date,
        status,
        notes,
        currency,
        business_name,
        business_phone,
        business_email,
        business_address,
        business_gst_number,
        customer_name,
        customer_phone,
        customer_email,
        customer_address,
        subtotal,
        tax_rate,
        tax_total,
        discount_total,
        grand_total,
        invoice_items (id, item_name, quantity, rate, line_total, sort_order)
      `,
    )
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .order("sort_order", { referencedTable: "invoice_items", ascending: true })
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load invoice PDF data: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const invoice = data as unknown as InvoicePdfRow;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    status: invoice.status,
    notes: invoice.notes,
    currency: invoice.currency,
    business: {
      name: invoice.business_name,
      phone: invoice.business_phone,
      email: invoice.business_email,
      address: invoice.business_address,
      gstNumber: invoice.business_gst_number,
    },
    customer: {
      name: invoice.customer_name,
      phone: invoice.customer_phone,
      email: invoice.customer_email,
      address: invoice.customer_address,
    },
    items: invoice.invoice_items.map((item) => ({
      id: item.id,
      name: item.item_name,
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
      lineTotal: toNumber(item.line_total),
    })),
    totals: {
      subtotal: toNumber(invoice.subtotal),
      taxRate: toNumber(invoice.tax_rate),
      tax: toNumber(invoice.tax_total),
      discount: toNumber(invoice.discount_total),
      grandTotal: toNumber(invoice.grand_total),
    },
  };
}
