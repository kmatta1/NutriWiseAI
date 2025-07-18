
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseFirestore } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { SupplementAdvisorOutput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Crown, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { PersonalizedSchedule } from "@/components/personalized-schedule";
import { NoPlansState } from "@/components/no-plans-state";
import GatedContent from "@/components/gated-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type SavedPlan = {
    id: string;
    createdAt: string;
    fitnessGoals: string;
    plan: SupplementAdvisorOutput;
}

const PlansPreview = () => (
    <div className="container mx-auto py-12 px-4">
        <Card className="text-center py-12">
            <CardHeader>
                <Sparkles className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 font-headline text-3xl">Save, Track, and Compare Your Plans</CardTitle>
                <CardDescription className="max-w-prose mx-auto">
                    As a premium member, all your AI-generated supplement stacks are saved here. Revisit past recommendations, compare different plans, and stay consistent with your health journey.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg" variant="premium">
                    <Link href="/subscribe"><Crown className="mr-2"/> Upgrade to Save Plans</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
);

export default function MyPlansPage() {
    const { user, loading: authLoading, profile } = useAuth();
    const [plans, setPlans] = useState<SavedPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            if (authLoading) return; 
            if (user && profile?.isPremium) {
                setLoading(true);
                try {
                    const firestore = getFirebaseFirestore();
                    const plansCollectionRef = collection(firestore, `users/${user.uid}/plans`);
                    const q = query(plansCollectionRef, orderBy("createdAt", "desc"));
                    const plansSnapshot = await getDocs(q);
                    const fetchedPlans = plansSnapshot.docs.map(doc => {
                         const data = doc.data();
                         return {
                            id: doc.id,
                            createdAt: new Date(data.createdAt.seconds * 1000).toLocaleDateString(),
                            fitnessGoals: data.input.fitnessGoals,
                            plan: data.output,
                        }
                    }) as SavedPlan[];
                    setPlans(fetchedPlans);
                } catch (error) {
                    console.error("Error fetching plans:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        
        if (!authLoading) {
            fetchPlans();
        }

    }, [user, authLoading, profile?.isPremium]);
    
    return (
        <GatedContent gateType="premium" previewComponent={<PlansPreview />}>
            <div className="container mx-auto py-12 px-4">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold font-headline">My Supplement Plans</h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Here are all the personalized supplement stacks you've generated.
                        </p>
                    </div>
                     <Button asChild>
                        <Link href="/advisor"><PlusCircle className="mr-2"/> Generate New Plan</Link>
                    </Button>
                </div>

                {authLoading || loading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                ) : plans.length === 0 ? (
                    <NoPlansState />
                ) : (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {plans.map((savedPlan, index) => (
                           <AccordionItem value={`item-${index}`} key={savedPlan.id} className="bg-card border rounded-lg overflow-hidden">
                                <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                    <div className="flex flex-col text-left">
                                        <span>Plan for: {savedPlan.fitnessGoals}</span>
                                        <span className="text-sm font-normal text-muted-foreground">Created on: {savedPlan.createdAt}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <div className="space-y-6">
                                        {savedPlan.plan.suggestions.map((suggestion, sIndex) => (
                                            <Card key={sIndex} className="p-4 flex items-start gap-4">
                                                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                    <Image 
                                                        src={suggestion.imageUrl || "https://placehold.co/150x150.png"} 
                                                        alt={suggestion.supplementName}
                                                        fill
                                                        className="object-cover"
                                                     />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{suggestion.supplementName}</h4>
                                                    <p className="text-sm text-muted-foreground">{suggestion.brand}</p>
                                                    <p className="text-sm font-semibold text-primary">{suggestion.price}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="mt-6">
                                        <PersonalizedSchedule name="Daily Schedule" scheduleText={savedPlan.plan.dailySchedule} />
                                    </div>
                                    <div className="mt-4">
                                        <Card className="bg-secondary/30">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold">Additional Notes</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="whitespace-pre-wrap text-muted-foreground">{savedPlan.plan.additionalNotes}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </AccordionContent>
                           </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </GatedContent>
    );
}

    