import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorTranslations } from '@/lib/ai/multilingual-advisors';

interface ChatRequest {
  role: 'farmer' | 'buyer' | 'consumer';
  language: string;
  query: string;
  context?: {
    crop?: string;
    stage?: string;
    quantityKg?: number;
    price?: number;
    frequency?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { role = 'farmer', language = 'en', query = '', context = {} } = body;

    const t = getAdvisorTranslations(language);
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If a live Gemini API key is configured, call the Google Generative AI API
    if (apiKey) {
      try {
        const systemPrompt = `You are Fasal Matrix AI Assistant, an agricultural procurement and direct trading advisor in India.
Current User Role: ${role}.
Target Language: ISO code "${language}".
Tone: Polite, respectful, clear, soft, informative, and warm (Juniper persona).
Statutory Rule: Minimum Support Price (MSP) set by CACP is the inviolable legal floor. Prices can NEVER be negotiated below MSP.
Brokerage: 0% middleman deduction.
Escrow: T+1 bank settlement.
Respond directly in natural ${language} language without markdown fluff. Keep responses concise (under 80 words).`;

        const geminiRes = await fetch(
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
                      text: `${systemPrompt}\n\nUser Query: ${query}\nContext: ${JSON.stringify(context)}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 250,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 0) {
            return NextResponse.json({
              success: true,
              source: 'gemini-live',
              response: generatedText.trim(),
              language,
              role,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call fallback:', geminiError);
      }
    }

    // High-performance localized deterministic engine supporting all 22 languages
    let localizedResponse = '';
    if (role === 'farmer') {
      if (context.crop) {
        localizedResponse = `${t.farmer.timingPrompt} (${context.crop})`;
      } else {
        localizedResponse = t.farmer.welcome;
      }
    } else if (role === 'buyer') {
      if (context.crop) {
        localizedResponse = `${t.buyer.volumePrompt} (${context.crop})`;
      } else {
        localizedResponse = t.buyer.welcome;
      }
    } else {
      if (context.crop) {
        localizedResponse = `${t.consumer.qtyPrompt} (${context.crop})`;
      } else {
        localizedResponse = t.consumer.welcome;
      }
    }

    return NextResponse.json({
      success: true,
      source: 'local-multilingual-engine',
      response: localizedResponse,
      language,
      role,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI Chat request failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
