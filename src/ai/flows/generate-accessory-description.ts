'use server';
/**
 * @fileOverview A flow that generates professional product descriptions using Groq AI.
 */

import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe("The name of the product."),
  category: z.string().describe("The category of the product."),
  brand: z.string().optional(),
  screen: z.string().optional(),
  speed: z.string().optional(),
  cpu: z.string().optional(),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe("The generated product description."),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { description: "Verified quality item. Contact support for full details." };
  }
  
  let systemPrompt = 'You are a professional product copywriter for ZiCash, a premium online marketplace.';
  systemPrompt += ' Write a high-end description focusing on quality and utility. Use 2 short paragraphs.';

  const userPrompt = `Product: ${input.productName} | Category: ${input.category} | Brand: ${input.brand || 'N/A'}`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error('Description Node Failure');
    const data = await response.json();
    return { description: data.choices[0].message.content.trim() };
  } catch (error) {
    console.error('AI Description Error:', error);
    return { description: "Verified quality item. Contact support for full details." };
  }
}
