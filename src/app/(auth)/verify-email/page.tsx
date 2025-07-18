
"use client";

import React from 'react';
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, RotateCw, RefreshCw, Loader2 } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
    const { user, loading, refreshAuthStatus } = useAuth();
    const { toast } = useToast();
    const [isChecking, setIsChecking] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [lastResend, setLastResend] = useState<number | null>(null);
    const [expiredInfo, setExpiredInfo] = useState(false);

    const handleResendVerification = async () => {
        if (resendCooldown > 0) return;
        if (user) {
            try {
                await sendEmailVerification(user);
                toast({
                    title: "Verification Email Sent",
                    description: "A new verification link has been sent to your email address."
                });
                setResendCooldown(30); // 30s cooldown
                setLastResend(Date.now());
            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "Error Sending Email",
                    description: error.message
                });
            }
        }
    };

    const handleCheckVerification = async () => {
        setIsChecking(true);
        try {
            await refreshAuthStatus();
            // If still not verified after check, show expired info after several attempts
            if (user && !user.emailVerified && lastResend && Date.now() - lastResend > 120000) {
                setExpiredInfo(true);
            }
        } catch (error) {
            console.error("Error refreshing auth status:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to check verification status. Please try again."
            });
        }
        setTimeout(() => setIsChecking(false), 1000);
    }

    // Cooldown timer for resend button
    React.useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    if (loading) {
        return (
             <Card className="mx-auto max-w-md">
                <CardHeader className="text-center">
                     <RotateCw className="mx-auto h-12 w-12 text-primary animate-spin" />
                     <CardTitle className="text-2xl font-headline mt-4">Loading Session...</CardTitle>
                     <CardDescription>
                        Just a moment while we check your authentication status.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-5 w-24 mx-auto" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
                <MailCheck className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="text-2xl font-headline mt-4">Verify Your Email</CardTitle>
                <CardDescription>
                   {user?.email ? (
                        <>We've sent a verification link to <span className="font-bold text-foreground">{user.email}</span>. Please check your inbox and click the link to activate your account.</>
                   ) : (
                        "Please check your inbox for a verification link to activate your account."
                   )}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                    If you don't see the email, please check your spam folder. It can sometimes take a minute or two to arrive.
                </p>
                {expiredInfo && (
                    <div className="mb-4 text-sm text-warning-foreground bg-warning/10 rounded p-2">
                        <strong>Having trouble?</strong> Your verification link may have expired. Please resend the email and try again. <br />
                        <Link href="/help" className="underline text-primary">Need help?</Link>
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <Button onClick={handleCheckVerification} disabled={isChecking}>
                        {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {isChecking ? "Checking..." : "I've verified, check again"}
                    </Button>
                    <Button variant="outline" onClick={handleResendVerification} disabled={isChecking || resendCooldown > 0}>
                        {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Resend Verification Email"}
                    </Button>
                    <form action={logout}>
                         <Button variant="link" type="submit" className="text-muted-foreground" disabled={isChecking}>
                            Logout
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
