"use client";

import React, { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const urlError = searchParams.get("error");

  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    login,
    null
  );

  const errorMessage = state?.error || urlError;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#7C5CFF]/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo variant="full" size="lg" className="mb-3" />
          <p className="text-sm text-[#8B8B96]">
            Welcome back. Sign in to your workspace.
          </p>
        </div>

        <Card className="border-[#26262E] bg-[#16161C]/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-[#F2F2F5]">Sign In</CardTitle>
            <CardDescription className="text-xs text-[#8B8B96]">
              Enter your account credentials to continue
            </CardDescription>
          </CardHeader>

          <form action={formAction}>
            <CardContent className="space-y-4 pt-0">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-lg border border-[#F87171]/20 bg-[#F87171]/10 p-3 text-xs text-[#F87171]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="alex@example.com"
                  className="border-[#26262E] bg-[#0B0B0F] focus-visible:ring-[#7C5CFF]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="border-[#26262E] bg-[#0B0B0F] focus-visible:ring-[#7C5CFF]"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white font-medium shadow-md shadow-[#7C5CFF]/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-[#8B8B96]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#7C5CFF] font-medium hover:underline focus:outline-none"
                >
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-[#8B8B96]">
          <Loader2 className="h-6 w-6 animate-spin text-[#7C5CFF]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
