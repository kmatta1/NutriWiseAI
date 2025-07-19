
"use server";

import { FallbackAI } from "@/lib/fallback-ai";
import type { UserProfile, SupplementStack } from "@/lib/fallback-ai";
import type { AIChatbotInterfaceInput, AIChatbotInterfaceOutput } from "@/lib/types";
import { getFirebaseAuth } from "@/lib/firebase";
import { getOrCreateUserProfile } from "@/lib/profile-utils";

// Initialize the AI service
const aiService = new FallbackAI();

// Define input/output types for the actions
export interface SupplementAdvisorInput extends UserProfile {}
export interface SupplementAdvisorOutput {
  stack: SupplementStack;
  success: boolean;
  message?: string;
}

export async function suggestSupplementsAction(
  input: SupplementAdvisorInput
): Promise<SupplementAdvisorOutput> {
  try {
    // Try to get user profile to check premium status
    let isPremium = false;
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userResult = await getOrCreateUserProfile(currentUser);
        if (userResult.success && userResult.profile) {
          isPremium = userResult.profile.isPremium || false;
        }
      }
    } catch (authError) {
      console.log("No authenticated user, using non-premium experience");
    }

    // DEMO: For demonstration purposes, set to premium to test images
    // In production, this would be based on actual subscription status
    isPremium = true; // Force premium for testing
    console.log(`Demo mode: User ${isPremium ? 'is' : 'is not'} premium - showing ${isPremium ? 'real' : 'generic'} product images`);

    const stack = await aiService.generateEvidenceBasedStack(input, isPremium);
    return {
      stack,
      success: true,
      message: "Supplement stack generated successfully"
    };
  } catch (error) {
    console.error("[Action Error] Failed to get supplement suggestions:", error);
    return {
      stack: {
        id: "error",
        name: "Error",
        supplements: [],
        totalMonthlyCost: 0,
        estimatedCommission: 0,
        evidenceScore: 0,
        userSuccessRate: 0,
        timeline: "N/A",
        synergies: [],
        contraindications: [],
        scientificBacking: {
          studyCount: 0,
          qualityScore: 0,
          citations: []
        }
      },
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

export async function chatbotResponseAction(
  input: AIChatbotInterfaceInput
): Promise<AIChatbotInterfaceOutput> {
  try {
    // Convert chat history to context string
    const contextString = input.chatHistory 
      ? input.chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : undefined;
    
    // Simple chatbot response for now
    const response = await aiService.generateChatResponse(input.message, contextString);
    return {
      response
    };
  } catch (error) {
    console.error("Error in chatbotResponseAction:", error);
    return {
      response: "I apologize, but I'm having trouble processing your request right now. Please try again."
    };
  }
}
