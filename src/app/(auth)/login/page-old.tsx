
"use client";

import React from 'react';
import Link from "next/link";
import { useActionState, Suspense, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleButton, useAuth } from "@/contexts/auth-context";


function SubmitButton() {
  const { pending } = useFormStatus();
  const { isAuthInProgress } = useAuth();
  return (
    <Button type="submit" className="w-full" disabled={pending || isAuthInProgress}>
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState(login, null);
  const { isAuthInProgress, refreshAuthStatus } = useAuth();
  
  // Handle successful login by refreshing auth status
  useEffect(() => {
    if (state?.success) {
      // Small delay to ensure Firebase state is updated
      setTimeout(() => {
        refreshAuthStatus();
      }, 100);
    }
  }, [state?.success, refreshAuthStatus]);
  
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isAuthInProgress}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required disabled={isAuthInProgress} />
          </div>
          <SubmitButton />
        </form>
        <div className="mt-2">
         <GoogleButton />
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}


function LoginSkeleton() {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-5 w-48 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
                <div className="grid gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full mt-2" />
                <Skeleton className="h-5 w-40 mx-auto mt-4" />
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
        </Suspense>
    )
}
