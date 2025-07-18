"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SupplementStackCard } from "@/components/supplement-stack-card";
import { fallbackAI, type SupplementStack, type UserProfile } from "@/lib/fallback-ai";
import AdvisorForm from "@/components/advisor-form";
import { 
  FlaskConical, 
  Users, 
  TrendingUp, 
  Zap, 
  Award,
  BookOpen,
  Sparkles
} from "lucide-react";

export default function AdvisorPage() {
  const [loading, setLoading] = useState(false);
  const [recommendedStack, setRecommendedStack] = useState<SupplementStack | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setRecommendedStack(null);
    
    try {
      // Transform form data to UserProfile
      const userProfile: UserProfile = {
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        fitnessGoals: [formData.fitnessGoals], // Convert to array
        dietaryRestrictions: formData.dietaryRestrictions ? [formData.dietaryRestrictions] : [],
        currentSupplements: formData.currentSupplements ? formData.currentSupplements.split(',').map((s: string) => s.trim()) : [],
        healthConcerns: formData.healthConcerns ? [formData.healthConcerns] : [],
        budget: formData.budget ? parseInt(formData.budget, 10) : 100,
        experienceLevel: formData.experienceLevel || 'beginner',
        lifestyle: formData.lifestyle || 'moderately_active',
        userId: 'user-' + Date.now() // Temporary ID
      };

      // Generate evidence-based supplement stack
      const stack = await fallbackAI.generateEvidenceBasedStack(userProfile);
      setRecommendedStack(stack);

      toast({
        title: "Stack Generated! 🎉",
        description: "Your personalized supplement stack is ready, backed by scientific evidence.",
      });

    } catch (error: any) {
      console.error("Error generating supplement stack:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "We couldn't generate your stack right now. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (stack: SupplementStack) => {
    // Track purchase intent
    console.log('Purchase intent for stack:', stack.id);
    
    // Redirect to purchase flow
    toast({
      title: "Redirecting to Purchase",
      description: "Taking you to secure checkout...",
    });
    
    // TODO: Implement actual purchase flow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg"></div>
              <div className="relative bg-primary/10 p-6 rounded-full">
                <FlaskConical className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Supplement Stack Advisor
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get personalized supplement stacks that work synergistically together, 
            backed by scientific research and proven user results.
          </p>

          {/* Value Proposition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Science-Backed</h3>
                <p className="text-sm text-muted-foreground">
                  Every recommendation is backed by peer-reviewed research and clinical studies
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Synergistic Stacks</h3>
                <p className="text-sm text-muted-foreground">
                  Supplements that work together, not just individual products
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Proven Results</h3>
                <p className="text-sm text-muted-foreground">
                  Based on real user outcomes and success patterns
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Section */}
        {!recommendedStack && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tell Us About Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdvisorForm onSubmit={handleSubmit} loading={loading} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-primary font-medium">Analyzing Your Profile...</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-56 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-52 mb-2" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {recommendedStack && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-400 font-medium">
                  Your Personalized Stack is Ready!
                </span>
              </div>
              <p className="text-muted-foreground">
                This stack is designed specifically for your goals, backed by science and user success data.
              </p>
            </div>

            <SupplementStackCard 
              stack={recommendedStack}
              onPurchase={handlePurchase}
              isLoading={false}
            />

            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onClick={() => setRecommendedStack(null)}
                className="mr-4"
              >
                Generate Another Stack
              </Button>
              <Button variant="ghost">
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More About This Stack
              </Button>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">Scientific Studies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">89%</div>
              <div className="text-sm text-muted-foreground">User Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Stack Combinations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Expert Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
