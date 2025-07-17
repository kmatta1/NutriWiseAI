
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    vertexAI({
      // The region to run the models in.
      // See https://cloud.google.com/vertex-ai/docs/generative-ai/locations
      location: 'us-central1',
    }),
  ],
  // The model to use for the AI flow.
  model: 'vertexai/gemini-1.5-flash-001',
  // Stop the model from generating text if it starts talking about a different subject.
  stop: [
    'Okay, that’s all I have for you. Is there anything else I can help with?',
  ],
  // The maximum number of tokens to generate.
  maxOutputTokens: 1500,
  // The temperature to use for the model.
  temperature: 1,
});
