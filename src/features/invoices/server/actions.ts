"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { invoiceIdSchema, invoiceSchema, invoiceStatusSchema } from "@/features/invoices/schemas/invoice";
import type { InvoiceActionState, InvoiceStatus } from "@/features/invoices/types/invoice";

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return error || !userId ? null : { supabase, userId };
}

/**
 * Transactionally saves a new or existing invoice, captures historical snapshots,
 * and maintains line item sets securely.
 */
export async function saveInvoice(
  _previousState: InvoiceActionState,
  formData: FormData,
): Promise<InvoiceActionState> {
  const auth = await getAuthenticatedUserId();
  if (!auth) {
    return { error: "Your session has expired. Sign in and try again." };
  }

  // Parse items from the hidden JSON stringifier
  let itemsList: any[] = [];
  try {
    const itemsRaw = formData.get("itemsJson");
    if (typeof itemsRaw === "string") {
      itemsList = JSON.parse(itemsRaw);
    }
  } catch {
    return { error: "Failed to process invoice line items. Try again." };
  }

  const result = invoiceSchema.safeParse({
    id: formData.get("id") || undefined,
    customerId: formData.get("customerId"),
    invoiceNumber: formData.get("invoiceNumber"),
    invoiceDate: formData.get("invoiceDate"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    currency: formData.get("currency"),
    taxRate: formData.get("taxRate"),
    discountTotal: formData.get("discountTotal"),
    items: itemsList,
  });

  if (!result.success) {
    return {
      error: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors as any,
    };
  }

  const { id, customerId, invoiceNumber, invoiceDate, status, notes, currency, taxRate, discountTotal, items } = result.data;

  // 1. Fetch user's business profile (must exist)
  const { data: business, error: businessError } = await auth.supabase
    .from("businesses")
    .select("*")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (businessError || !business) {
    return { error: "Create your Business Profile in Settings before creating invoices." };
  }

  // 2. Fetch customer profile (must exist and belong to user)
  const { data: customer, error: customerError } = await auth.supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (customerError || !customer) {
    return { error: "Selected customer not found. Verify your customers directory." };
  }

  // 3. Compute totals on server side for tamper-prevention
  let subtotal = 0;
  const lineItemsToInsert = items.map((item, index) => {
    const total = Number((item.quantity * item.rate).toFixed(2));
    subtotal += total;
    return {
      item_name: item.itemName,
      quantity: item.quantity,
      rate: item.rate,
      line_total: total,
      sort_order: index,
    };
  });

  const taxTotal = Number((subtotal * (taxRate / 100)).toFixed(2));
  const grandTotal = Number(Math.max(0, subtotal + taxTotal - discountTotal).toFixed(2));

  // Prepare database record containing historical snapshots
  const invoiceRecord = {
    user_id: auth.userId,
    business_id: business.id,
    customer_id: customer.id,
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    status,
    notes: notes || null,
    currency,
    business_name: business.name,
    business_phone: business.phone || null,
    business_email: business.email || null,
    business_address: business.address || null,
    business_gst_number: business.gst_number || null,
    customer_name: customer.name,
    customer_phone: customer.phone || null,
    customer_email: customer.email || null,
    customer_address: customer.address || null,
    subtotal,
    tax_rate: taxRate,
    tax_total: taxTotal,
    discount_total: discountTotal,
    grand_total: grandTotal,
  };

  if (id) {
    const { data: existing, error: existingError } = await auth.supabase
      .from("invoices")
      .select("status")
      .eq("id", id)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (existingError || !existing) {
      return { error: "Invoice not found." };
    }
  }

  // 4. Run Transaction-like DB writes
  if (id) {
    // Edit flow:
    // Update invoice row
    const { error: updateError } = await auth.supabase
      .from("invoices")
      .update(invoiceRecord)
      .eq("id", id)
      .eq("user_id", auth.userId);

    if (updateError) {
      return { error: `Failed to update invoice: ${updateError.message}` };
    }

    // Delete old items
    const { error: deleteItemsError } = await auth.supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteItemsError) {
      return { error: `Failed to refresh line items: ${deleteItemsError.message}` };
    }

    // Insert new items
    const itemsWithInvoiceId = lineItemsToInsert.map((item) => ({
      ...item,
      invoice_id: id,
    }));

    const { error: insertItemsError } = await auth.supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (insertItemsError) {
      return { error: `Failed to save new line items: ${insertItemsError.message}` };
    }
  } else {
    // Creation flow:
    // Insert invoice header
    const { data: newInvoice, error: createError } = await auth.supabase
      .from("invoices")
      .insert(invoiceRecord)
      .select("id")
      .single();

    if (createError || !newInvoice) {
      return { error: `Failed to create invoice: ${createError.message}` };
    }

    // Insert items
    const itemsWithInvoiceId = lineItemsToInsert.map((item) => ({
      ...item,
      invoice_id: newInvoice.id,
    }));

    const { error: insertItemsError } = await auth.supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (insertItemsError) {
      // Try to clean up invoice header on line items fail
      await auth.supabase.from("invoices").delete().eq("id", newInvoice.id);
      return { error: `Failed to save line items: ${insertItemsError.message}` };
    }
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  // Since React 19 Server Action redirect works, we redirect inside useEffect on client or directly
  return { success: id ? "Invoice updated." : "Invoice created." };
}

/**
 * Deletes one user-owned invoice. Cascade triggers delete invoice_items.
 */
export async function deleteInvoice(invoiceId: string) {
  const parsedId = invoiceIdSchema.safeParse(invoiceId);
  if (!parsedId.success) {
    return { error: "Invalid invoice." };
  }

  const auth = await getAuthenticatedUserId();
  if (!auth) {
    return { error: "Your session has expired. Sign in and try again." };
  }

  const { error } = await auth.supabase
    .from("invoices")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", auth.userId);

  if (error) {
    return { error: `Unable to delete invoice: ${error.message}` };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: "Invoice deleted." };
}

/**
 * Fast toggles invoice status.
 */
export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const parsedId = invoiceIdSchema.safeParse(invoiceId);
  const parsedStatus = invoiceStatusSchema.safeParse(status);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Invalid parameters." };
  }

  const auth = await getAuthenticatedUserId();
  if (!auth) {
    return { error: "Your session has expired. Sign in and try again." };
  }

  const { error } = await auth.supabase
    .from("invoices")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("user_id", auth.userId);

  if (error) {
    return { error: `Unable to update status: ${error.message}` };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: "Invoice status updated." };
}
