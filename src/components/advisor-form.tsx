
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


interface AdvisorFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  savedFormData?: any;
}

export default function AdvisorForm({ onSubmit, loading, savedFormData }: AdvisorFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: savedFormData || {
      fitnessGoals: "",
      gender: "",
      age: "",
      weight: "",
      activityLevel: "",
      diet: "",
      sleepQuality: "",
      healthConcerns: [],
      race: "",
      budget: "",
      otherCriteria: "",
    },
  });

  // Reset form values when savedFormData changes
  useEffect(() => {
    if (savedFormData) {
      form.reset(savedFormData);
    }
  }, [savedFormData, form]);

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Primary Goals Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">🎯 Your Performance Goals</h3>
              <p className="text-sm text-muted-foreground">Tell us what you want to achieve</p>
            </div>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="fitnessGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Primary Fitness Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select your main goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weight-lifting">💪 Muscle & Strength</SelectItem>
                        <SelectItem value="enhanced-recovery">🔄 Enhanced Recovery & Reduced Soreness</SelectItem>
                        <SelectItem value="hormone-support">⚡ Hormone & Vitality Support</SelectItem>
                        <SelectItem value="cardio">🏃 Endurance & Stamina</SelectItem>
                        <SelectItem value="sports-performance">🏆 Sports Performance</SelectItem>
                        <SelectItem value="weight-loss">🔥 Weight Loss</SelectItem>
                        <SelectItem value="general-health">🌟 General Health & Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="How often do you train?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">🛋️ Sedentary (little to no exercise)</SelectItem>
                        <SelectItem value="light">🚶 Lightly Active (1-2 days/week)</SelectItem>
                        <SelectItem value="moderate">🏋️ Moderately Active (3-4 days/week)</SelectItem>
                        <SelectItem value="very-active">💪 Very Active (5-6 days/week)</SelectItem>
                        <SelectItem value="athlete">🏆 Elite Athlete (6+ days/week)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">👤 Personal Details</h3>
              <p className="text-sm text-muted-foreground">Help us personalize your recommendations</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 25" 
                        {...field} 
                        className="h-11 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 155" 
                        {...field} 
                        className="h-11 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Lifestyle Section */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">🍽️ Lifestyle Factors</h3>
              <p className="text-sm text-muted-foreground">Your daily habits affect supplement effectiveness</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="diet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Dietary Preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select your diet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="balanced">🥗 Balanced Diet</SelectItem>
                        <SelectItem value="vegetarian">🥬 Vegetarian</SelectItem>
                        <SelectItem value="vegan">🌱 Vegan</SelectItem>
                        <SelectItem value="keto">🥑 Keto</SelectItem>
                        <SelectItem value="paleo">🥩 Paleo</SelectItem>
                        <SelectItem value="other">🍴 Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Sleep Quality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="How well do you sleep?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">😴 Excellent (7-9 hours, feel rested)</SelectItem>
                        <SelectItem value="good">😊 Good (6-8 hours, mostly rested)</SelectItem>
                        <SelectItem value="fair">😐 Fair (5-7 hours, sometimes tired)</SelectItem>
                        <SelectItem value="poor">😵 Poor (less than 5 hours, often tired)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Health Concerns Section */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">🩺 Health & Wellness</h3>
              <p className="text-sm text-muted-foreground">Areas where you'd like targeted support</p>
            </div>
            
            <FormField
              control={form.control}
              name="healthConcerns"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Health Focus Areas (Optional)</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {healthConcerns.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="healthConcerns"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <FormLabel className="font-medium text-sm cursor-pointer">{item.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Info Section */}
          <div className="space-y-6 pt-6 border-t border-border/30">
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">⚙️ Additional Details</h3>
              <p className="text-sm text-muted-foreground">Final touches for perfect recommendations</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Race / Ethnicity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select your background" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="black">Black or African American</SelectItem>
                        <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                        <SelectItem value="other">Other / Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Monthly Budget (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select your budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-50">💰 Under $50</SelectItem>
                        <SelectItem value="50-100">💵 $50 - $100</SelectItem>
                        <SelectItem value="100-200">💸 $100 - $200</SelectItem>
                        <SelectItem value="over-200">💎 Over $200</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="otherCriteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Allergies or Special Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., allergic to shellfish, avoid artificial sweeteners, preferred brands, etc."
                      {...field}
                      className="min-h-[80px] text-sm resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-8 border-t border-border/30">
            <Button 
              type="submit" 
              disabled={loading} 
              size="lg" 
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" data-testid="loading-indicator" />
                  Analyzing Your Elite Profile...
                </>
              ) : (
                <>
                  <Rocket className="mr-3 h-5 w-5" />
                  Get My Elite Supplement Stack
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
