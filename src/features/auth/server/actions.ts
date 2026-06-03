"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/features/auth/types/auth";
import {
  getSafeRedirectPath,
  parseCredentials,
} from "@/features/auth/server/validation";

/**
 * Signs an existing user in and stores the Supabase session in SSR cookies.
 */
export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = parseCredentials(formData);

  if (result.error) {
    return result.error;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.credentials);

  if (error) {
    return { error: error.message };
  }

  redirect(getSafeRedirectPath(formData));
}

/**
 * Creates an account. Hosted Supabase projects normally require email
 * confirmation, so the callback route exchanges the returned code for cookies.
 */
export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = parseCredentials(formData);

  if (result.error) {
    return result.error;
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...result.credentials,
    options: origin
      ? { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` }
      : undefined,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?registered=true");
}

/**
 * Ends the current browser session and returns the user to the sign-in page.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
