## 2026-10-10T18:28:44Z
You are worker_m3, a UI & Localization Specialist.

Working directory: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\worker_m3
Project root: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact
Authoritative original request: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\ORIGINAL_REQUEST.md
Master Project Plan: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\PROJECT.md
Survey 3 Report: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\explorer_survey_3\handoff.md
Parent Orchestrator Conversation ID: 824719d0-6b35-44b8-9f77-5aae587e296c

Scope boundaries & Write Ownership:
- You exclusively own:
  - apps/web/src/context/LanguageContext.tsx
  - apps/web/src/app/globals.css (Indic font stacks & typography fallbacks)
  - apps/web/src/app/layout.tsx (dynamic html lang synchronization)
  - UI text localization in:
    - apps/web/src/components/Navbar.tsx
    - apps/web/src/components/InquiryModal.tsx
    - apps/web/src/app/page.tsx
    - apps/web/src/app/about/page.tsx
    - apps/web/src/app/farmer/page.tsx
    - apps/web/src/app/buyer/page.tsx
    - apps/web/src/app/logistics/page.tsx
    - apps/web/src/app/consumer/page.tsx
  - packages/shared/src/constants/index.ts (LANGS constant export)
  - packages/shared/src/i18n/ (syncing 6 languages)
- DO NOT edit apps/web/src/app/api/ or test/e2e/ files.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission (Milestone 3 — UI Readability, Indic Fonts & 100% Multilingual Localization):
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_3/handoff.md completely.
2. Resolve Critical i18n Crash in apps/web/src/context/LanguageContext.tsx:
   - Implement deep dictionary fallback resolution so that if any key or nested object is omitted in non-English dictionaries, it recursively falls back to translations.en rather than evaluating to undefined and throwing runtime TypeError.
3. Complete Dictionary Translations for All 6 Languages:
   - English (en), हिन्दी (hi), ਪੰਜਾਬੀ (pa), मराठी (mr), తెలుగు (te), தமிழ் (ta).
   - Add all ~94 missing translation keys cataloged in explorer_survey_3/handoff.md covering:
     - farmer: form labels, placeholders, commodity dropdown options, grades, metrics, buttons, toasts, e-NWR pledge banner.
     - buyer: procurement labels, placeholders, volume, counter-bid options, escrow info, toasts.
     - logistics: vehicle types, capacities, metrics, stop sequence, manifest buttons, toasts.
     - about: badges, statistics labels, trust pillars, accreditation terminal, governance points.
     - portal / nav: portal links (Farmer, Buyer, Logistics, Consumer, Market, Advisory, About), badges, persona selector options.
     - consumer: marketplace filter tags, search, cart, checkout, escrow guarantee badges.
     - common: units (/kg, km, Liters, lots), breadcrumbs (Overview).
4. Replace All Hardcoded English Strings in UI Components:
   - Refactor Navbar.tsx, InquiryModal.tsx, page.tsx, about/page.tsx, farmer/page.tsx, buyer/page.tsx, logistics/page.tsx, and consumer/page.tsx to use t.* lookups.
   - For strings with dynamic values, use template interpolation (e.g. t.farmer.lotNotice.replace('{id}', id)...).
5. Indic Font & HTML Lang Synchronization:
   - In apps/web/src/app/globals.css: Define font fallbacks supporting Devanagari (Noto Sans Devanagari, Mangal), Gurmukhi (Raavi, Noto Sans Gurmukhi), Telugu (Gautami, Noto Sans Telugu), and Tamil (Latha, Noto Sans Tamil) so regional scripts render cleanly with crisp line-heights without clipping.
   - In apps/web/src/app/layout.tsx: Synchronize the `<html lang="...">` attribute dynamically.
   - Persist language in document.cookie alongside localStorage for server-render stability.
6. Monorepo Shared Synchronization:
   - Update packages/shared/src/constants/index.ts: `export const LANGS = ['en', 'hi', 'pa', 'mr', 'te', 'ta'] as const;`.
   - Update packages/shared/src/i18n/ so all 6 languages are supported.
7. Verification:
   - Run `cmd /c "cd apps\web && npx tsc --noEmit"`. Ensure zero TypeScript compilation errors.
   - Run `cmd /c "cd packages\shared && npx tsc --noEmit"`. Ensure zero errors.
   - Verify that all 6 languages compile and render with zero undefined errors.
8. Write handoff report to C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\worker_m3\handoff.md.
9. Send completion message to parent orchestrator (824719d0-6b35-44b8-9f77-5aae587e296c).
