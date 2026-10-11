'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceListingButtonProps {
  onTranscriptParsed: (parsed: {
    cropName?: string;
    quantityKg?: number;
    price?: number;
    grade?: string;
  }) => void;
}

export default function VoiceListingButton({ onTranscriptParsed }: VoiceListingButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window !== 'undefined') {
        const SpeechRec =
          (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
        if (!SpeechRec) {
          setSupported(false);
        }
      }
    });
  }, []);

  const parseSpokenText = (text: string) => {
    const lower = text.toLowerCase();
    const result: { cropName?: string; quantityKg?: number; price?: number; grade?: string } = {};

    // Crop detection
    if (lower.includes('wheat') || lower.includes('gehu') || lower.includes('गेहूं')) result.cropName = 'Wheat';
    else if (lower.includes('tomato') || lower.includes('tamatar') || lower.includes('टमाटर')) result.cropName = 'Tomato';
    else if (lower.includes('mustard') || lower.includes('sarson') || lower.includes('सरसों')) result.cropName = 'Mustard';
    else if (lower.includes('soybean') || lower.includes('soya') || lower.includes('सोयाबीन')) result.cropName = 'Soybean';
    else if (lower.includes('potato') || lower.includes('aaloo') || lower.includes('आलू')) result.cropName = 'Potato';
    else if (lower.includes('chana') || lower.includes('चना')) result.cropName = 'Chana';

    // Quantity detection (e.g. "5000 kg", "20 quintal", "10 ton", "2000")
    const qtyMatch = lower.match(/(\d+[\d,]*)\s*(kg|kilo|quintal|kattal|ton|tonne)?/i);
    if (qtyMatch) {
      let val = parseFloat(qtyMatch[1].replace(/,/g, ''));
      const unit = (qtyMatch[2] || '').toLowerCase();
      if (unit.includes('quintal') || unit.includes('kattal')) val *= 100;
      else if (unit.includes('ton')) val *= 1000;
      result.quantityKg = val;
    }

    // Price detection (e.g. "26 rupees", "at 28", "price 30")
    const priceMatch = lower.match(/(?:at|price|rate|rupees|rs|रुपये)\s*(\d+(?:\.\d+)?)/i) || lower.match(/(\d+(?:\.\d+)?)\s*(?:rupees|rs|रुपये)/i);
    if (priceMatch) {
      result.price = parseFloat(priceMatch[1]);
    }

    // Grade detection
    if (lower.includes('a1') || lower.includes('grade 1')) result.grade = 'Grade A1';
    else if (lower.includes('a2') || lower.includes('grade 2')) result.grade = 'Grade A2';
    else if (lower.includes('b1')) result.grade = 'Grade B1';

    return result;
  };

  const startListening = () => {
    if (!supported || typeof window === 'undefined') {
      // Simulate voice demo if speech recognition not supported in browser environment
      const simulatedText = '5000 kg Grade A1 Wheat at 26.5 rupees';
      const parsed = parseSpokenText(simulatedText);
      onTranscriptParsed(parsed);
      setFeedback('Populated from simulated speech utterance');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    try {
      type SpeechEvent = {
        results: Array<Array<{ transcript: string }>>;
      };
      type SpeechInstance = {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onstart: () => void;
        onresult: (e: SpeechEvent) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };

      const SpeechRecognitionConstructor = (
        window as unknown as {
          SpeechRecognition?: new () => SpeechInstance;
          webkitSpeechRecognition?: new () => SpeechInstance;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechInstance;
        }
      ).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) return;

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'hi-IN'; // Default Hindi / Indian English
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening... Speak lot details (e.g., "5000 kg Wheat at 26 rupees")');
      };

      recognition.onresult = (event: SpeechEvent) => {
        const spoken = event.results[0]?.[0]?.transcript || '';
        const parsed = parseSpokenText(spoken);
        onTranscriptParsed(parsed);
        setFeedback(`Recognized: "${spoken}"`);
        setTimeout(() => setFeedback(null), 4000);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setFeedback('Voice recognition error. You can type manually.');
        setTimeout(() => setFeedback(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={startListening}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
          isListening
            ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
        }`}
        title="Speak lot details to auto-fill form (Hindi / English)"
      >
        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        <span>{isListening ? 'Listening...' : 'Voice Auto-Fill (बोलें)'}</span>
      </button>

      {feedback && (
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
