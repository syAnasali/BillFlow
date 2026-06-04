"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AuthActionState } from "@/features/auth/types/auth";

type AuthFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  mode: "login" | "register";
  nextPath?: string;
};

const initialState: AuthActionState = {};

/**
 * Shared credential form for the login and registration pages, redesigned with a premium dark glassmorphism aesthetic.
 */
export function AuthForm({ action, mode, nextPath }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <div className="w-full">
      {/* Mobile Logo Brand Header (Hidden on large desktop screens) */}
      <div className="flex flex-col items-center gap-2 mb-6 lg:hidden">
        <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800/80 p-1.5 shadow-md">
          <img
            src="/logo.png"
            alt="BillFlow"
            className="size-7 object-contain rounded-md"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <span className="hidden size-7 items-center justify-center rounded-lg bg-blue-600 text-white" style={{ display: "none" }}>
            <FileTextIcon className="size-4" />
          </span>
        </div>
        <span className="font-bold text-lg text-zinc-100 tracking-tight">BillFlow</span>
      </div>

      <Card className="w-full bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/40">
        <CardHeader>
          <CardTitle className="text-zinc-100 font-bold text-xl">{isLogin ? "Sign in" : "Create an account"}</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            {isLogin
              ? "Enter your credentials to continue to BillFlow."
              : "Create your BillFlow account with an email and password."}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel className="text-zinc-300 font-medium" htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                />
              </Field>
              <Field>
                <FieldLabel className="text-zinc-300 font-medium" htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={6}
                  required
                  placeholder="••••••••"
                  className="bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                />
              </Field>
            </FieldGroup>
            {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
            {state.error ? (
              <p className="mt-4 text-sm text-red-400 font-medium" role="alert">
                {state.error}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-blue-500/15 border-none h-10 cursor-pointer"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin size-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
            <p className="text-sm text-zinc-500 font-medium">
              {isLogin ? "New to BillFlow?" : "Already have an account?"}{" "}
              <Link
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                href={isLogin ? "/register" : "/login"}
              >
                {isLogin ? "Register" : "Sign in"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
