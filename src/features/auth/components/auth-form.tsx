"use client";

import Link from "next/link";
import { useActionState } from "react";

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
 * Shared credential form for the login and registration pages.
 */
export function AuthForm({ action, mode, nextPath }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isLogin ? "Sign in" : "Create an account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Enter your credentials to continue to BillFlow."
            : "Create your BillFlow account with an email and password."}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </Field>
          </FieldGroup>
          {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
          {state.error ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "New to BillFlow?" : "Already have an account?"}{" "}
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href={isLogin ? "/register" : "/login"}
            >
              {isLogin ? "Register" : "Sign in"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
