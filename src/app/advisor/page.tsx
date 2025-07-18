
"use client";

import { useState } from "react";
import Image from "next/image";
import type { SupplementAdvisorOutput, SupplementAdvisorInput } from "@/lib/actions";
import { suggestSupplementsAction } from "@/lib/actions";
import AdvisorForm from "@/components/advisor-form";
import SupplementStackCard from "@/components/supplement-stack-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdvisorPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [results, setResults] = useState<SupplementAdvisorOutput | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setResults(null);
    
    try {
      const weightInKg = Math.round(parseInt(data.weight, 10) * 0.453592);
      const input: SupplementAdvisorInput = {
        ...data,
        age: parseInt(data.age, 10),
        weight: weightInKg,
      };
      const result = await suggestSupplementsAction(input);
      setResults(result);

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

  const LoadingSkeleton = () => (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">
          Crafting Your Perfect Stack...
        </h2>
        <p className="text-muted-foreground mt-2">Our AI is analyzing your profile against millions of data points.</p>
      </div>
      <Card>
        <CardContent className="pt-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-theme(height.14))] py-12 md:py-24 px-4">
        {loading ? (
          <LoadingSkeleton />
        ) : results && results.success ? (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Your Personalized Supplement Stack
              </h2>
              <p className="text-muted-foreground mt-2">
                Based on scientific research and your unique profile
              </p>
            </div>
            <SupplementStackCard 
              stack={results.stack} 
              onPurchase={(_stack: any) => {
                toast({
                  title: "Redirecting to Purchase",
                  description: "Taking you to the recommended products..."
                });
                // Handle purchase logic here
              }}
              isLoading={loading}
            />
          </div>
        ) : results && !results.success ? (
          <div className="w-full max-w-4xl">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-8 text-center">
                <h2 className="text-2xl font-bold text-red-800 mb-4">
                  Unable to Generate Recommendations
                </h2>
                <p className="text-red-700 mb-6">
                  {results.message || "There was an error generating your supplement stack. Please try again."}
                </p>
                <Button 
                  onClick={() => setResults(null)}
                  variant="outline"
                  className="border-red-300 text-red-800 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="text-center mb-12 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold font-headline">
                Your Personal Supplement Advisor
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Your body is unique. Your supplements should be, too. Fill out the form to get a free preview of your personalized supplement plan.
              </p>
            </div>
            <Card className="w-full max-w-5xl overflow-hidden shadow-xl md:grid md:grid-cols-2 border">
              <div className="relative hidden md:block h-full min-h-[550px]">
                <Image
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1920&auto=format&fit=crop"
                  alt="Athlete working out in a gym"
                  fill
                  sizes="50vw"
                  className="object-cover"
                  data-ai-hint="athlete gym"
                  priority
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center bg-card">
                <AdvisorForm onSubmit={handleSubmit} loading={loading} />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
