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

    // Step 2: If Gemini API key is available, leverage Google Gemini 2.5 Flash for generative flair
    if (apiKey) {
      try {
        const detectedCrop = brainResult.detectedCrop || extractCropFromText(activeQuery);
        const systemPrompt = `You are Fasal Matrix AI Assistant, an advanced agrarian intelligence copilot and universal conversational chatbot in India (similar to Google Gemini / ChatGPT with deep agricultural grounding).
User Role: ${role}.
Language: ${language}.
Statutory Rules:
- Minimum Support Price (MSP) set by CCEA/CACP is the inviolable legal floor.
- Trades connect directly from farmgate/FPOs to buyers with 0% broker deductions.
- Payments are secured by RBI-compliant nodal escrow with T+1 bank disbursement.
- When explaining forecasts or market prices for crops, be articulate, structured, and informative.
- If the user asks a general query or chit-chat, reply naturally, intelligently, and warmly.`;

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
                      text: `${systemPrompt}\n\nUser Question: ${activeQuery}\nDetected Crop Context: ${detectedCrop || 'None'}\nReference Model Insights:\n${brainResult.text}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 600,
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
              source: 'gemini-2.5-flash',
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
        console.warn('Gemini live call error, falling back to autonomous brain:', geminiError);
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
