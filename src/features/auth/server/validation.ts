import type { AuthActionState } from "@/features/auth/types/auth";

export type AuthCredentials = {
  email: string;
  password: string;
};

/**
 * Validates the small credential payload before sending it to Supabase Auth.
 */
export function parseCredentials(
  formData: FormData,
):
  | { credentials: AuthCredentials; error?: never }
  | { credentials?: never; error: AuthActionState } {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.includes("@")) {
    return { error: { error: "Enter a valid email address." } };
  }

  if (typeof password !== "string" || password.length < 6) {
    return { error: { error: "Password must contain at least 6 characters." } };
  }

  return {
    credentials: {
      email: email.trim().toLowerCase(),
      password,
    },
  };
}

/**
 * Prevents an arbitrary external URL from being used as a post-login redirect.
 */
export function getSafeRedirectPath(formData: FormData) {
  const path = formData.get("next");

  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
    ? path
    : "/dashboard";
}
