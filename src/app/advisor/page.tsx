
"use client";

import { useState, useEffect } from "react";
import type { SupplementAdvisorOutput, SupplementAdvisorInput } from "@/lib/actions";
import { suggestSupplementsAction } from "@/lib/actions";
import AdvisorForm from "@/components/advisor-form";
import SupplementStackCard from "@/components/supplement-stack-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userProfileManager } from "@/lib/user-profile-store";
import { AlertCircle, RefreshCw, X } from "lucide-react";

export default function AdvisorPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [results, setResults] = useState<SupplementAdvisorOutput | null>(null);
  const [savedFormData, setSavedFormData] = useState<any>(null);
  const [showChangePrompt, setShowChangePrompt] = useState(false);

  useEffect(() => {
    // Load saved form data on component mount
    const savedData = userProfileManager.getFormData();
    if (savedData) {
      setSavedFormData(savedData);
      setShowChangePrompt(true);
    }
  }, []);

  const handleClearProfile = () => {
    userProfileManager.clearFormData();
    setSavedFormData(null);
    setShowChangePrompt(false);
    toast({
      title: "Profile Cleared",
      description: "Your saved profile has been cleared. You can now start fresh.",
    });
  };

  const handleUseSavedProfile = () => {
    setShowChangePrompt(false);
    toast({
      title: "Using Saved Profile",
      description: "You can edit any fields before generating recommendations.",
    });
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setResults(null);
    
    try {
      // Save form data for future visits
      userProfileManager.saveFormData(data);
      
      // Properly transform form data to UserProfile structure
      const input: SupplementAdvisorInput = {
        age: parseInt(data.age, 10),
        gender: data.gender,
        fitnessGoals: Array.isArray(data.fitnessGoals) ? data.fitnessGoals : [data.fitnessGoals],
        dietaryRestrictions: data.diet ? [data.diet] : [],
        currentSupplements: data.otherCriteria ? data.otherCriteria.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        healthConcerns: Array.isArray(data.healthConcerns) ? data.healthConcerns : (data.healthConcerns ? [data.healthConcerns] : []),
        budget: data.budget ? parseInt(data.budget, 10) : 100,
        experienceLevel: data.activityLevel,
        lifestyle: `${data.sleepQuality} sleep, ${data.activityLevel} activity`,
        activityLevel: data.activityLevel,
        diet: data.diet,
        sleepQuality: data.sleepQuality,
        otherCriteria: data.otherCriteria,
        race: data.race,
        weight: data.weight ? parseInt(data.weight, 10) : undefined,
      };
      
      console.log('Transformed input:', input); // Debug log
      const result = await suggestSupplementsAction(input);
      
      if (result.success) {
        setResults(result);
        setShowChangePrompt(false);
        toast({
          title: "Recommendations Generated",
          description: "Your personalized supplement stack has been created based on your profile.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate recommendations. Please try again.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Error submitting advisor form:", error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: error.message || "Failed to generate recommendation. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (stack: any) => {
    try {
      // Save stack to user's plans
      userProfileManager.saveStack(stack);
      
      toast({
        title: "Stack Saved!",
        description: `"${stack.name}" has been added to your plans.`,
      });
      
      // Check if user is premium and handle accordingly
      const userData = userProfileManager.getProfile();
      if (userData?.subscription?.status === 'active') {
        // For premium users, show options to purchase directly
        const supplementUrls = stack.supplements
          .filter((s: any) => s.affiliateUrl || s.imageUrl)
          .map((s: any) => s.affiliateUrl || `https://www.amazon.com/s?k=${encodeURIComponent(s.name + ' supplement')}&tag=nutriwiseai-20`);
        
        if (supplementUrls.length > 0) {
          toast({
            title: "Ready to Purchase",
            description: "Opening product links for your stack supplements...",
          });
          
          // Open each supplement's purchase link with delay
          supplementUrls.forEach((url: string, index: number) => {
            setTimeout(() => {
              window.open(url, '_blank');
            }, index * 500);
          });
        } else {
          // Redirect to cart page as fallback
          window.location.href = `/cart?stack=${encodeURIComponent(JSON.stringify(stack))}`;
        }
      } else {
        // For non-premium users, redirect to subscription
        toast({
          title: "Upgrade to Purchase",
          description: "Upgrade to premium to purchase supplements directly.",
        });
        window.location.href = `/subscribe?stack=${encodeURIComponent(JSON.stringify(stack))}`;
      }
    } catch (error) {
      console.error('Error saving stack:', error);
      toast({
        title: "Error",
        description: "Failed to save stack. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background">
      {/* Hero Section */}
      <div className="relative py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Enhanced NutriWise Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="flex items-center space-x-4 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-black/90 backdrop-blur-lg px-8 py-6 rounded-2xl border border-slate-700/50 shadow-2xl">
                  {/* Lightning Icon */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  {/* Brand Text */}
                  <div className="text-left">
                    <div className="flex items-baseline space-x-2">
                      <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                        NutriWise
                      </h1>
                      <span className="text-lg font-bold text-orange-400">AI</span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 tracking-wide">Elite Performance Nutrition</p>
                  </div>
                  
                  {/* Mini Trust Badge */}
                  <div className="hidden sm:block pl-4 border-l border-slate-600">
                    <div className="text-orange-400 font-bold text-sm">★★★★★</div>
                    <div className="text-xs text-slate-400">Science-Backed</div>
                  </div>
                </div>
                
                {/* Ambient Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl scale-110 -z-10"></div>
              </div>
            </div>
            
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">AI-Powered Analysis</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-headline tracking-tight mb-6">
              Build Your Perfect
              <span className="text-primary block">Supplement Stack</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get personalized supplement recommendations based on cutting-edge research and your unique fitness profile.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {loading ? (
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-base font-semibold text-primary">AI Processing Your Profile</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tight mb-4">
                  Analyzing Your <span className="text-primary">Athletic Profile</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Our advanced AI is comparing your profile against millions of data points from elite athletes and scientific studies.
                </p>
              </div>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full bg-muted/30 rounded-xl" />
                    <Skeleton className="h-16 w-full bg-muted/30 rounded-xl" />
                    <Skeleton className="h-16 w-full bg-muted/30 rounded-xl" />
                    <Skeleton className="h-12 w-3/4 bg-muted/30 rounded-xl mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : results && results.success ? (
            <div className="w-full">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span className="text-base font-semibold text-primary">Your Results Are Ready</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tight mb-4">
                  Your Personalized <span className="text-primary">Elite Stack</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                  Based on cutting-edge research, your unique athletic profile, and data from thousands of elite athletes.
                </p>
              </div>
              <SupplementStackCard 
                stack={results.stack} 
                onPurchase={handlePurchase}
                isLoading={loading}
              />
            </div>
          ) : results && !results.success ? (
            <div className="w-full max-w-4xl">
              <Card className="border-red-500/20 bg-red-500/5 glass-effect">
                <CardContent className="pt-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-red-400 mb-4">
                    Unable to Generate Elite Recommendations
                  </h2>
                  <p className="text-red-300 mb-8 text-lg">
                    {results.message || "There was an error generating your supplement stack. Our AI needs more data."}
                  </p>
                  <Button 
                    onClick={() => setResults(null)}
                    className="btn-primary"
                    size="lg"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {showChangePrompt && savedFormData && (
                <Card className="w-full max-w-5xl mb-8 glass-effect border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-foreground">
                          Welcome Back, Elite Athlete!
                        </h3>
                      </div>
                      <Button 
                        onClick={() => setShowChangePrompt(false)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg">
                      We found your previous profile. Ready to update your elite supplement protocol?
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      <Button 
                        onClick={handleUseSavedProfile}
                        className="btn-primary"
                        size="lg"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Use Previous Profile
                      </Button>
                      <Button 
                        onClick={handleClearProfile}
                        variant="outline"
                        size="lg"
                        className="border-primary/20 hover:bg-primary/10"
                      >
                        Start Fresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Hero Section */}
              <div className="text-center mb-16 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">AI-Powered Analysis</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter">
                  ELITE <span className="text-primary">AI ADVISOR</span>
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto">
                  Your body is unique. Your supplements should dominate like you do. 
                  Get a personalized stack designed for peak performance.
                </p>
              </div>

              {/* Main Form Card */}
              <Card className="w-full max-w-6xl shadow-2xl md:grid md:grid-cols-5 border-primary/20 glass-effect relative overflow-visible">
                {/* Left Side - Hero Image */}
                <div className="relative hidden md:block md:col-span-2 h-full min-h-[700px] overflow-hidden rounded-l-lg bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/30" />
                  
                  {/* Professional Fitness Logo */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="mb-8">
                      {/* Modern Icon */}
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-primary to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L13.09 8.26L20 8L14.74 10.5L20 13L13.09 15.74L12 22L10.91 15.74L4 13L9.26 10.5L4 8L10.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                      
                      {/* Elite Branding */}
                      <h1 className="text-4xl font-black text-white mb-2 tracking-wider">
                        NUTRI<span className="text-primary">WISE</span>
                      </h1>
                      <h2 className="text-3xl font-bold text-primary mb-4">
                        ELITE AI
                      </h2>
                      <div className="w-16 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
                      <p className="text-lg text-gray-300 font-medium">
                        Performance Analytics
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
                      <div className="text-center">
                        <div className="text-2xl font-black text-primary">50K+</div>
                        <div className="text-sm text-gray-400 uppercase tracking-wide">Athletes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-primary">99.8%</div>
                        <div className="text-sm text-gray-400 uppercase tracking-wide">Accuracy</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Badge */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-semibold">Science-Backed Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Form */}
                <div className="md:col-span-3 p-6 lg:p-8 flex flex-col justify-center bg-card/50 backdrop-blur-sm relative overflow-visible">
                  <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black mb-3">Get Your Elite Analysis</h2>
                    <p className="text-muted-foreground text-base lg:text-lg">
                      Fill out this assessment to receive your personalized supplement protocol
                    </p>
                  </div>
                  <AdvisorForm 
                    onSubmit={handleSubmit} 
                    loading={loading} 
                    savedFormData={!showChangePrompt ? savedFormData : null}
                  />
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
