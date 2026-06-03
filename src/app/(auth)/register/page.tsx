import { AuthForm } from "@/features/auth/components/auth-form";
import { signUp } from "@/features/auth/server/actions";

/**
 * Public account registration screen.
 */
export default function RegisterPage() {
  return <AuthForm action={signUp} mode="register" />;
}
