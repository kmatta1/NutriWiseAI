
"use server";

import { FallbackAI } from "@/lib/fallback-ai";
import type { UserProfile, SupplementStack } from "@/lib/fallback-ai";

// Initialize the AI service
const aiService = new FallbackAI();

// Define input/output types for the actions
export interface SupplementAdvisorInput extends UserProfile {}
export interface SupplementAdvisorOutput {
  stack: SupplementStack;
  success: boolean;
  message?: string;
}

export interface AIChatbotInterfaceInput {
  message: string;
  context?: string;
}

export interface AIChatbotInterfaceOutput {
  response: string;
  success: boolean;
}


export async function suggestSupplementsAction(
  input: SupplementAdvisorInput
): Promise<SupplementAdvisorOutput> {
  try {
    const stack = await aiService.generateEvidenceBasedStack(input);
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
    // Simple chatbot response for now
    const response = await aiService.generateChatResponse(input.message, input.context);
    return {
      response,
      success: true
    };
  } catch (error) {
    console.error("Error in chatbotResponseAction:", error);
    return {
      response: "I apologize, but I'm having trouble processing your request right now. Please try again.",
      success: false
    };
  }
}
