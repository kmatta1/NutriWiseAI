
"use client";

import React from 'react';
import Link from "next/link";
import { useActionState, Suspense, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
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
import { signup } from "@/lib/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleButton, useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { isAuthInProgress } = useAuth();
  return (
    <Button type="submit" className="w-full" disabled={pending || isAuthInProgress}>
      {pending || isAuthInProgress ? "Creating Account..." : "Create an account"}
    </Button>
  );
}

function SignupForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(signup, null);
    const { isAuthInProgress } = useAuth();
    
    useEffect(() => {
        if (state?.success) {
             toast({
                title: "Account Created!",
                description: "Please check your email to verify your account.",
            });
            router.push('/verify-email');
        }
    }, [state, toast, router]);

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl font-headline">Sign Up</CardTitle>
                <CardDescription>
                Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {state?.error && (
                    <Alert variant="destructive" className="mb-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Signup Failed</AlertTitle>
                        <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
                <form action={formAction} className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" name="firstName" placeholder="Max" required disabled={isAuthInProgress}/>
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" name="lastName" placeholder="Robinson" required disabled={isAuthInProgress}/>
                        </div>
                    </div>
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
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required disabled={isAuthInProgress}/>
                    </div>
                    <SubmitButton />
                </form>
                <div className="mt-2">
                    <GoogleButton />
                </div>
                <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Login
                </Link>
                </div>
            </CardContent>
        </Card>
    )
}

function SignupSkeleton() {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
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


export default function SignupPage() {
    const { loading } = useAuth();
    if (loading) {
        return <SignupSkeleton />
    }
    return (
        <Suspense fallback={<SignupSkeleton />}>
            <SignupForm />
        </Suspense>
    )
}
