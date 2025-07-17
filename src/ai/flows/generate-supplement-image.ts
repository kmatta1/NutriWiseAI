
'use server';

/**
 * @fileOverview A Genkit flow for generating a supplement product image.
 *
 * - generateSupplementImage - A function that generates an image for a given supplement name.
 */

import { ai } from '@/ai/genkit';
import type { 
    GenerateSupplementImageInput, 
    GenerateSupplementImageOutput 
} from '@/lib/types';
import { 
    GenerateSupplementImageInputSchema,
    GenerateSupplementImageOutputSchema,
} from '@/lib/types';


export async function generateSupplementImage(input: GenerateSupplementImageInput): Promise<GenerateSupplementImageOutput> {
  return generateSupplementImageFlow(input);
}

const generateSupplementImageFlow = ai.defineFlow(
  {
    name: 'generateSupplementImageFlow',
    inputSchema: GenerateSupplementImageInputSchema,
    outputSchema: GenerateSupplementImageOutputSchema,
  },
  async ({ supplementName }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a photorealistic product image of a supplement bottle for "${supplementName}". The bottle should have modern, clean packaging and be displayed on a neutral studio background. The label should be minimalist and clearly feature the supplement name.`,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    const imageUrl = media?.url;
    if (!imageUrl) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl };
  }
);
