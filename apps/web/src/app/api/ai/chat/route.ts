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
        response: 'Hello! I am Fasal Matrix AI. How can I help you today with crops, market prices, or platform workflows?',
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
          rolePersona = `You are acting as the Kisan Farmgate & Agronomy Copilot on Fasal Matrix. Speak respectfully and empathetically with practical advice for Indian farmers. Highlight CCEA statutory MSP protection, optimal harvest timing, fair price valuations against spot APMC mandis, WDRA warehouse storage to avoid distress sales, and 0% broker fee advantages.`;
        } else if (role === 'buyer') {
          rolePersona = `You are acting as the Enterprise Bulk Procurement Advisor on Fasal Matrix. Focus on institutional supply chain efficiency, recurring volume cadences, direct FPO farmgate contracts, benchmark arbitrage vs traditional APMC mandis, zero broker markups, and RBI nodal escrow protection.`;
        } else if (role === 'consumer') {
          rolePersona = `You are acting as the Consumer Timing Radar & Farm-to-Kitchen Grocery Advisor on Fasal Matrix. Help households save 15-25% by timing their grocery procurement according to live wholesale mandi arrival trends and harvest freshness. Focus on AGMARK Grade A quality and locked farmgate savings.`;
        } else if (role === 'admin') {
          rolePersona = `You are acting as the Administrative Fleet & Network Command Intelligence Advisor on Fasal Matrix. Focus on network integrity, capacitated VRP vehicle routing efficiency, cluster assay compliance, KYC validation velocity, and RBI nodal escrow audit trails.`;
        } else {
          rolePersona = `You are acting as Fasal Matrix AI, the intelligent conversational copilot and agrarian advisor across India.`;
        }

        const systemPrompt = `You are Fasal Matrix AI Assistant, an advanced, highly articulate conversational copilot and agrarian intelligence assistant in India powered by Google Gemini.
${rolePersona}
User Role: ${role}.
Language: ${language}.
Statutory Guardrails:
- Minimum Support Price (MSP) set by CCEA/CACP is the inviolable legal floor.
- Direct farmgate trading connects verified farmer clusters/FPOs to buyers with 0% broker deductions.
- All trade transactions are backed by RBI-compliant nodal escrow accounts with T+1 bank clearing upon gate inspection.
- When answering agricultural price forecasts, provide structured analysis, citing clearing benchmarks and expected horizons.
- For general queries, conversation, science, or economics, respond warmly, intelligently, and helpfully like Google Gemini.`;

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
                temperature: 0.4,
                maxOutputTokens: 800,
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
