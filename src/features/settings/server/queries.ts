import { createClient } from "@/lib/supabase/server";
import type { BusinessProfile } from "@/features/settings/types/business-profile";

/**
 * Loads the authenticated user's single business profile, if it exists.
 */
export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, phone, email, address, gst_number, logo_url")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load business profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    gstNumber: data.gst_number,
    logoUrl: data.logo_url,
  };
}
