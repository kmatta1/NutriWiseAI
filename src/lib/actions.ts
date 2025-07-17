
"use server";

import {
  suggestSupplements as suggestSupplementsFlow,
} from "@/ai/flows/supplement-advisor";
import type { SupplementAdvisorInput, SupplementAdvisorOutput } from "@/lib/types";


import {
  aiChatbotInterface as aiChatbotInterfaceFlow,
} from "@/ai/flows/ai-chatbot-interface";
import type { AIChatbotInterfaceInput, AIChatbotInterfaceOutput } from "@/lib/types";


export async function suggestSupplementsAction(
  input: SupplementAdvisorInput
): Promise<SupplementAdvisorOutput> {
  try {
    const result = await suggestSupplementsFlow(input);
    return result;
  } catch (error) {
    console.error("[Action Error] Failed to get supplement suggestions:", error);
    if (error instanceof Error) {
        // Reject with a clear error message for the client-side to catch
        return Promise.reject(new Error(error.message));
    }
    return Promise.reject(new Error("An unknown error occurred while generating suggestions."));
  }
}

export async function chatbotResponseAction(
  input: AIChatbotInterfaceInput
): Promise<AIChatbotInterfaceOutput> {
  try {
    const result = await aiChatbotInterfaceFlow(input);
    return result;
  } catch (error) {
    console.error("Error in chatbotResponseAction:", error);
    if (error instanceof Error) {
        return Promise.reject(new Error(error.message));
    }
    throw new Error("Failed to get chatbot response. Please try again.");
  }
}
