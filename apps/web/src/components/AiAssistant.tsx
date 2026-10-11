'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Minimize2,
  Maximize2,
  Bot,
  User,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function AiAssistant() {
  const { role } = useAuth();

  // If consumer is logged in, their exclusive ConsumerAiShoppingAdvisor handles consumer guidance
  // If farmer is logged in, their exclusive FarmerAiListingAdvisor handles farmer listing guidance
  if (role === 'consumer' || role === 'farmer') {
    return null;
  }

  return <AiAssistantWidget />;
}

function AiAssistantWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! I am Fasal Matrix AI, your agrarian advisor. Ask me about mandi modal prices, MSP statutory floors, FPO cooperatives, AGMARK grading, or cold-storage e-NWR pledges.',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakTextWithSarvamTts = async (text: string) => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    try {
      // Call Sarvam TTS API
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          languageCode: language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN',
        }),
      });

      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
        return;
      }

      // Browser Web Speech fallback with natural voice parameters
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const query = userMsg.text.toLowerCase();

    // Natural agrarian domain intelligence rules
    setTimeout(() => {
      let reply = '';
      if (query.includes('tomato') || query.includes('tamatar')) {
        reply = 'Tomato prices currently hold at ₹26 - ₹29/kg in northern depots. Holding beyond 4 days incurs perishability decay under ambient temperatures. Verified cold-storage with 88% RH extends optimal shelf-life by 7 days.';
      } else if (query.includes('wheat') || query.includes('gehu')) {
        reply = 'Wheat (Sharbati) is trading above the statutory MSP floor of ₹22.75/kg at ₹24.50 - ₹28.00/kg. Depositing your lot at Ujjain or Jaipur WDRA Silos allows unlocking up to 50% instant liquidity via partner bank e-NWR escrows.';
      } else if (query.includes('mustard') || query.includes('sarson')) {
        reply = 'Mustard / Rapeseed is at peak market demand at ₹88.00/kg across Phulera and Jaipur hubs. Grade A1 certified lots (>40% oil content) trade at an additional ₹2.50/kg premium.';
      } else if (query.includes('escrow') || query.includes('payment') || query.includes('payout')) {
        reply = 'Fasal Matrix operates under an RBI-regulated node escrow. When buyers confirm a purchase, consideration is locked instantly and disbursed directly into your bank account on T+1 terms within 24 hours of destination gate pass verification.';
      } else if (query.includes('msp') || query.includes('minimum')) {
        reply = 'Every commodity on Fasal Matrix is bound by statutory CCEA Minimum Support Price (MSP) hard guardrails. The platform algorithmically prevents buyers from bidding below official benchmark floors.';
      } else {
        reply = `I have logged your agrarian query regarding "${userMsg.text}". All trades on Fasal Matrix connect directly to verified FPO cooperatives, APMC mandi arrivals, and WDRA accredited depots with zero broker cuts.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 700);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-white/20"
          aria-label="Open Fasal Matrix AI Voice Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-400 text-zinc-950 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
          </div>
          <span className="text-xs font-bold tracking-tight">Fasal Matrix AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <span>Fasal Matrix AI Agrarian Advisor</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-mono border border-emerald-800">
                  Sarvam TTS Active
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                MSP floors & APMC price intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Body */}
            <div className="p-4 h-80 overflow-y-auto space-y-3 bg-[#fafafa] dark:bg-zinc-950 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-zinc-900 dark:bg-emerald-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.sender === 'ai' && (
                      <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">{m.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => speakTextWithSarvamTts(m.text)}
                          className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          {isPlayingAudio ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-500" />
                              <span>Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Listen via Sarvam TTS</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center text-zinc-500 italic">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing APMC advisory...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Query Suggestions */}
            <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => setInputText('What is the MSP floor for Wheat?')}
                className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 whitespace-nowrap transition"
              >
                Wheat MSP
              </button>
              <button
                type="button"
                onClick={() => setInputText('How does the T+1 escrow payout work?')}
                className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 whitespace-nowrap transition"
              >
                Escrow Rules
              </button>
              <button
                type="button"
                onClick={() => setInputText('Tell me about Mustard market demand')}
                className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 whitespace-nowrap transition"
              >
                Mustard Demand
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about crops, prices, escrows..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
