
"use client";

import CommunityChat from "@/components/community-chat";
import GatedContent from "@/components/gated-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Crown } from "lucide-react";
import Link from "next/link";


const CommunityPreview = () => (
  <div className="container mx-auto py-12 px-4">
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <Users className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="mt-4 font-headline text-3xl">Exclusive Premium Community</CardTitle>
        <CardDescription>
          Connect with a dedicated community of users, share your progress, and get advice from peers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
             <h3 className="text-2xl font-bold mb-4">Join the Conversation</h3>
             <Button asChild size="lg" variant="premium">
                <Link href="/subscribe"><Crown className="mr-2 h-4 w-4"/> Upgrade to Premium to Unlock</Link>
             </Button>
          </div>
          <div className="space-y-4 opacity-50 select-none">
             <div className="flex items-start gap-3 justify-start">
                <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
                <div className="bg-muted p-3 rounded-lg w-3/4">
                    <p className="font-semibold text-sm">User Alpha</p>
                    <p className="text-sm">Just hit a new PR on my squat! The creatine suggestion from my plan is really paying off.</p>
                </div>
            </div>
             <div className="flex items-start gap-3 justify-end">
                 <div className="bg-primary/20 p-3 rounded-lg w-3/4">
                    <p className="font-semibold text-sm">User Beta</p>
                    <p className="text-sm">That's awesome! I was skeptical about the magnesium for sleep, but I've been feeling so much more rested.</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
            </div>
             <div className="flex items-start gap-3 justify-start">
                <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
                 <div className="bg-muted p-3 rounded-lg w-1/2">
                    <p className="font-semibold text-sm">User Gamma</p>
                    <p className="text-sm">Has anyone tried the recommended vegan protein? Looking for taste reviews.</p>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);


export default function CommunityPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <GatedContent gateType="premium" previewComponent={<CommunityPreview />}>
        <CommunityChat />
      </GatedContent>
    </div>
  );
}

    