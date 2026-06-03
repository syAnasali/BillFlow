import { createClient } from "@/lib/supabase/server";
import type { Invoice, InvoiceListItem, InvoicesPageData } from "@/features/invoices/types/invoice";

const DEFAULT_PAGE_SIZE = 10;

function normalizePage(page?: string) {
  const parsedPage = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function normalizeSearch(search?: string) {
  return search?.trim().slice(0, 100) ?? "";
}

/**
 * Loads one user-scoped page of invoices, supporting status filtering and invoice number search.
 */
export async function getInvoicesPage({
  page,
  search,
  status,
}: {
  page?: string;
  search?: string;
  status?: string;
}): Promise<InvoicesPageData> {
  const currentPage = normalizePage(page);
  const normalizedSearch = normalizeSearch(search);
  const from = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const to = from + DEFAULT_PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    throw new Error("Your session has expired. Sign in and try again.");
  }

  let query = supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, status, currency, grand_total, customer_name, created_at", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replace(/[%_\\]/g, "\\$&");
    query = query.ilike("invoice_number", `%${escapedSearch}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Unable to load invoices: ${error.message}`);
  }

  const totalCount = count ?? 0;

  return {
    invoices: (data ?? []).map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      status: row.status as any,
      currency: row.currency,
      grandTotal: typeof row.grand_total === "number" ? row.grand_total : Number(row.grand_total),
      customerName: row.customer_name,
      createdAt: row.created_at,
    })),
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE)),
    search: normalizedSearch,
    status: status ?? "all",
  };
}

/**
 * Loads a single invoice and its items, specifically mapped for input editing.
 */
export async function getInvoiceForEdit(invoiceId: string): Promise<Invoice | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (*)
    `)
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .order("sort_order", { referencedTable: "invoice_items", ascending: true })
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load invoice: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const invoice = data as any;

  return {
    id: invoice.id,
    userId: invoice.user_id,
    businessId: invoice.business_id,
    customerId: invoice.customer_id,
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    status: invoice.status,
    notes: invoice.notes,
    currency: invoice.currency,
    businessName: invoice.business_name,
    businessPhone: invoice.business_phone,
    businessEmail: invoice.business_email,
    businessAddress: invoice.business_address,
    businessGstNumber: invoice.business_gst_number,
    customerName: invoice.customer_name,
    customerPhone: invoice.customer_phone,
    customerEmail: invoice.customer_email,
    customerAddress: invoice.customer_address,
    subtotal: Number(invoice.subtotal),
    taxRate: Number(invoice.tax_rate),
    taxTotal: Number(invoice.tax_total),
    discountTotal: Number(invoice.discount_total),
    grandTotal: Number(invoice.grand_total),
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    items: (invoice.invoice_items ?? []).map((item: any) => ({
      id: item.id,
      itemName: item.item_name,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      lineTotal: Number(item.line_total),
      sortOrder: item.sort_order,
    })) as any,
  } as any;
}
