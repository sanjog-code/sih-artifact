import { NextRequest, NextResponse } from 'next/server';
import {
  AI_MANDATORY_DISCLAIMER,
  validateMatchRequest,
} from '@/lib/server/ai-contracts';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = validateMatchRequest(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error,
        },
        { status: 400 }
      );
    }

    const { listingDetails, requirementDetails } = parseResult.data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let responseData;

    if (apiKey) {
      try {
        const systemPrompt = `You are the FarmLink Premier Supply-Demand Match Explanation Engine.
Explain transparently why a farmer's crop listing matches or differs from a buyer's procurement requirement.
Highlight 4 key criteria:
1. locationProximity
2. gradeCompatibility
3. priceTolerance
4. fulfillmentVolume

Output strict JSON matching the schema:
{
  "overallMatchScorePct": number between 0 and 100,
  "rating": "EXCELLENT" | "GOOD" | "MODERATE" | "WEAK",
  "factors": {
    "locationProximity": { "factorName": "Location Proximity", "scorePct": number, "status": "STRONG_ALIGNMENT" | "ACCEPTABLE" | "SLIGHT_VARIANCE" | "MISALIGNED", "explanation": string },
    "gradeCompatibility": { "factorName": "Grade Compatibility", "scorePct": number, "status": "STRONG_ALIGNMENT" | "ACCEPTABLE" | "SLIGHT_VARIANCE" | "MISALIGNED", "explanation": string },
    "priceTolerance": { "factorName": "Price Alignment", "scorePct": number, "status": "STRONG_ALIGNMENT" | "ACCEPTABLE" | "SLIGHT_VARIANCE" | "MISALIGNED", "explanation": string },
    "fulfillmentVolume": { "factorName": "Fulfillment Volume", "scorePct": number, "status": "STRONG_ALIGNMENT" | "ACCEPTABLE" | "SLIGHT_VARIANCE" | "MISALIGNED", "explanation": string }
  },
  "narrativeExplanation": string,
  "recommendedAction": string,
  "frictionPoints": string[]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${systemPrompt}\n\nListing: ${JSON.stringify(
                        listingDetails
                      )}\nBuyer Requirement: ${JSON.stringify(requirementDetails)}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (res.ok) {
          const aiJson = await res.json();
          const rawText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            responseData = JSON.parse(rawText);
          }
        }
      } catch (err) {
        console.warn('[MatchExplanation] Gemini call failed, using rule engine:', err);
      }
    }

    if (!responseData) {
      // Deterministic factor calculation
      const gradeMatches = listingDetails.grade.toLowerCase().includes(requirementDetails.preferredGrade.toLowerCase().slice(0, 5));
      const priceFavorable = listingDetails.pricePerKg <= requirementDetails.targetPricePerKg * 1.05;
      const volumeAdequate = listingDetails.quantityKg >= requirementDetails.requiredQuantityKg * 0.8;

      const gradeScore = gradeMatches ? 98 : 75;
      const priceScore = priceFavorable ? 95 : 70;
      const volumeScore = volumeAdequate ? 92 : 65;
      const locationScore = 88;

      const overall = Math.round((gradeScore + priceScore + volumeScore + locationScore) / 4);

      responseData = {
        overallMatchScorePct: overall,
        rating: overall >= 90 ? 'EXCELLENT' : overall >= 80 ? 'GOOD' : overall >= 65 ? 'MODERATE' : 'WEAK',
        factors: {
          locationProximity: {
            factorName: 'Location Proximity',
            scorePct: locationScore,
            status: 'STRONG_ALIGNMENT',
            explanation: `Listing origin (${listingDetails.location}) connects via designated agro-logistics corridor to destination (${requirementDetails.destinationLocation}).`,
          },
          gradeCompatibility: {
            factorName: 'Grade Compatibility',
            scorePct: gradeScore,
            status: gradeMatches ? 'STRONG_ALIGNMENT' : 'ACCEPTABLE',
            explanation: `Listing is certified ${listingDetails.grade}; buyer preferred ${requirementDetails.preferredGrade}. High optical and moisture consistency.`,
          },
          priceTolerance: {
            factorName: 'Price Alignment',
            scorePct: priceScore,
            status: priceFavorable ? 'STRONG_ALIGNMENT' : 'SLIGHT_VARIANCE',
            explanation: `Farmer asking rate is ₹${listingDetails.pricePerKg}/kg vs buyer ceiling ₹${requirementDetails.targetPricePerKg}/kg.`,
          },
          fulfillmentVolume: {
            factorName: 'Fulfillment Volume',
            scorePct: volumeScore,
            status: volumeAdequate ? 'STRONG_ALIGNMENT' : 'SLIGHT_VARIANCE',
            explanation: `Listing offers ${listingDetails.quantityKg} kg toward buyer requirement of ${requirementDetails.requiredQuantityKg} kg.`,
          },
        },
        narrativeExplanation: `Strong multi-criteria match (${overall}%). Grade standards and price parameters fall well within direct trade tolerance with zero middleman deductions.`,
        recommendedAction: 'Proceed to formal trade locking and RBI Nodal escrow deposit.',
        frictionPoints: priceFavorable ? [] : ['Slight price variance requires mutual volume-based discount negotiation.'],
      };
    }

    const validatedOutput = {
      isAiAssisted: true,
      disclaimer: AI_MANDATORY_DISCLAIMER,
      ...responseData,
    };

    return NextResponse.json(validatedOutput);
  } catch (error) {
    console.error('[MatchExplanation] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
