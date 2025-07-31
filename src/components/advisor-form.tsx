"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2, Rocket } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { userProfileManager } from "@/lib/user-profile-store";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fitnessGoals: z.string().min(1, "Please select a fitness goal."),
  gender: z.string().min(1, "Please select your gender."),
  race: z.string().optional(),
  age: z.string().min(1, "Age is required.").max(3),
  weight: z.string().min(1, "Weight is required.").max(4),
  activityLevel: z.string().min(1, "Please select your activity level."),
  diet: z.string().min(1, "Please select your diet."),
  sleepQuality: z.string().min(1, "Please select your sleep quality."),
  healthConcerns: z.array(z.string()).optional(),
  budget: z.string().optional(),
  otherCriteria: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AdvisorFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  prefillData?: Partial<FormData>;
}

export default function AdvisorForm({ onSubmit, isLoading = false, prefillData }: AdvisorFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formState, setFormState] = useState('idle');

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get stored form data or use prefill data - only on client side
  const getInitialValues = useCallback((): FormData => {
    // Priority: prefillData > stored form data > defaults
    if (prefillData) {
      return {
        fitnessGoals: prefillData.fitnessGoals || "",
        gender: prefillData.gender || "",
        age: prefillData.age || "",
        weight: prefillData.weight || "",
        activityLevel: prefillData.activityLevel || "",
        diet: prefillData.diet || "",
        sleepQuality: prefillData.sleepQuality || "",
        race: prefillData.race || "",
        budget: prefillData.budget || "",
        otherCriteria: prefillData.otherCriteria || "",
        healthConcerns: prefillData.healthConcerns || [],
      };
    }
    
    // Only access localStorage on the client side
    if (isClient) {
      const storedFormData = userProfileManager.getFormData();
      if (storedFormData) {
        // Ensure all required fields have string values to prevent controlled/uncontrolled issues
        return {
          fitnessGoals: storedFormData.fitnessGoals || "",
          gender: storedFormData.gender || "",
          age: storedFormData.age || "",
          weight: storedFormData.weight || "",
          activityLevel: storedFormData.activityLevel || "",
          diet: storedFormData.diet || "",
          sleepQuality: storedFormData.sleepQuality || "",
          race: storedFormData.race || "",
          budget: storedFormData.budget || "",
          otherCriteria: storedFormData.otherCriteria || "",
          healthConcerns: storedFormData.healthConcerns || [],
        };
      }
    }
    
    return { 
      fitnessGoals: "",
      gender: "",
      age: "",
      weight: "",
      activityLevel: "",
      diet: "",
      sleepQuality: "",
      race: "",
      budget: "",
      otherCriteria: "",
      healthConcerns: [] 
    };
  }, [prefillData, isClient]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessGoals: "",
      gender: "",
      age: "",
      weight: "",
      activityLevel: "",
      diet: "",
      sleepQuality: "",
      race: "",
      budget: "",
      otherCriteria: "",
      healthConcerns: [] 
    },
  });

  // Load client-side data after hydration
  useEffect(() => {
    if (isClient && !hasLoadedProfile) {
      const clientData = getInitialValues();
      const hasData = Object.values(clientData).some(value => 
        Array.isArray(value) ? value.length > 0 : value !== "" && value !== undefined
      );
      
      if (hasData) {
        // Reset form with client-side data
        form.reset(clientData);
        
        toast({
          title: "Profile Loaded! 🎯",
          description: "Your previous information has been pre-filled. Update as needed.",
          duration: 3000,
        });
      }
      
      setHasLoadedProfile(true);
    }
  }, [isClient, getInitialValues, hasLoadedProfile, form, toast]);

  // Handle prefillData changes from parent component
  useEffect(() => {
    if (prefillData && isClient) {
      const hasData = Object.values(prefillData).some(value => 
        Array.isArray(value) ? value.length > 0 : value !== "" && value !== undefined
      );
      
      if (hasData) {
        console.log('🔄 Updating form with prefillData:', prefillData);
        form.reset(prefillData);
      }
    }
  }, [prefillData, isClient, form]);

  // Auto-save form data as user types (debounced) - only on client side
  useEffect(() => {
    if (!isClient) return;
    
    const subscription = form.watch((formData) => {
      // Save form data to localStorage for persistence
      if (Object.keys(formData).some(key => formData[key as keyof typeof formData])) {
        userProfileManager.saveFormData(formData);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, isClient]);

  // Enhanced submit handler with profile saving
  const handleSubmit = async (data: FormData) => {
    setFormState('submitting');
    console.log('🔴 AdvisorForm handleSubmit called with:', data);
    try {
      // Save form data for future use
      userProfileManager.saveFormData(data);
      
      // If user is logged in, update their profile
      if (user && profile) {
        const updatedProfile = {
          ...profile,
          ...data,
          age: parseInt(data.age),
          weight: parseInt(data.weight),
          lastUpdated: new Date().toISOString(),
        };
        
        userProfileManager.saveProfile(updatedProfile);
        
        toast({
          title: "Profile Saved! 💾",
          description: "Your information will be remembered for future analyses.",
          duration: 2000,
        });
      }
      
      // Call the original onSubmit
      console.log('🔥 Calling parent onSubmit function...');
      await onSubmit(data);
      console.log('✅ Parent onSubmit completed successfully');
      setFormState('submitted');
    } catch (error) {
      console.error("❌ Error in AdvisorForm handleSubmit:", error);
      toast({
        title: "Submission Error",
        description: "There was an issue processing your request. Please try again.",
        variant: "destructive",
      });
      setFormState('error');
    }
  };

  // Handle form validation errors
  const handleInvalidSubmit = (errors: any) => {
    console.log('🔴 Form validation failed:', errors);
    toast({
      title: "Form Validation Failed",
      description: "Please check the required fields and try again.",
      variant: "destructive",
    });
  };

  // Clear saved form data
  const clearSavedData = () => {
    if (!isClient) return;
    
    userProfileManager.clearFormData();
    form.reset({ 
      fitnessGoals: "",
      gender: "",
      age: "",
      weight: "",
      activityLevel: "",
      diet: "",
      sleepQuality: "",
      race: "",
      budget: "",
      otherCriteria: "",
      healthConcerns: [] 
    });
    setHasLoadedProfile(false);
    
    toast({
      title: "Form Cleared! 🔄",
      description: "All saved data has been removed. Starting fresh.",
      duration: 2000,
    });
  };

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
        <form onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)} className="space-y-8">
          
          {/* Header with Profile Management */}
          <div className="text-center space-y-4 p-6 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Get Your Personalized Supplement Plan
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Tell us about yourself so we can create the perfect supplement regimen for your needs.
            </p>
            {/* Profile management options */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSavedData}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear Saved Data
              </Button>
            </div>
          </div>
          
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
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Race/Ethnicity <span className="text-slate-500 font-normal">(Optional)</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="Select race/ethnicity" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="asian" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Asian</SelectItem>
                        <SelectItem value="black" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Black or African American</SelectItem>
                        <SelectItem value="hispanic" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Hispanic or Latino</SelectItem>
                        <SelectItem value="white" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">White</SelectItem>
                        <SelectItem value="native_american" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Native American</SelectItem>
                        <SelectItem value="pacific_islander" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Pacific Islander</SelectItem>
                        <SelectItem value="mixed" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Mixed Race</SelectItem>
                        <SelectItem value="other" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-4 text-base">Prefer not to say</SelectItem>
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

                          </div>
          </div>

          {/* Lifestyle Section */}
          <div className="space-y-6 p-8 bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🥗</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Lifestyle & Diet</h3>
                <p className="text-base text-slate-700 font-medium">Your daily habits and preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="diet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Diet Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="Select your diet" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="balanced" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🍽️ Balanced/Omnivore</SelectItem>
                        <SelectItem value="vegetarian" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🥬 Vegetarian</SelectItem>
                        <SelectItem value="vegan" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🌱 Vegan</SelectItem>
                        <SelectItem value="keto" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🥓 Ketogenic</SelectItem>
                        <SelectItem value="paleo" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🍖 Paleo</SelectItem>
                        <SelectItem value="mediterranean" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🐟 Mediterranean</SelectItem>
                        <SelectItem value="low-carb" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">🥩 Low Carb</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Sleep Quality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-slate-900 font-semibold shadow-sm">
                          <SelectValue placeholder="Rate your sleep" className="text-slate-800 font-semibold" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl">
                        <SelectItem value="excellent" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">😴 Excellent (8+ hours, restful)</SelectItem>
                        <SelectItem value="good" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">😊 Good (7-8 hours, mostly restful)</SelectItem>
                        <SelectItem value="fair" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">😐 Fair (6-7 hours, some issues)</SelectItem>
                        <SelectItem value="poor" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">😞 Poor (less than 6 hours)</SelectItem>
                        <SelectItem value="insomnia" className="hover:bg-blue-50 focus:bg-blue-100 text-slate-900 font-semibold py-3">😵 Severe sleep issues</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Health & Wellness Section */}
          <div className="space-y-6 p-8 bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">❤️</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Health & Wellness</h3>
                <p className="text-base text-slate-700 font-medium">Additional health considerations (optional)</p>
              </div>
            </div>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="healthConcerns"
                render={({ field }) => {
                  // Ensure field.value is always an array
                  const selectedConcerns = field.value || [];
                  
                  const handleConcernChange = (concernId: string, isChecked: boolean) => {
                    let updatedConcerns;
                    if (isChecked) {
                      // Add concern if not already present
                      updatedConcerns = selectedConcerns.includes(concernId) 
                        ? selectedConcerns 
                        : [...selectedConcerns, concernId];
                    } else {
                      // Remove concern
                      updatedConcerns = selectedConcerns.filter(id => id !== concernId);
                    }
                    
                    console.log('Updating health concerns:', {
                      concernId,
                      isChecked,
                      before: selectedConcerns,
                      after: updatedConcerns
                    });
                    
                    // Update form field
                    field.onChange(updatedConcerns);
                  };

                  return (
                    <FormItem>
                      <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Health Concerns (Optional)</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: "joint-pain", label: "Joint Pain/Arthritis" },
                            { id: "low-energy", label: "Low Energy/Fatigue" },
                            { id: "stress-anxiety", label: "Stress/Anxiety" },
                            { id: "poor-digestion", label: "Poor Digestion" },
                            { id: "focus-memory", label: "Focus/Memory Issues" },
                            { id: "sleep-issues", label: "Sleep Issues" },
                            { id: "immune-system", label: "Weak Immune System" },
                            { id: "inflammation", label: "Chronic Inflammation" },
                            { id: "heart-health", label: "Heart Health Concerns" },
                            { id: "bone-health", label: "Bone Health/Osteoporosis" },
                            { id: "hormone-balance", label: "Hormonal Imbalances" },
                            { id: "skin-hair", label: "Skin/Hair Issues" }
                          ].map((concern) => {
                            const isChecked = selectedConcerns.includes(concern.id);
                            
                            return (
                              <div key={concern.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={concern.id}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    handleConcernChange(concern.id, checked === true);
                                  }}
                                  className="border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  disabled={isLoading || formState === 'submitting'}
                                />
                                <label 
                                  htmlFor={concern.id} 
                                  className="text-sm font-medium text-slate-700 cursor-pointer select-none"
                                >
                                  {concern.label}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-600 font-medium" />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Monthly Budget (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 100" 
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
                name="otherCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-slate-900 mb-3 block">Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any specific requirements, allergies, or goals you'd like us to consider..."
                        {...field} 
                        className="min-h-[100px] text-base bg-white border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all placeholder:text-slate-500 text-slate-900 font-semibold shadow-sm resize-none"
                      />
                    </FormControl>
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
              disabled={isLoading || formState === 'submitting'}
              onClick={() => {
                console.log('🔵 Submit button clicked');
                console.log('🔵 Form errors:', form.formState.errors);
                console.log('🔵 Form is valid:', form.formState.isValid);
                console.log('🔵 Form values:', form.getValues());
              }}
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
