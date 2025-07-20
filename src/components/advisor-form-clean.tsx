"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Rocket } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const healthConcerns = [
  { id: "joint-pain", label: "Joint Pain" },
  { id: "low-energy", label: "Low Energy / Fatigue" },
  { id: "stress-anxiety", label: "Stress / Anxiety" },
  { id: "poor-digestion", label: "Poor Digestion" },
  { id: "focus-memory", label: "Focus / Memory" },
  { id: "libido-sexual-health", label: "Libido / Sexual Health" },
] as const;

const formSchema = z.object({
  fitnessGoals: z.string().min(1, "Please select a fitness goal."),
  gender: z.string().min(1, "Please select your gender."),
  age: z.string().min(1, "Age is required.").max(3),
  weight: z.string().min(1, "Weight is required.").max(4),
  activityLevel: z.string().min(1, "Please select your activity level."),
  diet: z.string().min(1, "Please select your diet."),
  sleepQuality: z.string().min(1, "Please select your sleep quality."),
  healthConcerns: z.array(z.string()).optional(),
  race: z.string().min(1, "Please select your race/ethnicity."),
  budget: z.string().optional(),
  otherCriteria: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AdvisorFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export default function AdvisorForm({ onSubmit, isLoading = false }: AdvisorFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthConcerns: [],
    },
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Goals Section */}
          <div className="space-y-6 p-8 bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Your Performance Goals</h3>
                <p className="text-base text-slate-700 font-medium">Tell us what you want to achieve</p>
              </div>
            </div>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="fitnessGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Primary Fitness Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="Select your main goal" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="weight-lifting" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">💪 Muscle & Strength</SelectItem>
                        <SelectItem value="enhanced-recovery" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🔄 Enhanced Recovery & Reduced Soreness</SelectItem>
                        <SelectItem value="hormone-support" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">⚡ Hormone & Vitality Support</SelectItem>
                        <SelectItem value="cardio" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🏃 Endurance & Stamina</SelectItem>
                        <SelectItem value="sports-performance" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🏆 Sports Performance</SelectItem>
                        <SelectItem value="weight-loss" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🔥 Weight Loss</SelectItem>
                        <SelectItem value="general-health" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🌟 General Health & Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="How often do you train?" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="sedentary" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🛋️ Sedentary (little to no exercise)</SelectItem>
                        <SelectItem value="light" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🚶 Lightly Active (1-2 days/week)</SelectItem>
                        <SelectItem value="moderate" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🏋️ Moderately Active (3-4 days/week)</SelectItem>
                        <SelectItem value="very-active" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">💪 Very Active (5-6 days/week)</SelectItem>
                        <SelectItem value="athlete" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">🏆 Elite Athlete (6+ days/week)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="space-y-6 p-8 bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Personal Information</h3>
                <p className="text-base text-slate-700 font-medium">Help us personalize your recommendations</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="Select gender" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="male" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">👨 Male</SelectItem>
                        <SelectItem value="female" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">👩 Female</SelectItem>
                        <SelectItem value="other" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">⚧ Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 25" 
                        {...field} 
                        className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder:text-slate-500 text-slate-900 font-semibold shadow-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 155" 
                        {...field} 
                        className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder:text-slate-500 text-slate-900 font-semibold shadow-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Race/Ethnicity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="Select ethnicity" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="white" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Caucasian/White</SelectItem>
                        <SelectItem value="black" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Black/African American</SelectItem>
                        <SelectItem value="hispanic" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Hispanic/Latino</SelectItem>
                        <SelectItem value="asian" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Asian</SelectItem>
                        <SelectItem value="native" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Native American</SelectItem>
                        <SelectItem value="pacific" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Pacific Islander</SelectItem>
                        <SelectItem value="mixed" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Mixed Race</SelectItem>
                        <SelectItem value="other" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 px-16 rounded-2xl text-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                  Analyzing Your Profile...
                </>
              ) : (
                <>
                  <Rocket className="mr-4 h-6 w-6" />
                  Get My Elite AI Analysis
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
