'use server';
/**
 * @fileOverview A flow that generates a concise summary of a laptop's technical specifications using Groq AI.
 *
 * - getLaptopSpecSummary - A function that handles the generation of the laptop spec summary.
 * - LaptopSpecSummaryInput - The input type for the getLaptopSpecSummary function.
 * - LaptopSpecSummaryOutput - The return type for the getLaptopSpecSummary function.
 */

import { z } from 'genkit';

const LaptopSpecSummaryInputSchema = z.object({
  specs: z.string().describe("The full technical specifications of a laptop, as a string."),
});
export type LaptopSpecSummaryInput = z.infer<typeof LaptopSpecSummaryInputSchema>;

const LaptopSpecSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the laptop's core capabilities."),
});
export type LaptopSpecSummaryOutput = z.infer<typeof LaptopSpecSummaryOutputSchema>;

export async function getLaptopSpecSummary(input: LaptopSpecSummaryInput): Promise<LaptopSpecSummaryOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { summary: "Logic core timed out. Please verify specs manually." };
  }
  
  const systemPrompt = `As a hardware expert, generate a concise, easy-to-understand summary of laptop specs. 
Explain what specific details mean for the user (e.g. faster rendering, better display). 
Return your response as a JSON object with a single "summary" field. The "summary" field MUST be a plain string, not a nested object.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Technical Specifications: ${input.specs}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error('Groq Link Failure');
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Ensure the output matches the schema even if AI returns a complex object in summary
    return {
      summary: typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary)
    };
  } catch (error: any) {
    console.error('Spec Summary Error:', error);
    return { summary: "Logic core timed out. Please verify specs manually." };
  }
}
