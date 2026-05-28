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
      const discount = v.discount?.[0];
      const finalPrice = discount?.discount_price || v.price;
      const onSale = !!discount;
      return `- ${v.label}: GHS ${finalPrice.toLocaleString()}${onSale ? ' (HOT DEAL / ON SALE)' : ''} [Stock: ${v.stock}] [ID: ${p.id}]`;
    }).join('\n');

    return `PRODUCT: ${p.name} | BRAND: ${p.brand} | CATEGORY: ${p.category}\nCONFIGURATIONS:\n${variantStrings}`;
  }).filter(Boolean).join('\n\n') || "Currently synchronizing inventory. No items found in active stock.";

  const systemPrompt = `You are the ZiCash AI Hardware Advisor, a premium technical consultant for Ghana's high-performance marketplace.

INVENTORY REPOSITORY (Live Stock Only):
${inventoryContext}

EXPERT PROTOCOLS:
1. DEEP SCAN: Always analyze the user's specific needs (gaming, office, student, pro-creator) against the CPU, RAM, and Storage options in the inventory.
2. RECOMMENDATION MAPPING: Identify the top 2-3 matches. Specify which CONFIGURATION (Variant) is best for them and why.
3. DISCOUNT AWARENESS: If an item is "ON SALE" or a "HOT DEAL", prioritize it and explain the savings. Users love value for money.
4. VISUAL HOOK (CRITICAL): Immediately follow your description of a recommended product with its ID in this EXACT format: [MATCH_ID:id_goes_here]. This triggers a visual card in the UI.
5. FALLBACK: If no perfect match exists, explain the closest options or suggest a budget adjustment.
6. TONE: Professional, authoritative, yet helpful. Use the ZiCash motto "All You Need, All For You" to close the conversation if appropriate.

IMPORTANT: Your response is rendered in a chat UI. Keep paragraphs concise. Use bolding and lists for clarity. Do not use markdown headers (#).`;

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
