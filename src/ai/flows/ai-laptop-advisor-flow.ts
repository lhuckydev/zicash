'use server';
/**
 * @fileOverview AI Laptop Advisor Flow using Groq AI.
 * Handles the logic of matching user preferences with the deep hardware inventory.
 * Now scans through all variants and specific technical specs.
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
  
  // 1. Fetch available products with their deep configurations (variants) and discounts
  // We fetch Laptops, Phones, and Accessories to be safe, though the focus is hardware advice.
  const { data: inventory } = await supabase
    .from('products')
    .select(`
      id, 
      name, 
      brand, 
      category, 
      description,
      variants:product_variants(
        id, 
        label, 
        price, 
        stock, 
        cpu, 
        ram, 
        storage, 
        gpu, 
        condition,
        discount:discounts(discount_price, ends_at)
      )
    `)
    .gt('price', 0);

  // 2. Format the inventory context for the LLM
  const inventoryContext = inventory?.map(p => {
    const availableVariants = p.variants?.filter((v: any) => v.stock > 0) || [];
    if (availableVariants.length === 0) return null;

    const variantStrings = availableVariants.map((v: any) => {
      const price = v.discount?.[0]?.discount_price || v.price;
      const onSale = !!v.discount?.[0];
      return `- ${v.label}: GHS ${price.toLocaleString()}${onSale ? ' (ON SALE)' : ''} [Stock: ${v.stock}]`;
    }).join('\n');

    return `PRODUCT: ${p.name} | BRAND: ${p.brand} | CATEGORY: ${p.category}\nCONFIGURATIONS:\n${variantStrings}`;
  }).filter(Boolean).join('\n\n') || "Currently synchronizing inventory. No items found in active stock.";

  const systemPrompt = `You are the ZiCash AI Hardware Advisor, a premium technical consultant for Ghana's high-performance marketplace.

INVENTORY REPOSITORY (Live Stock Only):
${inventoryContext}

EXPERT PROTOCOLS:
1. DEEP SCAN: Always analyze the user's specific needs (gaming, office, student, pro-creator) against the CPU, RAM, and Storage options in the inventory.
2. RECOMMENDATION MAPPING: Identify the top 2-3 matches. Do not just suggest the product name; specify which CONFIGURATION (Variant) is best for them and why.
3. PRICING ACCURACY: Use the exact prices provided in the context. If an item is "ON SALE", mention the value.
4. VISUAL HOOK: Immediately follow your description of a recommended product with its ID in this format: [MATCH_ID:id_goes_here].
5. FALLBACK: If no perfect match exists for their budget, explain what the closest possible options are or suggest how much more they might need to spend for their requirement.
6. TONE: Professional, authoritative, yet helpful. Use the ZiCash motto "All You Need, All For You" to close the conversation if appropriate.

IMPORTANT: Your response is rendered in a chat UI. Keep paragraphs concise. Do not use markdown headers (#), use bolding and lists for clarity.`;

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
        temperature: 0.6,
        max_tokens: 1200,
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
