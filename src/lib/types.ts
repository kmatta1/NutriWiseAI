
import { z } from 'zod';

// Base User Profile
export type UserProfile = {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: string; // Should be ISO string
    isAdmin: boolean;
    isPremium: boolean;
    subscription?: {
      plan: 'monthly' | 'yearly';
      status: 'active' | 'inactive';
      startDate: any; // Can be Date, ISO string, or Firebase Timestamp
      endDate: any; // Can be Date, ISO string, or Firebase Timestamp
      price: string;
    };
};

// Extended User Profile for AI Recommendations
export interface ExtendedUserProfile extends UserProfile {
  age: number;
  gender: string;
  race?: string;
  weight: number;
  activityLevel: string;
  diet: string;
  sleepQuality: string;
  healthConcerns: string[];
  currentSupplements?: string[];
  otherCriteria?: string;
  fitnessGoals: string[];
  budget: number;
  lifestyle?: string;
  experienceLevel?: string;
}

// Supplement Stack Types
export interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  reasoning: string;
  price: number;
  affiliateUrl: string;
  imageUrl?: string;
}

export interface SupplementStack {
  id: string;
  name: string;
  supplements: Supplement[];
  totalMonthlyCost: number;
  estimatedCommission: number;
  evidenceScore: number;
  userSuccessRate: number;
  timeline: string;
  synergies: string[];
  contraindications: string[];
  scientificBacking: {
    studyCount: number;
    qualityScore: number;
    citations: string[];
  };
  persuasiveDescription?: string;
  enhancedAt?: string;
}

// AI Flow related types below...

// Types for: src/ai/flows/supplement-advisor.ts
export const SupplementAdvisorInputSchema = z.object({
  fitnessGoals: z
    .string()
    .describe('The user’s primary fitness goals, e.g., weight lifting, cardio, weight loss.'),
  gender: z.string().describe("The user's gender."),
  age: z.number().describe('The user’s age.'),
  weight: z.number().describe('The user’s weight in kilograms.'),
  activityLevel: z.string().describe("The user's weekly activity level."),
  diet: z.string().describe("The user's dietary preference (e.g., Balanced, Vegan, Keto)."),
  sleepQuality: z.string().describe("The user's self-reported sleep quality."),
  healthConcerns: z.array(z.string()).optional().describe("A list of specific health concerns the user has."),
  otherCriteria: z.string().optional().describe('Any other relevant criteria from the user, like allergies.'),
  budget: z.string().optional().describe('The user specified budget for supplements.'),
  race: z.string().describe('The user’s race or ethnicity.'),
});
export type SupplementAdvisorInput = z.infer<typeof SupplementAdvisorInputSchema>;

export const SupplementSuggestionSchema = z.object({
  supplementName: z.string().describe('The name of the supplement.'),
  brand: z.string().describe('The brand of the supplement.'),
  price: z.string().describe('The price of the supplement.'),
  whereToOrder: z.string().describe('Where to order the supplement from.'),
  userReviewsSummary: z.string().describe('A summary of user reviews for the supplement.'),
  scientificDataSummary: z
    .string()
    .describe('A summary of scientific data supporting the supplement.'),
  imageUrl: z.string().optional().describe('A dynamically generated image URL for the supplement.'),
  asin: z.string().optional().describe('A fake but realistic-looking Amazon Standard Identification Number (ASIN).'),
  // Enhanced Amazon integration fields
  name: z.string().optional().describe('The supplement name (for backward compatibility)'),
  dosage: z.string().optional().describe('The recommended dosage'),
  timing: z.string().optional().describe('When to take the supplement'),
  description: z.string().optional().describe('Detailed description of the supplement'),
  amazonProduct: z.object({
    asin: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    primeEligible: z.boolean(),
    qualityScore: z.number(),
    alternatives: z.object({
      bestValue: z.any().optional(),
      premium: z.any().optional(),
      budget: z.any().optional(),
    }).optional(),
    qualityFactors: z.object({
      thirdPartyTested: z.boolean(),
      gmpCertified: z.boolean(),
      organicCertified: z.boolean(),
      allergenFree: z.boolean(),
      bioavailableForm: z.boolean(),
    }).optional(),
  }).optional(),
  alternatives: z.object({
    bestValue: z.any().optional(),
    premium: z.any().optional(),
    budget: z.any().optional(),
  }).optional(),
});
export type SupplementSuggestion = z.infer<typeof SupplementSuggestionSchema>;

export const SupplementAdvisorOutputSchema = z.object({
  suggestions: z.array(SupplementSuggestionSchema).describe('A list of supplement suggestions.'),
  dailySchedule: z.string().describe('A daily schedule of when to take the supplements.'),
  additionalNotes: z
    .string()
    .optional()
    .describe('Any additional notes or considerations for the user.'),
});
export type SupplementAdvisorOutput = z.infer<typeof SupplementAdvisorOutputSchema>;


// Types for: src/ai/flows/ai-chatbot-interface.ts
export const AIChatbotInterfaceInputSchema = z.object({
  userId: z.string().describe('The unique identifier of the user.'),
  message: z.string().describe('The user message to the chatbot.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the chatbot.'),
  recommendationContext: z.object({
    input: SupplementAdvisorInputSchema,
    output: SupplementAdvisorOutputSchema
  }).optional().describe('The context of a previously generated supplement recommendation.'),
});
export type AIChatbotInterfaceInput = z.infer<typeof AIChatbotInterfaceInputSchema>;

export const AIChatbotInterfaceOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
  recommendation: SupplementAdvisorOutputSchema.optional().describe('A new supplement recommendation, if one was generated.'),
  recommendationInput: SupplementAdvisorInputSchema.optional().describe('The input that generated the new recommendation.'),
});
export type AIChatbotInterfaceOutput = z.infer<typeof AIChatbotInterfaceOutputSchema>;


// Types for: src/ai/flows/generate-supplement-image.ts
export const GenerateSupplementImageInputSchema = z.object({
  supplementName: z.string().describe('The name of the supplement.'),
});
export type GenerateSupplementImageInput = z.infer<typeof GenerateSupplementImageInputSchema>;

export const GenerateSupplementImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated supplement image. Format: 'data:image/png;base64,<encoded_data>'"),
});
export type GenerateSupplementImageOutput = z.infer<typeof GenerateSupplementImageOutputSchema>;


// Types for: src/ai/flows/personalized-supplement-schedule.ts
export const GenerateSupplementScheduleInputSchema = z.object({
  supplements: z.array(
    z.object({
      name: z.string().describe('The name of the supplement.'),
      dosage: z.string().describe('The dosage of the supplement (e.g., 500mg).'),
      timing: z.string().describe('The ideal timing for taking the supplement (e.g., with breakfast, before workout).'),
      duration: z.string().describe('The duration for taking the supplement (e.g., 4 weeks, 3 months).'),
      notes: z.string().optional().describe('Any additional notes or instructions for the supplement.'),
    })
  ).describe('An array of supplement objects, each containing name, dosage, timing, duration, and optional notes.'),
  userLifestyle: z.string().describe('Description of the user lifestyle'),
});
export type GenerateSupplementScheduleInput = z.infer<typeof GenerateSupplementScheduleInputSchema>;

export const GenerateSupplementScheduleOutputSchema = z.object({
  schedule: z.string().describe('A personalized daily schedule detailing when and how to take each supplement, considering optimal timing and duration.'),
});
export type GenerateSupplementScheduleOutput = z.infer<typeof GenerateSupplementScheduleOutputSchema>;
