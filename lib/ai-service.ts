/**
 * AI Service — Feature-level AI functions.
 *
 * All provider calls go through the centralized client in lib/ai-client.ts,
 * which proxies to the edge function (supabase/functions/ai-engine). The
 * edge function reads AI_API_KEY / AI_MODEL / AI_API_BASE_URL from secrets
 * and forwards to any OpenAI-compatible endpoint (Groq by default).
 *
 * Swap providers by changing those three secrets — no changes here.
 */

import { aiChatCompletion } from '@/lib/ai-client';
import type { WasteListing, WasteCategory } from '@/lib/types';

export interface MatchResult {
  listing_id: string;
  receiver_name: string;
  receiver_id: string;
  confidence: 'high' | 'medium' | 'low';
  confidence_score: number;
  recommended_price_per_kg: number;
  match_reason: string;
  co2_saved_kg: number;
  landfill_diverted_kg: number;
}

const SYSTEM_PROMPT =
  'You are NexLoop AI, an assistant for an industrial symbiosis platform. ' +
  'You help match industrial surplus waste with industries that can reuse it as raw material, ' +
  'recommend fair prices, predict CO2/landfill impact, compute circularity scores, and generate ESG reports. ' +
  'Be concise, factual, and practical. Use metric units. When asked for structured data, return valid JSON only.';

/** Parse a JSON object from an LLM response that may contain prose around it. */
function extractJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('AI did not return valid JSON');
  return JSON.parse(match[0]) as T;
}

/** Fallback match data when the AI provider is unavailable. */
function fallbackMatches(listing: WasteListing): MatchResult[] {
  const compatibility: Record<WasteCategory, string[]> = {
    scrap_metal: ['Foundry & Casting', 'Steel Re-rolling', 'Metal Recycling'],
    plastic: ['Plastic Extrusion', 'rPET Fiber Production', 'Pipe Manufacturing'],
    textile: ['Insulation Manufacturing', 'Acoustic Panels', 'Recycled Yarn'],
    e_waste: ['Battery Refurbishment', 'Precious Metal Recovery', 'E-Recycling'],
    food_agro: ['Biogas Plants', 'Composting Facilities', 'Biofuel Pellet Production'],
  };
  const basePrices: Record<WasteCategory, number> = {
    scrap_metal: 30, plastic: 35, textile: 15, e_waste: 60, food_agro: 7,
  };
  return (compatibility[listing.category] || []).map((receiver, i) => {
    const score = 0.95 - i * 0.08;
    const adj = listing.quality_grade === 'A' ? 1.15 : listing.quality_grade === 'B' ? 1.0 : 0.75;
    return {
      listing_id: listing.id,
      receiver_name: receiver,
      receiver_id: '',
      confidence: score > 0.85 ? 'high' : score > 0.7 ? 'medium' : 'low',
      confidence_score: score,
      recommended_price_per_kg: Math.round(basePrices[listing.category] * adj * 100) / 100,
      match_reason: `${receiver} can process ${listing.material_subtype} as feedstock, replacing virgin material input.`,
      co2_saved_kg: Math.round(listing.quantity_kg * 1.8 * score),
      landfill_diverted_kg: Math.round(listing.quantity_kg * score),
    };
  });
}

/**
 * AI Waste-to-Resource Matching Engine.
 * Sends the listing to the LLM and asks for ranked receiver candidates as JSON.
 */
export async function aiMatchListing(listing: WasteListing): Promise<MatchResult[]> {
  const prompt = `Given this industrial waste listing, suggest 3 industries that could reuse it as raw material.

Listing:
- Title: ${listing.title}
- Category: ${listing.category}
- Material subtype: ${listing.material_subtype}
- Quantity: ${listing.quantity_kg} kg
- Quality grade: ${listing.quality_grade}
- City: ${listing.city || 'unknown'}

Return ONLY a JSON array (no prose) of up to 3 objects with this shape:
{"receiver_name": string, "confidence_score": number 0-1, "recommended_price_per_kg": number, "match_reason": string, "co2_saved_kg": number, "landfill_diverted_kg": number}`;

  try {
    const content = await aiChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 900 },
    );
    const parsed = extractJSON<Omit<MatchResult, 'listing_id' | 'receiver_id' | 'confidence'>[]>(content);
    return parsed.map((m) => ({
      ...m,
      listing_id: listing.id,
      receiver_id: '',
      confidence: m.confidence_score > 0.85 ? 'high' : m.confidence_score > 0.7 ? 'medium' : 'low',
    }));
  } catch (e) {
    console.error('aiMatchListing failed, using fallback:', e);
    return fallbackMatches(listing);
  }
}

