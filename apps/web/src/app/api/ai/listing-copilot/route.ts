import { NextRequest, NextResponse } from 'next/server';
import {
  AI_MANDATORY_DISCLAIMER,
  validateListingRequest,
} from '@/lib/server/ai-contracts';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = validateListingRequest(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error,
        },
        { status: 400 }
      );
    }

    const { farmerNotes, farmerTier = 'basic', language = 'en', photoUrls = [] } = parseResult.data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let responseData;

    if (apiKey) {
      try {
        const systemPrompt = `You are the FarmLink Premier Farmer Listing Copilot.
Convert rough produce notes or voice transcriptions from Indian farmers into a structured, professional marketplace listing.
MANDATORY CONSTRAINTS:
1. The farmer has final authority. Never publish without user review.
2. Standardize packaging, search tags, storage advice, and suggested AGMARK grade based on described produce condition.
3. Language: ${language}.
Output strict JSON matching the schema:
{
  "draftListing": {
    "commodity": string,
    "variety": string,
    "suggestedGrade": "Grade A1" | "Grade A2" | "Grade B" | "Grade C" | "Ungraded",
    "estimatedQuantityKg": number,
    "unit": "kg" | "quintal" | "ton",
    "standardPackaging": string,
    "indicativePricePerKg": number,
    "minOrderQuantityKg": number,
    "searchTags": string[],
    "description": string,
    "storageAdvice": string
  },
  "qualityChecklist": string[]
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
                      text: `${systemPrompt}\n\nFarmer Tier: ${farmerTier}\nFarmer Notes: "${farmerNotes}"\nPhotos Provided: ${
                        photoUrls.length
                      }`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
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
        console.warn('[ListingCopilot] Gemini call failed, falling back to rule engine:', err);
      }
    }

    if (!responseData) {
      const lower = farmerNotes.toLowerCase();
      let commodity = 'Wheat';
      let variety = 'Sharbati High-Gluten';
      let indicativePrice = 32;

      if (lower.includes('tomato') || lower.includes('tamatar')) {
        commodity = 'Tomato';
        variety = 'Deshi Hybrid (Himsona)';
        indicativePrice = 24;
      } else if (lower.includes('onion') || lower.includes('pyaz')) {
        commodity = 'Onion';
        variety = 'Nashik Red Garwa';
        indicativePrice = 28;
      } else if (lower.includes('mustard') || lower.includes('sarson')) {
        commodity = 'Mustard';
        variety = 'Pusa Bold High-Oil';
        indicativePrice = 54;
      } else if (lower.includes('potato') || lower.includes('aloo')) {
        commodity = 'Potato';
        variety = 'Kufri Jyoti Table Grade';
        indicativePrice = 18;
      } else if (lower.includes('soybean')) {
        commodity = 'Soybean';
        variety = 'JS-335';
        indicativePrice = 46;
      }

      const qtyMatch = farmerNotes.match(/(\d+)\s*(quintal|quental|kattay|bori|bag|bags|ton|kg)/i);
      let qtyKg = 4000;
      if (qtyMatch) {
        const val = parseFloat(qtyMatch[1]);
        const unit = qtyMatch[2].toLowerCase();
        if (unit.startsWith('ton')) qtyKg = val * 1000;
        else if (unit.startsWith('quintal') || unit.startsWith('quental')) qtyKg = val * 100;
        else if (unit.startsWith('bag') || unit.startsWith('bori') || unit.startsWith('kattay')) qtyKg = val * 50;
        else if (unit.startsWith('kg')) qtyKg = val;
      }

      responseData = {
        draftListing: {
          commodity,
          variety,
          suggestedGrade: 'Grade A1',
          estimatedQuantityKg: qtyKg,
          unit: 'quintal',
          standardPackaging: '50kg moisture-barrier laminated HDPE bags',
          indicativePricePerKg: indicativePrice,
          minOrderQuantityKg: Math.min(500, qtyKg),
          searchTags: [commodity, variety, 'Cleaned & Sorted', 'Farmgate Direct', 'T+1 Escrow'],
          description: `Freshly harvested ${variety} ${commodity}. Sun-dried, machine cleaned with low moisture content and zero foreign admixture.`,
          storageAdvice: 'Store in dry, elevated pallet stacking away from direct moisture.',
        },
        qualityChecklist: [
          'Verify grain/produce moisture does not exceed statutory CCEA limit',
          'Ensure packaging bags are clean and free of pest contamination',
          'Confirm weighing tare deduction standards before loading',
        ],
      };
    }

    const validatedOutput = {
      isAiAssisted: true,
      disclaimer: AI_MANDATORY_DISCLAIMER,
      requiresFarmerConfirmation: true,
      ...responseData,
    };

    return NextResponse.json(validatedOutput);
  } catch (error) {
    console.error('[ListingCopilot] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
