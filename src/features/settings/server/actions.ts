"use server";

import { revalidatePath } from "next/cache";

import { businessProfileSchema } from "@/features/settings/schemas/business-profile";
import type { BusinessProfileActionState } from "@/features/settings/types/business-profile";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates or updates the authenticated user's business profile. The database
 * unique constraint on user_id guarantees one business per user.
 */
export async function saveBusinessProfile(
  _previousState: BusinessProfileActionState,
  formData: FormData,
): Promise<BusinessProfileActionState> {
  const result = businessProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    gstNumber: formData.get("gstNumber"),
    logoUrl: formData.get("logoUrl"),
  });

  if (!result.success) {
    return {
      error: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return { error: "Your session has expired. Sign in and try again." };
  }

  const { error } = await supabase.from("businesses").upsert(
    {
      user_id: userId,
      name: result.data.name,
      phone: result.data.phone || null,
      email: result.data.email || null,
      address: result.data.address || null,
      gst_number: result.data.gstNumber || null,
      logo_url: result.data.logoUrl || null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: `Unable to save business profile: ${error.message}` };
  }

  revalidatePath("/settings");
  return { success: "Business profile saved." };
}