/**
 * AI Price Recommendation.
 */
export async function aiRecommendPrice(
  category: WasteCategory,
  qualityGrade: string,
  quantityKg: number,
): Promise<number> {
  const prompt = `Suggest a fair market price per kg (in INR) for this industrial waste:
- Category: ${category}
- Quality grade: ${qualityGrade}
- Quantity: ${quantityKg} kg
Return ONLY a JSON object: {"price_per_kg": number}`;

  try {
    const content = await aiChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 64 },
    );
    const parsed = extractJSON<{ price_per_kg: number }>(content);
    return Math.round(parsed.price_per_kg * 100) / 100;
  } catch (e) {
    console.error('aiRecommendPrice failed, using fallback:', e);
    const basePrices: Record<WasteCategory, number> = {
      scrap_metal: 28, plastic: 35, textile: 15, e_waste: 55, food_agro: 6,
    };
    const mult = qualityGrade === 'A' ? 1.2 : qualityGrade === 'B' ? 1.0 : 0.7;
    const bulk = quantityKg > 10000 ? 0.92 : quantityKg > 5000 ? 0.96 : 1.0;
    return Math.round(basePrices[category] * mult * bulk * 100) / 100;
  }
}

/**
 * AI CO2 & Landfill Impact Prediction.
 */
export async function aiPredictImpact(
  category: WasteCategory,
  quantityKg: number,
): Promise<{ co2SavedKg: number; landfillDivertedKg: number; treesEquivalent: number }> {
  const prompt = `Estimate the environmental impact of diverting ${quantityKg} kg of ${category} from landfill.
Return ONLY a JSON object: {"co2_saved_kg": number, "landfill_diverted_kg": number, "trees_equivalent": number}`;

  try {
    const content = await aiChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 128 },
    );
    const parsed = extractJSON<{ co2_saved_kg: number; landfill_diverted_kg: number; trees_equivalent: number }>(content);
    return {
      co2SavedKg: Math.round(parsed.co2_saved_kg),
      landfillDivertedKg: Math.round(parsed.landfill_diverted_kg),
      treesEquivalent: Math.round(parsed.trees_equivalent),
    };
  } catch (e) {
    console.error('aiPredictImpact failed, using fallback:', e);
    const co2Factors: Record<WasteCategory, number> = {
      scrap_metal: 1.8, plastic: 2.1, textile: 0.9, e_waste: 0.7, food_agro: 0.3,
    };
    const co2SavedKg = Math.round(quantityKg * co2Factors[category]);
    return {
      co2SavedKg,
      landfillDivertedKg: Math.round(quantityKg * 0.92),
      treesEquivalent: Math.round(co2SavedKg / 21),
    };
  }
}

/**
 * AI Circularity Score (0-100).
 */
export async function aiCircularityScore(metrics: {
  totalDivertedKg: number;
  totalCo2SavedKg: number;
  totalMatches: number;
  activeListings: number;
}): Promise<number> {
  const prompt = `Compute a Circularity Score (0-100) for an organization with these metrics:
- Waste diverted: ${metrics.totalDivertedKg} kg
- CO2 saved: ${metrics.totalCo2SavedKg} kg
- Total matches: ${metrics.totalMatches}
- Active listings: ${metrics.activeListings}
Return ONLY a JSON object: {"circularity_score": number}`;

  try {
    const content = await aiChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 64 },
    );
    const parsed = extractJSON<{ circularity_score: number }>(content);
    return Math.max(0, Math.min(100, Math.round(parsed.circularity_score)));
  } catch (e) {
    console.error('aiCircularityScore failed, using fallback:', e);
    const diversionScore = Math.min(40, metrics.totalDivertedKg / 5000);
    const co2Score = Math.min(25, metrics.totalCo2SavedKg / 2000);
    const matchScore = Math.min(20, metrics.totalMatches * 0.6);
    const listingScore = Math.min(15, metrics.activeListings * 1.5);
    return Math.round(diversionScore + co2Score + matchScore + listingScore);
  }
}

/**
 * AI Chatbot Assistant.
 */
