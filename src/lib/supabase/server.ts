import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a request-scoped Supabase client for Server Components, Server
 * Actions, and Route Handlers. Cookie writes can fail during Server Component
 * rendering, so middleware handles refresh writes before protected pages render.
 *
 * Example:
 * const supabase = await createClient();
 * const { data, error } = await supabase.from("invoices").select("*");
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. The middleware refresh
            // path writes updated session cookies to the response instead.
          }
        },
      },
    },
  );
}
