'use server';
/**
 * @fileOverview An AI flow that recommends compatible accessories using Groq AI.
 *
 * - accessoryCompatibilityRecommendation - A function that handles the recommendation process.
 * - AccessoryCompatibilityRecommendationInput - The input type.
 * - AccessoryCompatibilityRecommendationOutput - The return type.
 */

import { z } from 'genkit';

const AccessoryCompatibilityRecommendationInputSchema = z.object({
  laptopSpecs: z.string().describe('Detailed specifications of the laptop.'),
});
export type AccessoryCompatibilityRecommendationInput = z.infer<typeof AccessoryCompatibilityRecommendationInputSchema>;

const RecommendedAccessorySchema = z.object({
  name: z.string().describe('Accessory name.'),
  compatibilityExplanation: z.string().describe('Why it is compatible.'),
});

const AccessoryCompatibilityRecommendationOutputSchema = z.object({
  accessories: z.array(RecommendedAccessorySchema).describe('List of recommendations.'),
});
export type AccessoryCompatibilityRecommendationOutput = z.infer<typeof AccessoryCompatibilityRecommendationOutputSchema>;

export async function accessoryCompatibilityRecommendation(input: AccessoryCompatibilityRecommendationInput): Promise<AccessoryCompatibilityRecommendationOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('Groq API Key is missing from environment variables.');
    return { accessories: [] };
  }

  const systemPrompt = `You are an expert hardware consultant. Recommend 2-3 compatible accessories for a laptop with the provided specs. 
Return your response as a JSON object in this format: { "accessories": [{ "name": "...", "compatibilityExplanation": "..." }] }`;

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
          { role: 'user', content: `Laptop Specs: ${input.laptopSpecs}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error('Compatibility Engine Failure');
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error: any) {
    console.error('Recommendation Error:', error);
    return { accessories: [] };
  }
}
