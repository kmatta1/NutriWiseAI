"use client";
import React, { useState } from 'react';
import AdvisorForm from '@/components/advisor-form';
import { SupplementStackCard } from '@/components/supplement-stack-card';
import { suggestSupplementsAction } from '@/lib/actions';
import type { SupplementAdvisorInput, SupplementAdvisorOutput } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { userProfileManager } from '@/lib/user-profile-store';

export default function AdvisorTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SupplementAdvisorOutput | null>(null);
  const { toast } = useToast();

  // Test data that fills all required fields
  const testData = {
    fitnessGoals: "build-muscle",
    gender: "male",
    age: "30",
    weight: "180",
    activityLevel: "moderately-active",
    diet: "omnivore",
    sleepQuality: "good",
    race: "caucasian",
    budget: "100",
    otherCriteria: "Test submission",
    healthConcerns: []
  };

  const handleTestSubmit = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      // Transform test data to UserProfile structure
      const input: SupplementAdvisorInput = {
        age: parseInt(testData.age, 10),
        gender: testData.gender,
        fitnessGoals: [testData.fitnessGoals],
        dietaryRestrictions: testData.diet ? [testData.diet] : [],
        currentSupplements: testData.otherCriteria ? (testData.otherCriteria.split(',').map((s: string) => s.trim()).filter(Boolean)) : [],
        healthConcerns: testData.healthConcerns || [],
        budget: testData.budget ? parseInt(testData.budget, 10) : 100,
        experienceLevel: testData.activityLevel,
        lifestyle: `${testData.sleepQuality} sleep, ${testData.activityLevel} activity`,
        activityLevel: testData.activityLevel,
        diet: testData.diet,
        sleepQuality: testData.sleepQuality,
        otherCriteria: testData.otherCriteria,
        race: testData.race,
        weight: testData.weight ? parseInt(testData.weight, 10) : undefined,
      };
      
      console.log('Test input:', input);
      const result = await suggestSupplementsAction(input);
      
      if (result.success) {
        setResults(result);
        toast({
          title: "Test Successful!",
          description: "AI supplement recommendation generated successfully.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.message || "Failed to generate recommendations.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Test error:", error);
      toast({
        variant: "destructive",
        title: "Test Error",
        description: error.message || "Test failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    setResults(null);
    
    try {
      // Save form data for future visits
      userProfileManager.saveFormData(data);
      
      // Transform form data to UserProfile structure
      const input: SupplementAdvisorInput = {
        age: parseInt(data.age, 10),
        gender: data.gender,
        fitnessGoals: Array.isArray(data?.fitnessGoals) ? data.fitnessGoals : (data?.fitnessGoals ? [data.fitnessGoals] : []),
        dietaryRestrictions: data.diet ? [data.diet] : [],
        currentSupplements: data?.otherCriteria ? (data.otherCriteria.split(',').map((s: string) => s.trim()).filter(Boolean)) : [],
        healthConcerns: Array.isArray(data?.healthConcerns) ? data.healthConcerns : (data?.healthConcerns ? [data.healthConcerns] : []),
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
      
      console.log('Form input:', input);
      const result = await suggestSupplementsAction(input);
      
      if (result.success) {
        setResults(result);
        toast({
          title: "Recommendations Generated",
          description: "Your personalized supplement stack has been created.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate recommendations.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "Failed to generate recommendation.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Supplement Advisor Test
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Testing the supplement recommendation system
          </p>
          
          {/* Test Button */}
          <button 
            onClick={handleTestSubmit}
            disabled={loading}
            className="mb-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg mr-4"
          >
            {loading ? "Testing..." : "🧪 Run Test Submission"}
          </button>
        </div>

        {/* Form */}
        <AdvisorForm 
          onSubmit={handleFormSubmit} 
          isLoading={loading}
          prefillData={testData}
        />

        {/* Results */}
        {results && results.success && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">
              Your Personalized Supplement Stack
            </h2>
            <SupplementStackCard 
              stack={results.stack} 
              onPurchase={(stack) => {
                toast({
                  title: "Purchase Flow",
                  description: `Would initiate purchase for: ${stack.name}`,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
