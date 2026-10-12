import { NextRequest, NextResponse } from 'next/server';
import { processAiQuery, extractCropFromText, VisualArtifact } from '@/lib/ai/ai-brain';

interface ChatRequest {
  role?: string;
  language?: string;
  query?: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { role = 'guest', language = 'en', query, messages = [], context = {} } = body;

    // Resolve active prompt from query or latest user message
    let activeQuery = (query || '').trim();
    if (!activeQuery && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        activeQuery = lastUserMsg.content.trim();
      }
    }

    if (!activeQuery) {
      return NextResponse.json({
        success: true,
        response: 'Hello! I am FasalMatrix AI. How can I help you today with crops, market prices, or platform workflows?',
        role,
        language,
      });
    }

    // Step 1: Execute domain reasoning and visual artifact synthesis
    const brainResult = await processAiQuery({
      query: activeQuery,
      role,
      language,
      history: messages,
      context,
    });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Step 2: If Gemini API key is available, leverage Google Gemini 3.8 Flash for state-of-the-art generative intelligence
    if (apiKey) {
      try {
        const detectedCrop = brainResult.detectedCrop || extractCropFromText(activeQuery);
        
        // Define role-specific operational persona and guidance
        let rolePersona = '';
        if (role === 'farmer') {
          rolePersona = `You are acting as the Kisan Farmgate & Agronomy Copilot on FasalMatrix. Speak respectfully and empathetically with practical advice for Indian farmers. Highlight CCEA statutory MSP protection, optimal harvest timing, fair price valuations against spot APMC mandis, WDRA warehouse storage to avoid distress sales, and 0% broker fee advantages.`;
        } else if (role === 'buyer') {
          rolePersona = `You are acting as the Enterprise Bulk Procurement Advisor on FasalMatrix. Focus on institutional supply chain efficiency, recurring volume cadences, direct FPO farmgate contracts, benchmark arbitrage vs traditional APMC mandis, zero broker markups, and RBI nodal escrow protection.`;
        } else if (role === 'consumer') {
          rolePersona = `You are acting as the Consumer Timing Radar & Farm-to-Kitchen Grocery Advisor on FasalMatrix. Help households save 15-25% by timing their grocery procurement according to live wholesale mandi arrival trends and harvest freshness. Focus on AGMARK Grade A quality and locked farmgate savings.`;
        } else if (role === 'admin') {
          rolePersona = `You are acting as the Administrative Fleet & Network Command Intelligence Advisor on FasalMatrix. Focus on network integrity, capacitated VRP vehicle routing efficiency, cluster assay compliance, KYC validation velocity, and RBI nodal escrow audit trails.`;
        } else {
          rolePersona = `You are acting as FasalMatrix AI, the intelligent conversational copilot and agrarian advisor across India.`;
        }

        const systemPrompt = `You are FasalMatrix AI Assistant, a fast, knowledgeable, and ultra-concise agrarian & marketplace copilot in India powered by Google Gemini.
${rolePersona}
User Role: ${role}.
Language: ${language}. (Respond naturally in the language or script requested, or English/Hindi if unspecified. Supports all 22 Eighth Schedule Indian languages: Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, Santali, Kashmiri, Nepali, Konkani, Sindhi, Dogri, Manipuri, Bodo, Sanskrit, and English).

CRITICAL CONCISENESS RULES:
- ALWAYS keep responses short, direct, and concise (maximum 2-3 short sentences or 2-4 brief bullet points).
- DO NOT write lengthy essays, repetitive disclaimers, or excessive conversational padding. Get straight to the point.
- If answering a crop or price query, clearly mention the current rate, direction/trajectory, and statutory MSP in 2-3 short lines.
- For general questions or greetings, reply in 1-2 friendly, helpful sentences.

Statutory Guardrails:
- Minimum Support Price (MSP) set by CCEA/CACP is the inviolable legal floor.
- Direct farmgate trading connects verified farmer clusters/FPOs to buyers with 0% broker deductions.
- All trade transactions are backed by RBI-compliant nodal escrow accounts with T+1 bank clearing upon gate inspection.`;

        // Utilize current generation model gemini-3.8-flash (fallback to gemini-3.5-flash-lite if needed)
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${systemPrompt}\n\nUser Question: ${activeQuery}\nDetected Crop: ${detectedCrop || 'None'}\nDomain Model Reference:\n${brainResult.text}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 350,
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
              source: 'gemini-3.8-flash',
              response: generatedText.trim(),
              visualArtifact: brainResult.visualArtifact,
              suggestedPrompts: brainResult.suggestedPrompts,
              detectedCrop: brainResult.detectedCrop,
              role,
              language,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini 3.8 Flash live call error, falling back to autonomous brain:', geminiError);
      }
    }

    // Step 3: Return high-capability autonomous brain response with visual artifacts
    return NextResponse.json({
      success: true,
      source: 'autonomous-agrarian-brain',
      response: brainResult.text,
      visualArtifact: brainResult.visualArtifact,
      suggestedPrompts: brainResult.suggestedPrompts,
      detectedCrop: brainResult.detectedCrop,
      role,
      language,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI Chat request failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
