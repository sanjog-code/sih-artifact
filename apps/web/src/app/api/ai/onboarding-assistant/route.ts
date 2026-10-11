import { NextRequest, NextResponse } from 'next/server';
import {
  AI_MANDATORY_DISCLAIMER,
  validateOnboardingRequest,
} from '@/lib/server/ai-contracts';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = validateOnboardingRequest(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error,
        },
        { status: 400 }
      );
    }

    const { userRole, language, userInput, currentProfileDraft } = parseResult.data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let responseData;

    if (apiKey) {
      try {
        const systemPrompt = `You are the FarmLink Premier Multilingual Onboarding Copilot.
Your purpose is to help Indian ${userRole}s set up their profile smoothly in their chosen language (${language}).
RULES:
1. Speak respectfully and empathetically in ${language}.
2. Extract any mentioned profile details (name, district, state, crops/produce of interest, scale/acreage).
3. Do NOT make financial, legal, credit, or certification decisions.
4. Output strict JSON matching the schema:
{
  "conversationalReply": string,
  "extractedProfile": {
    "name": string or null,
    "state": string or null,
    "district": string or null,
    "commodities": string[],
    "scale": string or null,
    "profileCompletenessPct": number between 0 and 100
  },
  "suggestedNextPrompt": string,
  "onboardingStage": "GREETING" | "LOCATION_SETUP" | "COMMODITY_SELECTION" | "SCALE_INPUT" | "READY_TO_CONFIRM",
  "readyToSubmit": boolean
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
                      text: `${systemPrompt}\n\nUser Input: "${userInput}"\nCurrent Draft: ${JSON.stringify(
                        currentProfileDraft || {}
                      )}`,
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
        console.warn('[OnboardingAssistant] Gemini call failed, falling back to rule-based engine:', err);
      }
    }

    // Deterministic fallback if Gemini is offline or not configured
    if (!responseData) {
      const lower = userInput.toLowerCase();
      const detectedCrops: string[] = [];
      const commonCrops = ['tomato', 'wheat', 'onion', 'mustard', 'soybean', 'potato', 'chana', 'rice', 'paddy', 'groundnut', 'mango', 'cotton', 'maize'];
      for (const crop of commonCrops) {
        if (lower.includes(crop)) detectedCrops.push(crop.charAt(0).toUpperCase() + crop.slice(1));
      }

      const isHindi = language === 'hi';
      const isPunjabi = language === 'pa';

      let reply = `Namaste! Welcome to FarmLink Premier. I will assist you with onboarding as a ${userRole}.`;
      if (isHindi) {
        reply = `नमस्ते! फार्मलिंक प्रीमियर में आपका स्वागत है। मैं एक ${userRole === 'farmer' ? 'किसान' : 'व्यापारी'} के रूप में आपका खाता सेट करने में मदद करूँगा।`;
      } else if (isPunjabi) {
        reply = `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਫਾਰਮਲਿੰਕ ਪ੍ਰੀਮੀਅਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਮੈਂ ਤੁਹਾਡਾ ਪ੍ਰੋਫਾਈਲ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।`;
      }

      if (detectedCrops.length > 0) {
        reply += isHindi
          ? ` हमने आपकी फसलें दर्ज कर ली हैं: ${detectedCrops.join(', ')}। कृपया अपने जिले और राज्य की पुष्टि करें।`
          : ` We noted your key crops: ${detectedCrops.join(', ')}. Please confirm your district and state.`;
      }

      responseData = {
        conversationalReply: reply,
        extractedProfile: {
          name: currentProfileDraft?.name || null,
          state: currentProfileDraft?.state || (lower.includes('maharashtra') ? 'Maharashtra' : lower.includes('punjab') ? 'Punjab' : null),
          district: currentProfileDraft?.district || (lower.includes('nashik') ? 'Nashik' : lower.includes('ludhiana') ? 'Ludhiana' : null),
          commodities: detectedCrops.length > 0 ? detectedCrops : (currentProfileDraft?.commodities || []),
          scale: currentProfileDraft?.scale || null,
          profileCompletenessPct: detectedCrops.length > 0 ? 60 : 30,
        },
        suggestedNextPrompt: isHindi ? 'अपनी प्रमुख मंडी या तहसील का नाम बताएं।' : 'Which primary APMC mandi or tehsil are you nearest to?',
        onboardingStage: detectedCrops.length > 0 ? 'LOCATION_SETUP' : 'COMMODITY_SELECTION',
        readyToSubmit: false,
      };
    }

    const validatedOutput = {
      isAiAssisted: true,
      disclaimer: AI_MANDATORY_DISCLAIMER,
      ...responseData,
    };

    return NextResponse.json(validatedOutput);
  } catch (error) {
    console.error('[OnboardingAssistant] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
