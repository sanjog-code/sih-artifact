'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
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
  Mic,
  MicOff,
  TrendingUp,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Globe,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { playSoftFemaleVoice, stopAiVoice } from '../lib/ai/tts-client';
import PriceTrajectoryChart, { TrajectoryPoint } from './PriceTrajectoryChart';
import { VisualArtifact } from '../lib/ai/ai-brain';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  visualArtifact?: VisualArtifact;
  suggestedPrompts?: string[];
}

const WELCOME_TEXT = `Namaste!  I am **Fasal Matrix AI**, your fast agricultural copilot.\n\n• **Price Forecasts**: Real-time mandi modal rates & price trajectory charts\n• **MSP Guardrails**: Zero-deduction CCEA price protection & RBI escrow\n• **Agronomy & Storage**: WDRA storage guidance & crop science\n\nAsk any question or tap the microphone to speak!`;

function FormattedMessage({ text, isUser }: { text: string; isUser?: boolean }) {
  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  // Sanitize any raw math, latex, or strange encoding artifacts
  const sanitized = text
    .replace(/\\ge\s*/g, '>= ')
    .replace(/\\le\s*/g, '<= ')
    .replace(/\\\$/g, '$')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/Â/g, '')
    .replace(/â€¢/g, '•')
    .replace(/â‚¹/g, '₹');

  const lines = sanitized.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-0.5">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInlineFormatted = (str: string) => {
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-zinc-950 dark:text-white">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }
    return parts.length > 0 ? parts : str;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h-${idx}`} className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-2.5 mb-1">
          {line.replace(/^###\s*/, '')}
        </h4>
      );
      return;
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushList();
      elements.push(
        <h3 key={`h-${idx}`} className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mt-3 mb-1">
          {line.replace(/^#{1,2}\s*/, '')}
        </h3>
      );
      return;
    }

    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.replace(/^[•\-*]\s*/, '');
      currentList.push(
        <li key={`li-${idx}`} className="flex items-start gap-2 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-1.5 shrink-0" />
          <span className="flex-1">{renderInlineFormatted(content)}</span>
        </li>
      );
      return;
    }

    flushList();
    elements.push(
      <p key={`p-${idx}`} className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
        {renderInlineFormatted(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1.5">{elements}</div>;
}

export default function AiAssistant() {
  return <AiAssistantWidget />;
}

function AiAssistantWidget() {
  const { language, setLanguage } = useLanguage();
  const { role, userIdentifier } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  // Speech-to-Text (STT) State
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');

  // 22 Scheduled Indian Languages + English Speech Recognition Locales
  const BCP47_LOCALES: Record<string, string> = {
    hi: 'hi-IN',
    bn: 'bn-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    ur: 'ur-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    or: 'or-IN',
    pa: 'pa-IN',
    as: 'as-IN',
    mai: 'mai-IN',
    sat: 'sat-IN',
    ks: 'ks-IN',
    ne: 'ne-NP',
    kok: 'kok-IN',
    sd: 'sd-IN',
    doi: 'doi-IN',
    mni: 'mni-IN',
    brx: 'brx-IN',
    sa: 'sa-IN',
    en: 'en-IN',
  };

  // Dynamically resolve role-tailored welcome text and suggested prompts
  const getRoleWelcome = (userRole?: string | null) => {
    if (userRole === 'farmer') {
      return {
        text: `Namaste!  I am your **Kisan Agronomy & Price Advisor**.\n\n• **Price Forecasts**: Live APMC modal rates & 14-to-90-day price curves\n• **MSP Protection**: Guaranteed legal floor with 0% broker cuts\n• **Warehouse Silos**: Safe WDRA storage to prevent distress sales\n\nAsk any question or tap a prompt below!`,
        prompts: [
          'Price forecast & graph for Wheat',
          'How does statutory MSP protect me?',
          'Optimal cold storage rules for Potato',
          'How do I list my harvest lot?',
        ],
      };
    } else if (userRole === 'buyer') {
      return {
        text: `Welcome!  I am your **Bulk Procurement Advisor**.\n\n• **Direct FPO Contracts**: 12–18% net savings bypassing broker cuts\n• **RBI Nodal Escrow**: 100% protected settlement till gate inspection\n• **Quality Assurance**: AGMARK Grade A certified lots\n\nAsk about commodity quotes, delivery, or forecasts!`,
        prompts: [
          'Bulk quote for 5 MT Wheat weekly',
          'Price prediction in next 3 months for Mustard',
          'How does RBI nodal escrow work?',
          'Show verified farmer clusters for Soybean',
        ],
      };
    } else if (userRole === 'consumer') {
      return {
        text: `Hello!  I am your **Smart Deal & Grocery Advisor**.\n\n• **Direct Farmgate**: Save 15-25% over retail supermarket prices\n• **Timing Radar**: Buy when wholesale mandi arrivals peak\n• **Grade A Produce**: Freshly harvested direct from farmers\n\nAsk what to buy this week or check a commodity rate!`,
        prompts: [
          'Best vegetable to buy right now',
          'Tomato prices and next week forecast',
          'How much do I save buying direct from farmers?',
          'How does doorstep delivery escrow work?',
        ],
      };
    } else if (userRole === 'admin') {
      return {
        text: `Greetings! ️ I am your **Network & Fleet Operations Copilot**.\n\n• **Capacitated VRP**: Live fleet routes & vehicle load optimization\n• **Mandi Oracles**: Ridge regression across 737,000+ clearing records\n• **Escrow Audit**: Live T+1 disbursement reconciliation\n\nAsk for fleet status, revenue projections, or audit metrics!`,
        prompts: [
          'Audit active escrow transactions',
          'Check fleet capacitated routing status',
          'Show FPO cluster compliance scores',
          'What is current platform MRR run rate?',
        ],
      };
    }

    return {
      text: WELCOME_TEXT,
      prompts: [
        'Price forecast for Wheat',
        'Tomato price graph & trajectory',
        'How does T+1 escrow protect me?',
        'How to store Mustard in WDRA Silo?',
      ],
    };
  };

  const initialRoleData = getRoleWelcome(role);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: initialRoleData.text,
      timestamp: 'Just now',
      suggestedPrompts: initialRoleData.prompts,
    },
  ]);

  // Update welcome text if user logs in or switches role
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        const updated = getRoleWelcome(role);
        return [
          {
            id: 'welcome',
            sender: 'ai',
            text: updated.text,
            timestamp: 'Just now',
            suggestedPrompts: updated.prompts,
          },
        ];
      }
      return prev;
    });
  }, [role]);

  // Listen for global window events to open AI with a pre-filled query
  useEffect(() => {
    const handleOpenAiEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string; autoSend?: boolean }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.query) {
        if (customEvent.detail.autoSend) {
          handleSendMessage(customEvent.detail.query);
        } else {
          setInputText(customEvent.detail.query);
        }
      }
    };

    window.addEventListener('farmlink_open_ai', handleOpenAiEvent);
    return () => window.removeEventListener('farmlink_open_ai', handleOpenAiEvent);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize SpeechRecognition safely on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) {
        setSttSupported(false);
      }
    }
  }, []);

  const startVoiceInput = () => {
    if (!sttSupported || typeof window === 'undefined') {
      // Browser fallback simulation if speech recognition is unavailable
      setInputText('Show me price forecast and graph for Wheat');
      return;
    }

    try {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.lang = BCP47_LOCALES[language] || (language === 'hi' ? 'hi-IN' : 'en-IN');
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setLiveTranscript('');
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);
        setInputText(transcript);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const speakText = async (text: string, msgId: string) => {
    if (isPlayingAudio && currentSpeakingId === msgId) {
      await stopAiVoice();
      setIsPlayingAudio(false);
      setCurrentSpeakingId(null);
      return;
    }

    await stopAiVoice();
    setIsPlayingAudio(true);
    setCurrentSpeakingId(msgId);

    // Strip markdown formatting before sending to TTS engine
    const plainText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();

    await playSoftFemaleVoice(
      plainText,
      language,
      () => {
        setIsPlayingAudio(false);
        setCurrentSpeakingId(null);
      },
      () => {
        setIsPlayingAudio(false);
        setCurrentSpeakingId(null);
      }
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    if (isListening) {
      stopVoiceInput();
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLiveTranscript('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          role: role || 'guest',
          language,
          messages: historyPayload,
          context: {
            userIdentifier: userIdentifier || undefined,
            role,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.response || 'I have analyzed your query.',
        timestamp: 'Just now',
        visualArtifact: data.visualArtifact,
        suggestedPrompts: data.suggestedPrompts,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I've analyzed your query regarding "${query}". All trades on Fasal Matrix connect directly with verified farmer clusters and WDRA warehouses with guaranteed statutory MSP floors and 0% broker fees.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: WELCOME_TEXT,
        timestamp: 'Just now',
        suggestedPrompts: [
          'Price forecast for Wheat',
          'Tomato price graph & trajectory',
          'How does T+1 escrow protect me?',
          'How to store Mustard in WDRA Silo?',
        ],
      },
    ]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-500/30"
          aria-label="Open Fasal Matrix Realtime AI Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-xs shadow-md">
            <Sparkles className="w-4 h-4 text-zinc-950 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
              Fasal Matrix AI (beta)
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Real-Time Talking Copilot</span>
          </div>
        </button>
      </div>
    );
  }

  const containerWidthClass = isExpanded
    ? 'w-[720px] max-w-[calc(100vw-2rem)]'
    : 'w-[440px] max-w-[calc(100vw-2rem)]';

  const containerHeightClass = isExpanded ? 'h-[720px] max-h-[88vh]' : 'h-[580px] max-h-[82vh]';

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${containerWidthClass} transition-all duration-300`}>
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
          isMinimized ? 'h-auto' : containerHeightClass
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-zinc-950 flex items-center justify-center font-bold shadow-md">
                <Bot className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-950"></span>
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-2">
                <span>
                  {role === 'farmer'
                    ? 'Kisan AI Agronomy Copilot (beta)'
                    : role === 'buyer'
                    ? 'Bulk Buyer Procurement Copilot (beta)'
                    : role === 'consumer'
                    ? 'Consumer Deal & Radar Copilot (beta)'
                    : role === 'admin'
                    ? 'Admin Network & Fleet Copilot (beta)'
                    : 'Fasal Matrix AI Assistant (beta)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-mono border border-emerald-800 font-bold">
                  Gemini 3.8 Flash & ML
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                <span>Real-Time Voice & Forecasts</span>
                {isPlayingAudio && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    Speaking
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Language Switcher Pill for 22 Languages */}
            <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-zinc-300">
              <Globe className="w-3 h-3 text-emerald-400 mr-1.5 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-zinc-200 text-[11px] font-medium focus:outline-none cursor-pointer pr-1"
                title="Select from 22 Regional Languages"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                    {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Clear Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {/* Expand / Narrow */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition hidden sm:block"
              title={isExpanded ? 'Compact View' : 'Expanded View'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            {/* Minimize */}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            {/* Close */}
            <button
              type="button"
              onClick={() => {
                stopAiVoice();
                setIsOpen(false);
              }}
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
            <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-zinc-50/70 dark:bg-zinc-950/70 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-3xl max-w-[88%] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-zinc-900 dark:bg-emerald-600 text-white rounded-br-xs shadow-md'
                        : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-bl-xs shadow-sm'
                    }`}
                  >
                    {/* Formatted Legible Message Rendering */}
                    <FormattedMessage text={m.text} isUser={m.sender === 'user'} />

                    {/* Inline Visual Artifact: Price Forecast & Chart */}
                    {m.visualArtifact?.type === 'price_forecast' && m.visualArtifact.forecastData && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            {m.visualArtifact.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold">
                            {m.visualArtifact.forecastData.demandSignal.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Interactive SVG Chart */}
                        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
                          <PriceTrajectoryChart
                            commodity={m.visualArtifact.forecastData.commodity}
                            currentModalPrice={m.visualArtifact.forecastData.currentModalPrice}
                            predictedPrice={m.visualArtifact.forecastData.predictedPrice}
                            mspFloor={m.visualArtifact.forecastData.mspFloor}
                            trajectory={m.visualArtifact.forecastData.trajectory}
                            demandSignal={m.visualArtifact.forecastData.demandSignal}
                            confidenceScore={m.visualArtifact.forecastData.confidenceScore}
                          />
                        </div>

                        {/* Metric Highlights Grid */}
                        {m.visualArtifact.metrics && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {m.visualArtifact.metrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60"
                              >
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                  {metric.label}
                                </div>
                                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {metric.value}
                                </div>
                                {metric.delta && (
                                  <div
                                    className={`text-[9px] font-medium mt-0.5 ${
                                      metric.sentiment === 'positive'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : metric.sentiment === 'negative'
                                        ? 'text-red-500'
                                        : 'text-zinc-400'
                                    }`}
                                  >
                                    {metric.delta}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline Visual Artifact: Shelf Life & Storage */}
                    {m.visualArtifact?.type === 'shelf_life' && m.visualArtifact.shelfLifeData && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          <Warehouse className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          {m.visualArtifact.title}
                        </div>

                        {m.visualArtifact.metrics && (
                          <div className="grid grid-cols-2 gap-2">
                            {m.visualArtifact.metrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60"
                              >
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                  {metric.label}
                                </div>
                                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {metric.value}
                                </div>
                                {metric.delta && (
                                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    {metric.delta}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Links */}
                    {m.visualArtifact?.actionLinks && m.visualArtifact.actionLinks.length > 0 && (
                      <div className="mt-3 pt-2 flex flex-wrap gap-2">
                        {m.visualArtifact.actionLinks.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 transition"
                          >
                            <span>{link.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Footer with Timestamp & Voice Reader */}
                    {m.sender === 'ai' && (
                      <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-medium">{m.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => speakText(m.text, m.id)}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                        >
                          {isPlayingAudio && currentSpeakingId === m.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-red-500">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Listen Response</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Dynamic Suggested Prompts */}
              {messages.length > 0 &&
                messages[messages.length - 1].sender === 'ai' &&
                messages[messages.length - 1].suggestedPrompts && (
                  <div className="pt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Suggested Next Inquiries
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {messages[messages.length - 1].suggestedPrompts!.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(prompt)}
                          className="text-left px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 text-[11px] transition hover:shadow-xs"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {loading && (
                <div className="flex gap-2.5 items-center text-zinc-500 dark:text-zinc-400 text-xs py-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center animate-spin">
                    <Loader2 className="w-4 h-4" />
                  </div>
                  <span className="animate-pulse">Reasoning over APMC clearing data & generating forecast...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Listening Feedback Banner */}
            {isListening && (
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/80 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold">Listening... Speak now</span>
                </div>
                {liveTranscript && (
                  <span className="italic truncate max-w-[200px]">"{liveTranscript}"</span>
                )}
                <button
                  type="button"
                  onClick={stopVoiceInput}
                  className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Input Form with Voice STT & Send */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={isListening ? 'Listening to voice...' : 'Ask anything, request graphs, or speak...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />

              {/* Voice Input Mic Button */}
              <button
                type="button"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`p-2.5 rounded-2xl transition ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400'
                }`}
                title={isListening ? 'Stop listening' : 'Speak via microphone'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                title="Send message"
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
