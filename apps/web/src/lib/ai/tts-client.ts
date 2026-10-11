// Centralized Client Audio Engine for Fasal Matrix AI Assistants
// Enforces a soft, warm female voice persona across all 22 scheduled Indian languages

const LANG_BCP47_MAP: Record<string, string> = {
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
  ne: 'ne-IN',
  kok: 'kok-IN',
  sd: 'sd-IN',
  doi: 'doi-IN',
  mni: 'mni-IN',
  brx: 'brx-IN',
  sa: 'sa-IN',
  en: 'en-IN',
};

let currentAudio: HTMLAudioElement | null = null;

export async function stopAiVoice(): Promise<void> {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function playSoftFemaleVoice(
  text: string,
  languageCode: string,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  await stopAiVoice();

  const bcp47 = LANG_BCP47_MAP[languageCode] || 'hi-IN';

  // 1. First attempt: High-fidelity Sarvam AI Neural TTS with soft female speaker 'pavithra'
  try {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.slice(0, 350),
        languageCode: bcp47,
        speaker: 'pavithra', // Soft, articulate female persona
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        currentAudio = audio;
        audio.onended = () => {
          currentAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          currentAudio = null;
          // Fallback to Web Speech on audio error
          speakBrowserSpeech(text, bcp47, onEnd, onError);
        };
        await audio.play();
        return;
      }
    }
  } catch {
    // Upstream fallback
  }

  // 2. Browser Web Speech Synthesis Fallback calibrated for Soft Female Tone
  speakBrowserSpeech(text, bcp47, onEnd, onError);
}

function speakBrowserSpeech(
  text: string,
  bcp47: string,
  onEnd?: () => void,
  onError?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47;

  // Parameters calibrated to sound soft, patient, and conversational
  utterance.pitch = 1.15; // slightly elevated gentle pitch
  utterance.rate = 0.90;  // unhurried, calm tempo
  utterance.volume = 0.95;

  // Search available browser voices for explicit female profiles
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const langPrefix = bcp47.slice(0, 2);
    // Find female voice matching target language
    const femaleVoice = voices.find(
      (v) =>
        (v.lang.startsWith(langPrefix) || v.lang.startsWith('en')) &&
        (v.name.toLowerCase().includes('female') ||
          v.name.includes('Zira') ||
          v.name.includes('Shruti') ||
          v.name.includes('Heera') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria'))
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onError?.();

  window.speechSynthesis.speak(utterance);
}
