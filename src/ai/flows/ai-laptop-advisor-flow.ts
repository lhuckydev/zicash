'use server';
/**
 * @fileOverview AI Laptop Advisor Flow using Groq AI.
 * Handles the logic of matching user preferences with the laptop inventory.
 */

import { z } from 'genkit';
import { supabase } from '@/lib/supabase';

const AiLaptopAdvisorInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  isInitialSearch: z.boolean().default(false),
});

export type AiLaptopAdvisorInput = z.infer<typeof AiLaptopAdvisorInputSchema>;

export async function aiLaptopAdvisor(input: AiLaptopAdvisorInput) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('AI Hub Sync Failure: Missing credentials.');
  }
  
  // 1. Fetch available laptops from DB for context
  const { data: laptops } = await supabase
    .from('products')
    .select('id, name, price, brand, specs, stock')
    .eq('category', 'Laptops')
    .gt('stock', 0);

  const inventoryContext = laptops?.map(p => 
    `ID: ${p.id} | Name: ${p.name} | Brand: ${p.brand} | Price: GHS ${p.price} | Specs: ${p.specs}`
  ).join('\n') || "No laptops currently in stock.";

  const systemPrompt = `You are the ZiCash AI Laptop Advisor, a premium hardware expert.
Your goal is to help users find the perfect laptop from the ZiCash Marketplace inventory.

INVENTORY CONTEXT:
${inventoryContext}

GUIDELINES:
1. Analyze user needs (budget, use case, specs) and recommend the top matches from the inventory above.
2. IMPORTANT: Do not just list products at the end. Use a sectional approach:
   - Introduce the first recommended laptop with its pros and cons.
   - Immediately follow the description with its ID in this format: [MATCH_ID:id_goes_here].
   - If there is another option to consider (e.g. "If you want better graphics..."), describe it and follow it with its ID: [MATCH_ID:id2].
3. This ensures the user sees the visual product card immediately after reading about it.
4. Be technical and precise. Mention RAM, CPU, and Storage details.
5. If no perfect match exists, suggest the closest alternative or explain why.
6. Keep a professional, high-performance tone. Use the motto "All You Need, All For You" if appropriate.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...input.messages
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) throw new Error('AI Hub Sync Failure');

    const data = await response.json();
    return { 
      content: data.choices[0].message.content,
      role: 'assistant' 
    };
  } catch (error: any) {
    console.error('AI Flow Error:', error);
    throw new Error('Advisor Transmission Error: ' + error.message);
  }
}
