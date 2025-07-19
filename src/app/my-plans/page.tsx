
"use client";

import { useEffect, useState } from "react";
import { userProfileManager } from "@/lib/user-profile-store";
import { SupplementStack } from "@/lib/fallback-ai";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Trash2, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { NoPlansState } from "@/components/no-plans-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";

type SavedPlan = SupplementStack & {
    savedAt: string;
}

export default function MyPlansPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSavedPlans();
    }, []);

    const loadSavedPlans = async () => {
        try {
            const plans = userProfileManager.getSavedStacks() as SavedPlan[];
            setSavedPlans(plans);
        } catch (error) {
            console.error('Error loading saved plans:', error);
            toast({
                title: "Error",
                description: "Failed to load saved plans.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        try {
            userProfileManager.removeStack(planId);
            setSavedPlans(plans => plans.filter(p => p.id !== planId));
            toast({
                title: "Plan Deleted",
                description: "Your supplement plan has been removed.",
            });
        } catch (error) {
            console.error('Error deleting plan:', error);
            toast({
                title: "Error",
                description: "Failed to delete plan.",
                variant: "destructive",
            });
        }
    };

    const handlePurchasePlan = (plan: SavedPlan) => {
        if (user?.subscription?.status === 'active') {
            // For premium users, go directly to Amazon or affiliate links
            const supplementUrls = plan.supplements
                .filter(s => s.affiliateUrl || s.imageUrl)
                .map(s => s.affiliateUrl || `https://www.amazon.com/s?k=${encodeURIComponent(s.name + ' supplement')}&tag=nutriwiseai-20`);
            
            if (supplementUrls.length > 0) {
                toast({
                    title: "Opening Product Links",
                    description: `Opening ${supplementUrls.length} product pages for "${plan.name}"`,
                });
                
                // Open each supplement's purchase link
                supplementUrls.forEach((url, index) => {
                    setTimeout(() => {
                        window.open(url, '_blank');
                    }, index * 500); // Stagger the opening to avoid popup blockers
                });
            } else {
                // Fallback to cart page
                toast({
                    title: "Adding to Cart",
                    description: `Adding "${plan.name}" supplements to your cart...`,
                });
                window.location.href = `/cart?plan=${encodeURIComponent(JSON.stringify(plan))}`;
            }
        } else {
            toast({
                title: "Upgrade Required",
                description: "Please upgrade to premium to purchase supplement stacks.",
            });
            window.location.href = `/subscribe?plan=${encodeURIComponent(JSON.stringify(plan))}`;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline">My Supplement Plans</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your saved supplement stacks and track your progress
                    </p>
                </div>
                <Button asChild>
                    <Link href="/advisor">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Plan
                    </Link>
                </Button>
            </div>

            {savedPlans.length === 0 ? (
                <NoPlansState />
            ) : (
                <div className="grid gap-6">
                    {savedPlans.map((plan) => (
                        <Card key={plan.id} className="overflow-hidden bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Saved: {new Date(plan.savedAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                ${plan.totalMonthlyCost}/month
                                            </span>
                                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                                {plan.evidenceScore}/10 Evidence Score
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            className="btn-primary"
                                            size="sm"
                                            onClick={() => handlePurchasePlan(plan)}
                                        >
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            Purchase
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                                            onClick={() => handleDeletePlan(plan.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-3 text-foreground">Supplements ({plan.supplements.length})</h4>
                                        <div className="space-y-2">
                                            {plan.supplements.map((supplement, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 border border-border/30 rounded-lg hover:bg-muted/50 transition-colors">
                                                    {supplement.imageUrl ? (
                                                        <Image
                                                            src={supplement.imageUrl}
                                                            alt={supplement.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-md object-cover border border-border/50"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-md flex items-center justify-center border border-primary/30">
                                                            <span className="text-xs font-bold text-primary">
                                                                {supplement.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="font-medium text-foreground">{supplement.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {supplement.dosage} • {supplement.timing}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium text-primary">
                                                        ${supplement.price}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3 text-foreground">Key Benefits</h4>
                                        <ul className="space-y-1 text-sm">
                                            {plan.synergies.map((synergy, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-primary font-bold">•</span>
                                                    <span className="text-muted-foreground">{synergy}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <h4 className="font-semibold mb-3 mt-6 text-foreground">Expected Timeline</h4>
                                        <p className="text-sm text-muted-foreground">{plan.timeline}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}