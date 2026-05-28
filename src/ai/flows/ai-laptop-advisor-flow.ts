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
      return `- ${v.label}: GH₵ ${finalPrice.toLocaleString()}${onSale ? ' (HOT DEAL / ON SALE)' : ''} [Stock: ${v.stock}] [ID: ${p.id}]`;
    }).join('\n');

    return `PRODUCT: ${p.name} | BRAND: ${p.brand} | CATEGORY: ${p.category}\nCONFIGURATIONS:\n${variantStrings}`;
  }).filter(Boolean).join('\n\n') || "Currently synchronizing inventory. No items found in active stock.";

  const systemPrompt = `You are the ZiCash AI Hardware Advisor, a premium technical consultant for Ghana's high-performance marketplace.

INVENTORY REPOSITORY (Live Stock Only):
${inventoryContext}

EXPERT CONSULTATION PROTOCOLS:
1. DEEP ANALYSIS: Analyze the user's specific use case (Gaming, Productivity, Student, or Creative Pro) against the CPU, RAM, and Storage tiers available.
2. STRATEGIC MAPPING: Identify exactly 2-3 specific configurations that maximize value for the user's budget.
3. DISCOUNT INTEGRATION: Always prioritize "HOT DEALS" or "ON SALE" items if they match the user's requirements. Explain the economic benefit.
4. VISUAL TRIGGER (CRITICAL): Immediately follow your description of a recommended product with its ID in this EXACT format: [MATCH_ID:id_goes_here].
5. RESPONSE STRUCTURE: Use professional, numbered lists (1. 2. 3.) for recommendations. DO NOT use asterisks (*) for bullet points.
6. TONE: Professional, authoritative, and sophisticated. Use the ZiCash signature "All You Need, All For You" as a closing statement if appropriate.
7. TECHNICAL HIGHLIGHTS: Wrap core technical specs (e.g. CPUs like Core i7, RAM amounts like 16GB RAM, Storage sizes) in double asterisks like this: **Core i7**.
8. PRICING: Always use the symbol **GH₵** for prices.

IMPORTANT FORMATTING RULES:
- NO ASTERISKS (*) FOR LISTS. Use numbers only.
- Keep paragraphs short (2-3 sentences).
- Wrap technical specifications in double asterisks (**).
- Do not use markdown headers (#).`;

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
