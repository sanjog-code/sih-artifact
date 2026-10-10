import { Lang } from '../constants';
import { en } from './en';
import { hi } from './hi';
import { pa } from './pa';
import { mr } from './mr';
import { te } from './te';
import { ta } from './ta';
import type { Dictionary } from './en';

export { en, hi, pa, mr, te, ta };
export type { Dictionary };

/**
 * All 6 Indian languages wired through `t()`.
 * Fallback is English, ensuring partial translations never crash.
 */
const dictionaries: Record<Lang, Dictionary> = { en, hi, pa, mr, te, ta };
export const availableLanguages: Lang[] = ['en', 'hi', 'pa', 'mr', 'te', 'ta'];

export function translate(lang: Lang, keyPath: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[lang] ?? dictionaries.en;
  let value: unknown = dict;
  for (const part of keyPath.split('.')) {
    value = (value as Record<string, unknown>)?.[part];
    if (value === undefined) {
      // fallback to English
      value = en;
      for (const p of keyPath.split('.')) value = (value as Record<string, unknown>)?.[p];
      if (value === undefined) return keyPath;
      break;
    }
  }
  let out = typeof value === 'string' ? value : keyPath;
  if (params) {
    for (const [k, v] of Object.entries(params)) out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return out;
}

export const t = translate;