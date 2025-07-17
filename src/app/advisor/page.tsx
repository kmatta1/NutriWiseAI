
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { SupplementAdvisorOutput, SupplementAdvisorInput } from "@/lib/types";
import { suggestSupplementsAction } from "@/lib/actions";
import AdvisorForm from "@/components/advisor-form";
import AdvisorResults from "@/components/advisor-results";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent } from "@/components/ui/card";

export default function AdvisorPage() {
  const [loading, setLoading] = useState(false);
  const { recommendationContext, setRecommendationContext } = useAppContext();
  const { toast } = useToast();

  const [results, setResults] = useState<SupplementAdvisorOutput | null>(null);

  useEffect(() => {
    if (recommendationContext) {
      setResults(recommendationContext.output);
    } else {
      setResults(null);
    }
  }, [recommendationContext]);


  const handleSubmit = async (data: any) => {
    setLoading(true);
    setResults(null);
    setRecommendationContext(null); 
    try {
      const weightInKg = Math.round(parseInt(data.weight, 10) * 0.453592);
      const input: SupplementAdvisorInput = {
        ...data,
        age: parseInt(data.age, 10),
        weight: weightInKg,
      };
      const result = await suggestSupplementsAction(input);
      setResults(result);
      setRecommendationContext({ input, output: result });

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
        ) : results ? (
          <div className="w-full max-w-4xl">
            <AdvisorResults results={results} />
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
