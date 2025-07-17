
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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


type AdvisorFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  loading: boolean;
};

export default function AdvisorForm({ onSubmit, loading }: AdvisorFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fitnessGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Fitness Goal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main goal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weight-lifting">Muscle & Strength</SelectItem>
                    <SelectItem value="enhanced-recovery">Enhanced Recovery & Reduced Soreness</SelectItem>
                    <SelectItem value="hormone-support">Hormone & Vitality Support</SelectItem>
                    <SelectItem value="cardio">Endurance & Stamina</SelectItem>
                    <SelectItem value="sports-performance">Sports Performance</SelectItem>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="general-health">General Health & Wellness</SelectItem>
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
                <FormLabel>Activity Level</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How often do you train?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Lightly Active (1-2 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately Active (3-4 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (5-6 days/week)</SelectItem>
                    <SelectItem value="athlete">Athlete (6+ days/week)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 25" {...field} />
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
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 155" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="diet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Preference</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your diet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced Diet</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                <FormLabel>Typical Sleep Quality</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How well do you sleep?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (7-9 hours, feel rested)</SelectItem>
                    <SelectItem value="good">Good (6-8 hours, mostly rested)</SelectItem>
                    <SelectItem value="fair">Fair (5-7 hours, sometimes tired)</SelectItem>
                    <SelectItem value="poor">Poor (less than 5 hours, often tired)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="healthConcerns"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Health Concerns (Optional)</FormLabel>
                <FormDescription>Select any that apply to you.</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {healthConcerns.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="healthConcerns"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.label)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.label])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.label
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
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

         <div className="grid md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="race"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race / Ethnicity</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your race" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="black">Black or African American</SelectItem>
                    <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                    <SelectItem value="white">White</SelectItem>
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
                <FormLabel>Monthly Budget (Optional)</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-200">$100 - $200</SelectItem>
                    <SelectItem value="over-200">Over $200</SelectItem>
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
              <FormLabel>Allergies or Other Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., allergic to shellfish, avoid artificial sweeteners, etc."
                  {...field}
                />
              </FormControl>
               <FormDescription>
                This helps us further tailor your recommendations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="text-center pt-4">
            <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-indicator" />
                    Analyzing Your Profile...
                </>
                ) : (
                <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Get My Free Preview
                </>
                )}
            </Button>
        </div>
      </form>
    </Form>
  );
}
