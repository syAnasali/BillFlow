import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components and other browser-only code.
 *
 * Example:
 * const supabase = createClient();
 * const { data, error } = await supabase.from("invoices").select("*");
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