export async function aiChat(userMessage: string, context?: string): Promise<string> {
  const contextLine = context ? `\nUser context: organization is "${context}".` : '';
  const prompt = `${userMessage}${contextLine}`;

  try {
    return await aiChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5, maxTokens: 600 },
    );
  } catch (e) {
    console.error('aiChat failed, using fallback:', e);
    const lower = userMessage.toLowerCase();
    if (lower.includes('match') || lower.includes('find')) {
      return "I can analyze your waste listings and find industries that can use them as raw material. Navigate to the Dashboard and click 'Run AI Match' on any listing. The matching engine considers material specs, proximity, and processing capacity.";
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('value')) {
      return 'Our AI price recommendation analyzes market rates, material quality grade, and quantity to suggest a fair price per kg. You can see recommended prices on each match in the Dashboard.';
    }
    if (lower.includes('co2') || lower.includes('carbon') || lower.includes('impact')) {
      return 'Every match on NexLoop AI calculates CO2 savings and landfill diversion. For example, diverting 1,000 kg of scrap metal saves approximately 1,800 kg CO2 — equivalent to planting 85 trees.';
    }
    if (lower.includes('report') || lower.includes('esg')) {
      return 'You can generate AI-powered ESG and sustainability reports from the Reports page. Reports include your circularity score, CO2 savings, waste diverted, and match history for any period.';
    }
    if (lower.includes('score') || lower.includes('circularity')) {
      return 'Your Circularity Score (0-100) is calculated from waste diverted, CO2 saved, active matches, and listings posted. Higher scores unlock better visibility on the marketplace and leaderboard.';
    }
    return "I'm NexLoop AI, your industrial symbiosis assistant. I can help with waste-to-resource matching, price recommendations, CO2 impact predictions, ESG reports, and circularity scores. What would you like to know?";
  }
}

/**
 * AI-Generated Sustainability/ESG Report.
 */
export async function aiGenerateReport(metrics: {
  orgName: string;
  period: string;
  co2SavedKg: number;
  wasteDivertedKg: number;
  circularityScore: number;
  matchesCount: number;
  reportType: string;
}): Promise<string> {
  const prompt = `Write a professional ${metrics.reportType.toUpperCase()} sustainability report for ${metrics.orgName} covering ${metrics.period}.

Metrics:
- Circularity Score: ${metrics.circularityScore}/100
- CO2 saved: ${metrics.co2SavedKg.toLocaleString()} kg
- Waste diverted from landfill: ${metrics.wasteDivertedKg.toLocaleString()} kg
- Industrial symbiosis matches: ${metrics.matchesCount}

Include sections: Executive Summary, Environmental Impact, Circular Economy Performance, and Recommendations.
Use plain text with clear section headers. Be specific and data-driven.`;

  try {
    return await aiChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.4, maxTokens: 1200 },
    );
  } catch (e) {
    console.error('aiGenerateReport failed, using fallback:', e);
    return `${metrics.orgName} — ${metrics.reportType.toUpperCase()} Report (${metrics.period})

Executive Summary
${metrics.orgName} has achieved a Circularity Score of ${metrics.circularityScore}/100 during ${metrics.period}, diverting ${metrics.wasteDivertedKg.toLocaleString()} kg of waste from landfill and saving ${metrics.co2SavedKg.toLocaleString()} kg of CO2 equivalent emissions through ${metrics.matchesCount} industrial symbiosis matches.

Environmental Impact
- Waste Diverted: ${metrics.wasteDivertedKg.toLocaleString()} kg
- CO2 Emissions Saved: ${metrics.co2SavedKg.toLocaleString()} kg
- Trees Equivalent: ${Math.round(metrics.co2SavedKg / 21)} trees
- Landfill Space Saved: ${(metrics.wasteDivertedKg * 0.001).toFixed(1)} cubic meters

Circular Economy Performance
${metrics.orgName} has demonstrated strong circular economy engagement with ${metrics.matchesCount} successful material exchanges. The organization's Circularity Score of ${metrics.circularityScore} places it in the ${metrics.circularityScore >= 80 ? 'leader' : metrics.circularityScore >= 60 ? 'achiever' : 'participant'} tier.

Recommendations
1. Continue expanding waste category coverage to unlock new matching opportunities
2. Engage with high-confidence matches first for maximum ROI
3. Consider cross-sector partnerships to diversify material flows
4. Track quarterly progress to maintain upward circularity trajectory

This report was generated by NexLoop AI's sustainability analytics engine.`;
  }
}
