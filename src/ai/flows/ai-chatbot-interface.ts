
'use server';

/**
 * @fileOverview An AI-driven chatbot interface for supplement recommendations.
 *
 * - aiChatbotInterface - A function that interacts with the chatbot and provides supplement recommendations.
 */

import {ai} from '@/ai/genkit';
import { suggestSupplements } from './supplement-advisor';
import type { 
    SupplementAdvisorInput, 
    SupplementAdvisorOutput, 
    AIChatbotInterfaceInput,
    AIChatbotInterfaceOutput
} from '@/lib/types';
import {
    SupplementAdvisorInputSchema,
    SupplementAdvisorOutputSchema,
    AIChatbotInterfaceInputSchema,
    AIChatbotInterfaceOutputSchema
} from '@/lib/types';


export async function aiChatbotInterface(input: AIChatbotInterfaceInput): Promise<AIChatbotInterfaceOutput> {
  return aiChatbotInterfaceFlow(input);
}


const recommendSupplementsTool = ai.defineTool(
  {
    name: 'recommendSupplements',
    description: 'Generates a new supplement recommendation stack based on user-provided criteria. Use this tool if the user explicitly asks for a new or different recommendation, or provides new personal details like goals, age, weight, etc.',
    inputSchema: SupplementAdvisorInputSchema,
    outputSchema: SupplementAdvisorOutputSchema,
  },
  async (input) => {
    return suggestSupplements(input);
  }
);


const prompt = ai.definePrompt({
  name: 'aiChatbotInterfacePrompt',
  tools: [recommendSupplementsTool],
  input: {schema: AIChatbotInterfaceInputSchema},
  output: {schema: AIChatbotInterfaceOutputSchema.omit({recommendation: true, recommendationInput: true})},
  prompt: `You are a friendly, helpful, and expert AI-driven chatbot specializing in supplement recommendations.
  Your goal is to provide personalized recommendations based on the user's questions and preferences.
  Emulate the look and feel of trending chat interactions.

  Greet the user by name and maintain chat history.

  If the user asks for a new recommendation or provides details to generate one, use the 'recommendSupplements' tool.
  Otherwise, answer their questions based on the provided context.

  Take into account the following user information to provide recommendations:
  - User ID: {{{userId}}}

  {{#if recommendationContext}}
  The user has previously received the following recommendation. Use this as the primary context for answering their questions, unless they ask for a new recommendation.

  RECOMMENDATION CONTEXT:
  ---
  User's Profile for Recommendation:
  - Fitness Goals: {{recommendationContext.input.fitnessGoals}}
  - Age: {{recommendationContext.input.age}}
  - Weight: {{recommendationContext.input.weight}} kg
  - Race: {{recommendationContext.input.race}}
  {{#if recommendationContext.input.otherCriteria}}- Other Criteria: {{recommendationContext.input.otherCriteria}}{{/if}}
  {{#if recommendationContext.input.budget}}- Budget: {{recommendationContext.input.budget}}{{/if}}

  Recommended Stack:
  {{#each recommendationContext.output.suggestions}}
  - {{this.supplementName}}
  {{/each}}

  Daily Schedule:
  {{{recommendationContext.output.dailySchedule}}}

  Additional Notes:
  {{{recommendationContext.output.additionalNotes}}}
  ---
  END OF RECOMMENDATION CONTEXT
  {{/if}}

  {{#if chatHistory}}
  Here is the chat history:
  {{#each chatHistory}}
  {{this.role}}: {{{this.content}}}
  {{/each}}
  {{/if}}

  Now, respond to the following user message:
  User: {{{message}}}
  `,
});

const aiChatbotInterfaceFlow = ai.defineFlow(
  {
    name: 'aiChatbotInterfaceFlow',
    inputSchema: AIChatbotInterfaceInputSchema,
    outputSchema: AIChatbotInterfaceOutputSchema,
  },
  async (input) => {
    // Generate a response using the prompt and the provided input.
    const llmResponse = await ai.generate({
      prompt: (await prompt.render(input)).prompt,
      ...ai.getConfig(),
      enableTools: true,
      // We pass the full output schema here to guide the model, even though the prompt doesn't include all fields.
      output: { schema: AIChatbotInterfaceOutputSchema }
    });

    const toolRequests = llmResponse.toolRequests;

    // If the model requests to use a tool (i.e., generate a new recommendation).
    if (toolRequests.length > 0) {
      const toolRequest = toolRequests[0];
      const toolInput = SupplementAdvisorInputSchema.parse(toolRequest.toolRequest.input);
      const toolResponse = await suggestSupplements(toolInput);
      
      return {
        response: `I've generated a new supplement recommendation for you based on our conversation! I'm updating the main window with the details now.`,
        recommendation: toolResponse,
        recommendationInput: toolInput,
      };
    }
    
    const output = llmResponse.output;

    // If the model does not use a tool, it should return a direct text response.
    if (!output?.response) {
      throw new Error("The AI returned an empty response.");
    }

    // Return the response in the expected format.
    return {
      response: output.response,
    };
  }
);
