
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Shield, Sparkles, Crown } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type GatedContentProps = {
  children: React.ReactNode;
  gateType?: "auth" | "premium" | "admin";
  previewComponent?: React.ReactNode;
};

const LoadingState = () => (
    <div className="container mx-auto py-12 px-4" data-testid="loading-spinner">
        <div className="flex flex-col items-center text-center">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            <h2 className="mt-4 text-2xl font-bold">Verifying Access...</h2>
            <p className="text-muted-foreground">Just a moment while we check your credentials.</p>
        </div>
        <div className="mt-8">
            <Skeleton className="h-64 w-full" />
        </div>
    </div>
);

const Gate = ({ icon, title, message, primaryCta, secondaryCta }: { icon: React.ReactNode, title: string, message: string, primaryCta: React.ReactNode, secondaryCta?: React.ReactNode }) => (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            {icon}
          </div>
          <CardTitle className="mt-4">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex flex-col gap-3">
            {primaryCta}
            {secondaryCta}
          </div>
        </CardContent>
      </Card>
    </div>
);

export default function GatedContent({ children, gateType = "auth", previewComponent }: GatedContentProps) {
  const { user, loading, profile } = useAuth();
  
  if (loading) {
    return <LoadingState />;
  }
  
  // A non-authenticated user trying to access ANY gated content.
  if (!user) {
      if ((gateType === 'premium' || gateType === 'admin') && previewComponent) {
        return <>{previewComponent}</>;
      }
      
      const title = "Login to Continue";
      const message = "Please login or create a free account to access this content.";
          
      return (
        <Gate
          icon={<Lock className="w-8 h-8 text-primary" />}
          title={title}
          message={message}
          primaryCta={<Button asChild className="w-full"><Link href="/login">Login</Link></Button>}
          secondaryCta={<Button variant="outline" asChild className="w-full"><Link href="/signup">Create Free Account</Link></Button>}
        />
      );
  }

  // An authenticated user who is not premium, trying to access premium content.
  if (gateType === 'premium' && !profile?.isPremium) {
      if (previewComponent) {
        return <>{previewComponent}</>;
      }
      return (
          <Gate
              icon={<Crown className="w-8 h-8 text-yellow-500" />}
              title="Premium Membership Required"
              message="You need a premium membership to access this exclusive content."
              primaryCta={
              <Button asChild className="w-full" variant="premium">
                  <Link href="/subscribe">Upgrade to Premium</Link>
              </Button>
              }
          />
      );
  }

  // An authenticated user who is not an admin, trying to access admin content.
   if (gateType === 'admin' && !profile?.isAdmin) {
       if (previewComponent) {
           return <>{previewComponent}</>
       }
      return (
          <Gate
              icon={<Shield className="w-8 h-8 text-destructive" />}
              title="Access Denied"
              message="You do not have administrative privileges to view this page."
              primaryCta={
              <Button asChild className="w-full">
                  <Link href="/">Return to Homepage</Link>
              </Button>
              }
          />
      );
  }

  // If all checks pass, render the children.
  return <>{children}</>;
}
