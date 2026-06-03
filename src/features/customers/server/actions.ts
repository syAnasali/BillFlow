"use server";

import { revalidatePath } from "next/cache";

import {
  customerIdSchema,
  customerSchema,
} from "@/features/customers/schemas/customer";
import type { CustomerActionState } from "@/features/customers/types/customer";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  return error || !userId ? null : { supabase, userId };
}

/**
 * Creates or edits a customer owned by the authenticated user.
 */
export async function saveCustomer(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const result = customerSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });

  if (!result.success) {
    return {
      error: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const auth = await getAuthenticatedUserId();

  if (!auth) {
    return { error: "Your session has expired. Sign in and try again." };
  }

  const values = {
    name: result.data.name,
    phone: result.data.phone || null,
    email: result.data.email || null,
    address: result.data.address || null,
  };

  const query = result.data.id
    ? auth.supabase
        .from("customers")
        .update(values)
        .eq("id", result.data.id)
        .eq("user_id", auth.userId)
    : auth.supabase.from("customers").insert({
        ...values,
        user_id: auth.userId,
      });

  const { error } = await query;

  if (error) {
    return { error: `Unable to save customer: ${error.message}` };
  }

  revalidatePath("/customers");
  return { success: result.data.id ? "Customer updated." : "Customer created." };
}

/**
 * Deletes one customer owned by the authenticated user.
 */
export async function deleteCustomer(customerId: string) {
  const parsedId = customerIdSchema.safeParse(customerId);

  if (!parsedId.success) {
    return { error: "Invalid customer." };
  }

  const auth = await getAuthenticatedUserId();

  if (!auth) {
    return { error: "Your session has expired. Sign in and try again." };
  }

  const { error } = await auth.supabase
    .from("customers")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", auth.userId);

  if (error) {
    return { error: `Unable to delete customer: ${error.message}` };
  }

  revalidatePath("/customers");
  return { success: "Customer deleted." };
}
