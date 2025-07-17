
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized daily supplement schedule.
 *
 * The flow takes supplement details as input and returns a schedule detailing when and how to take each supplement for optimal results.
 * @module src/ai/flows/personalized-supplement-schedule
 *
 * @function generateSupplementSchedule - The main function to generate a personalized supplement schedule.
 */

import {ai} from '@/ai/genkit';
import type {
    GenerateSupplementScheduleInput,
    GenerateSupplementScheduleOutput
} from '@/lib/types';
import {
    GenerateSupplementScheduleInputSchema,
    GenerateSupplementScheduleOutputSchema
} from '@/lib/types';

export async function generateSupplementSchedule(input: GenerateSupplementScheduleInput): Promise<GenerateSupplementScheduleOutput> {
  return generateSupplementScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSupplementSchedulePrompt',
  input: {schema: GenerateSupplementScheduleInputSchema},
  output: {schema: GenerateSupplementScheduleOutputSchema},
  prompt: `You are a personal supplement advisor that creates personalized daily schedules based on the input.

  Given the following supplements and user lifestyle, generate a clear and easy-to-follow daily schedule detailing when and how to take each supplement for optimal results.  Take into consideration the user's lifestyle and any timing or duration specifications.

  Supplements:
  {{#each supplements}}
  - Name: {{this.name}}, Dosage: {{this.dosage}}, Timing: {{this.timing}}, Duration: {{this.duration}}, Notes: {{this.notes}}
  {{/each}}

  User Lifestyle: {{userLifestyle}}
  \nSchedule:`,
});

const generateSupplementScheduleFlow = ai.defineFlow(
  {
    name: 'generateSupplementScheduleFlow',
    inputSchema: GenerateSupplementScheduleInputSchema,
    outputSchema: GenerateSupplementScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
