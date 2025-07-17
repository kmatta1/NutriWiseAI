
'use server';

/**
 * @fileOverview AI-powered supplement advisor flow.
 *
 * This flow takes a user's profile and fitness goals and returns a
 * personalized supplement stack recommendation.
 *
 * - suggestSupplements - A function that suggests supplements based on user criteria and fitness goals.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { 
    SupplementAdvisorInput, 
    SupplementAdvisorOutput,
} from '@/lib/types';
import { 
    SupplementAdvisorInputSchema, 
    SupplementAdvisorOutputSchema,
    SupplementSuggestionSchema,
} from '@/lib/types';
import { generateSupplementImage } from './generate-supplement-image';


export async function suggestSupplements(input: SupplementAdvisorInput): Promise<SupplementAdvisorOutput> {
  return supplementAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supplementAdvisorPrompt',
  input: { schema: SupplementAdvisorInputSchema },
  // The AI should not generate image URLs or ordering links. We do that programmatically.
  output: { schema: SupplementAdvisorOutputSchema },
  prompt: `You are an expert AI-powered supplement advisor. Your goal is to create a personalized supplement plan for the user based on their profile.

  CRITICAL INSTRUCTIONS:
  1.  Analyze the user's complete profile (age, gender, diet, health concerns, etc.).
  2.  Recommend a stack of 3-5 of the most effective supplements for their primary fitness goal.
  3.  For each supplement, provide a fictional but realistic brand name, price, and a brief summary of user reviews and scientific data.
  4.  Ensure the total monthly cost of the recommended stack aligns with the user's specified budget, if provided.
  5.  For each supplement, provide a FAKE but realistic-looking Amazon Standard Identification Number (ASIN), like "B0B1J2K3L4".
  6.  Create a personalized daily dosing schedule for the selected supplements. This should be detailed and easy to follow.
  7.  Provide any additional important notes for the user.
  8.  Do NOT recommend any illegal or dangerous substances.
  9.  Do NOT generate a URL or a link for 'whereToOrder'. This will be handled programmatically.

  USER PROFILE:
  - Primary Fitness Goal: {{{fitnessGoals}}}
  - Gender: {{{gender}}}
  - Age: {{{age}}}
  - Weight: {{{weight}}} kg
  - Activity Level: {{{activityLevel}}}
  - Diet: {{{diet}}}
  - Typical Sleep Quality: {{{sleepQuality}}}
  - Stated Health Concerns: {{#if healthConcerns}}{{#each healthConcerns}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
  {{#if otherCriteria}}- Other Notes (Allergies, etc.): {{{otherCriteria}}}{{/if}}
  - Ethnicity: {{{race}}}
  {{#if budget}}- Monthly Budget: {{{budget}}}{{/if}}
  `,
   config: {
    temperature: 0.2,
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ]
  },
});


const supplementAdvisorFlow = ai.defineFlow(
  {
    name: 'supplementAdvisorFlow',
    inputSchema: SupplementAdvisorInputSchema,
    outputSchema: SupplementAdvisorOutputSchema,
  },
  async (input) => {
    const sanitizedInput = {
      ...input,
      budget: input.budget || undefined,
      otherCriteria: input.otherCriteria || undefined,
    };
    
    const { output: llmOutput } = await prompt(sanitizedInput);

    if (!llmOutput || !llmOutput.suggestions) {
      throw new Error('Failed to get supplement suggestions from AI. The model may be overloaded, please try again.');
    }

    const affiliateTag = 'nutriwiseai-20';

    // Concurrently generate images for all suggestions
    const imageGenerationPromises = llmOutput.suggestions.map((suggestion) =>
      generateSupplementImage({ supplementName: suggestion.supplementName })
        .then(result => ({ status: 'fulfilled', value: result.imageUrl, supplementName: suggestion.supplementName }))
        .catch(error => ({ status: 'rejected', reason: error, supplementName: suggestion.supplementName }))
    );
        
    const imageResults = await Promise.all(imageGenerationPromises);

    const imageUrlMap = new Map<string, string>();
    imageResults.forEach(result => {
        if (result.status === 'fulfilled') {
            imageUrlMap.set(result.supplementName, result.value);
        } else {
            console.error(`Image generation failed for ${result.supplementName}:`, result.reason);
            // Use a placeholder on failure
            imageUrlMap.set(result.supplementName, `https://placehold.co/150x150.png`);
        }
    });

    const suggestionsWithDetails = llmOutput.suggestions.map((suggestion) => {
      const searchTerm = encodeURIComponent(`${suggestion.brand} ${suggestion.supplementName}`);
      const whereToOrder = `https://www.amazon.com/s?k=${searchTerm}&tag=${affiliateTag}`;
      
      return {
        ...suggestion,
        whereToOrder,
        imageUrl: imageUrlMap.get(suggestion.supplementName) || `https://placehold.co/150x150.png`,
      };
    });
    
    return {
      ...llmOutput,
      suggestions: suggestionsWithDetails,
    };
  }
);
