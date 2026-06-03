import { AuthForm } from "@/features/auth/components/auth-form";
import { signIn } from "@/features/auth/server/actions";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    registered?: string;
  }>;
};

/**
 * Public sign-in screen.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, registered } = await searchParams;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {registered === "true" ? (
        <p className="text-sm text-muted-foreground">
          Check your email to confirm your account, then sign in.
        </p>
      ) : null}
      <AuthForm action={signIn} mode="login" nextPath={next} />
    </div>
  );
}
