"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleResendVerification = async () => {
        if (resendCooldown > 0 || !user) return;
        
        try {
            await sendEmailVerification(user);
            toast({
                title: "Verification Email Sent",
                description: "A new verification link has been sent to your email address."
            });
            setResendCooldown(60); // 60s cooldown
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Sending Email",
                description: error.message
            });
        }
    };

    const handleCheckVerification = async () => {
        if (!user) return;
        
        setIsChecking(true);
        try {
            // Reload the user to get fresh data
            await user.reload();
            
            if (user.emailVerified) {
                toast({
                    title: "Email Verified! 🎉",
                    description: "Your account has been verified successfully."
                });
                // The auth context will handle the redirect
            } else {
                toast({
                    title: "Not Verified Yet",
                    description: "Please click the verification link in your email first."
                });
            }
        } catch (error) {
            console.error("Error checking verification:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to check verification status. Please try again."
            });
        } finally {
            setIsChecking(false);
        }
    };

    // Cooldown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-check verification status when user reloads
    useEffect(() => {
        if (user && user.emailVerified) {
            // User is already verified, redirect will be handled by auth context
            return;
        }
    }, [user]);

    if (loading) {
        return (
            <Card className="mx-auto max-w-md">
                <CardHeader className="text-center">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-48 mx-auto mt-4" />
                    <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="text-center">
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-5 w-24 mx-auto" />
                </CardContent>
            </Card>
        );
    }

    // If no user, redirect to login
    if (!user) {
        return (
            <Card className="mx-auto max-w-md">
                <CardHeader className="text-center">
                    <MailCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <CardTitle className="text-2xl font-headline mt-4">Please Sign In</CardTitle>
                    <CardDescription>
                        You need to be signed in to verify your email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button onClick={() => router.push('/login')} className="w-full">
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // User is verified
    if (user.emailVerified) {
        return (
            <Card className="mx-auto max-w-md">
                <CardHeader className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <CardTitle className="text-2xl font-headline mt-4">Email Verified!</CardTitle>
                    <CardDescription>
                        Your account has been successfully verified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        You will be redirected to your dashboard shortly...
                    </p>
                </CardContent>
            </Card>
        );
    }

    // User needs to verify email
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
                <MailCheck className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="text-2xl font-headline mt-4">Verify Your Email</CardTitle>
                <CardDescription>
                    We've sent a verification link to <span className="font-bold text-foreground">{user.email}</span>. 
                    Please check your inbox and click the link to activate your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                    If you don't see the email, please check your spam folder. It can sometimes take a minute or two to arrive.
                </p>
                
                <div className="flex flex-col gap-3">
                    <Button onClick={handleCheckVerification} disabled={isChecking} className="w-full">
                        {isChecking ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                I've verified, check again
                            </>
                        )}
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={handleResendVerification} 
                        disabled={resendCooldown > 0 || !user}
                        className="w-full"
                    >
                        {resendCooldown > 0 ? 
                            `Resend available in ${resendCooldown}s` : 
                            "Resend Verification Email"
                        }
                    </Button>
                    
                    <form action={logout}>
                        <Button variant="ghost" type="submit" className="w-full text-muted-foreground">
                            Sign Out
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
