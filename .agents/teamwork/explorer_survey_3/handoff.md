# Handoff Report: UI Component & Multilingual Localization Survey

**Agent**: explorer_survey_3 (Read-Only Exploration Agent)  
**Date**: 2026-10-10  
**Project**: FarmLink (`C:\Users\amans\.gemini\antigravity\scratch\sih-artifact`)  
**Parent**: Lead Orchestrator (`824719d0-6b35-44b8-9f77-5aae587e296c`)  

---

## 1. Observation

### 1.1 UI Styling Architecture & Design System
- **Framework & CSS**: Next.js 16.3.5 (Turbopack) with React 19.2.8. Styling uses Tailwind CSS v4 (`@tailwindcss/postcss: ^4`, `tailwindcss: ^4`). `apps/web/src/app/globals.css` imports Tailwind via `@import "tailwindcss";` and defines `@theme inline` variables.
- **Iconography**: `lucide-react` v1.54.0 is used across all components and pages with clean 14–16px stroke icons (`Sprout`, `ShieldCheck`, `TrendingUp`, `Truck`, `Scale`, `Receipt`, `CheckCircle2`, `AlertCircle`, `Camera`, `ThermometerSnowflake`, `PhoneCall`, `Compass`, `Leaf`, `Fuel`, `RefreshCw`).
- **Typography & Font Stack**:
  - `apps/web/src/app/layout.tsx` (lines 6–14) loads Google Fonts `Geist` and `Geist_Mono` with `subsets: ['latin']`.
  - In `apps/web/src/app/globals.css` (line 25): `body { font-family: Arial, Helvetica, sans-serif; }`.
  - In `apps/web/src/app/layout.tsx` (line 32): `body` applies `font-sans` (`var(--font-geist-sans)`).
  - **Observation on Indic Scripts**: Neither `layout.tsx` nor `globals.css` defines font families or fallback web fonts for Devanagari (Hindi, Marathi), Gurmukhi (Punjabi), Telugu, or Tamil scripts. Non-Latin characters rely purely on host OS fallback fonts.
- **Visual Aesthetics & Minimalism**:
  - The design features a restrained, high-density financial/institutional terminal aesthetic.
  - Palette: Crisp canvas (`#fafafa`), pristine white cards (`#ffffff`), dark terminal contrast (`#0a0a0a`/`zinc-950`), with purposeful agricultural accents in emerald (`emerald-50`, `emerald-700`, `emerald-800`).
  - Monospace typography (`font-mono`) is utilized for commodities pricing, batch IDs, weights, and metrics (`₹28/kg`, `4,200 kg`, `LOT-RJ-8401`), providing clear tabular readability.

### 1.2 Localization Architecture & Dictionaries
- **Dual Architecture Disconnect**:
  1. **Web App Context (`apps/web/src/context/LanguageContext.tsx`)**:
     - Custom React Context (`LanguageProvider`, `useLanguage()`), not `next-intl` or `react-i18next`.
     - 1,186 lines (107 KB) holding a single inline dictionary object `translations = { en: {...}, hi: {...}, pa: {...}, mr: {...}, te: {...}, ta: {...} }`.
     - Defines `LanguageCode = 'en' | 'hi' | 'pa' | 'mr' | 'te' | 'ta'`.
     - Supported languages:
       1. `en` (English)
       2. `hi` (हिन्दी)
       3. `pa` (ਪੰਜਾਬੀ)
       4. `mr` (मराठी)
       5. `te` (తెలుగు)
       6. `ta` (தமிழ்)
     - Key count: **155 keys** mirrored across all 6 languages.
  2. **Shared Package (`packages/shared/src/i18n/`)**:
     - Contains `en.ts`, `hi.ts`, and `index.ts`.
     - In `packages/shared/src/constants/index.ts` (line 283): `export const LANGS = ['en', 'hi'] as const;`.
     - `pa`, `mr`, `te`, and `ta` are **completely absent** in `packages/shared`.
     - `apps/web` does **not** import or use `@farmlink/shared/i18n`.
- **Language Switcher UI & Persistence**:
  - Desktop: Button in `Navbar.tsx` (lines 80–116) displays the native script of the selected language and triggers a dropdown with all 6 options.
  - Mobile: Icon button in `Navbar.tsx` (lines 139–144) expands a 3-column pill grid.
  - Footer: `Footer.tsx` (lines 132–154) provides a 2-column grid selector.
  - **Persistence mechanism**: `localStorage.getItem('farmlink_lang')` and `localStorage.setItem('farmlink_lang', lang)` inside `LanguageProvider` (`LanguageContext.tsx`, lines 1104–1127).
  - **Deficiency 1**: No cookie synchronization. Server-rendered Next.js HTML defaults to English, causing client hydration re-renders when `localStorage` is read.
  - **Deficiency 2**: Static HTML attribute: `apps/web/src/app/layout.tsx` (line 28) has `<html lang="en">` hardcoded; it never updates when language changes.
  - **Deficiency 3**: URL routing is locale-agnostic (no locale prefix `/hi/...`).

### 1.3 Complete Inventory of Untranslated Strings & Missing Keys
Across the 8 UI files, **94+ strings** are currently hardcoded in English without dictionary lookups:

#### A. `apps/web/src/components/Navbar.tsx` (3 items)
- Line 39: `Direct Agrarian Network` (sub-brand tagline)
- Line 97: `Select Language / भाषा` (dropdown header)
- Lines 213, 221, 229: Mobile menu badge pills `Direct`, `RFQ`, `Fleet`

#### B. `apps/web/src/components/InquiryModal.tsx` (4 items)
- Line 75: `Our regional dispatch coordinator will verify the provided details and connect via phone within 2 business hours.` (success subtext)
- Line 98: `placeholder="e.g. Ramesh Kumar / AgriCorp Pvt Ltd"`
- Line 116: `placeholder="10-digit mobile number"`
- Line 173: `placeholder="Specify commodity volume, delivery district, or warehousing inquiry..."`

#### C. `apps/web/src/app/page.tsx` (Overview, Market & Advisory) (15 items)
- Lines 263–265: `Direct harvest declaration, APMC mandi forecast models, and WDRA deposit receipts.`
- Line 268: `Open Farmer Desk`
- Lines 284–286: `Institutional RFQ bids, certified quality assay reports, and T+1 escrow settlement.`
- Line 289: `Open Procurement Desk`
- Lines 305–307: `Capacitated VRP vehicle routing, waypoint sequencing, and multi-depot consolidation.`
- Line 310: `Open Route Optimizer`
- Line 456: `Grade {lot.grade}` (literal prefix "Grade")
- Line 496: `RFQ` (action button)
- Line 536: `Standard: AGMARK Grade A1/A2/B/C`
- Line 557: `Guaranteed: 100% MSP Floor Enforcement`
- Line 578: `Telemetry: Cold storage ambient sensors`
- Line 599: `Access: Toll-Free IVR in 6 Indian languages`
- Line 620: `Legacy Supply Chain` (badge)
- Line 644: `Direct Transparent Network` (badge)
- Line 741: `Read more about our cause and institutional trust pillars`

#### D. `apps/web/src/app/about/page.tsx` (About Us & Institutional Cause) (15 items)
- Line 44: `Institutional Trust & Regulatory Architecture` (hero badge)
- Line 60: `The Core Cause` (badge)
- Line 79: `Average Farmer Income Gain`
- Line 87: `Statutory MSP Floor Adherence`
- Line 95: `Escrow Direct Bank Settlement`
- Line 103: `Speculative Broker Cut`
- Line 115: `Uncompromising Standards` (badge)
- Line 141: `AGMARK & FSSAI Compliant`
- Line 160: `WDRA Accredited Partner Warehouses`
- Line 179: `Zero Downside Price Guardrail`
- Line 198: `RBI Regulated Node Escrow`
- Line 217: `Cryptographic Batch Audit Trail`
- Line 228: `Public Trust Registry`
- Line 244: `placeholder="Enter Depot ID or Lot ID (e.g. FL-RJ-0482)"`
- Lines 277, 280, 283: Governance badges `✓ No proprietary book trading`, `✓ No hidden weighing charges`, `✓ Transparent 1% platform escrow fee`

#### E. `apps/web/src/app/farmer/page.tsx` (Farmer Portal) (25 items)
- Line 103: Notice template `` `Lot ${newLot.id} published to verified buyers at ₹${price}/kg!` ``
- Line 116: Breadcrumb `Overview`
- Line 118: Breadcrumb `Farmer Command Center`
- Line 121: `Direct crop declaration, real-time APMC price forecasting, and WDRA warehouse receipt management.`
- Line 131: `Verified Grower Profile #FL-FPO-410`
- Line 152: `Algorithmic Price & Demand Forecast`
- Line 155: `Trained on historical APMC mandi arrival records`
- Line 166: `title="Refresh Forecast"`
- Line 176: `Current Modal`
- Line 180: `AI Predicted`
- Line 184: `Demand Signal`
- Line 209: `Directly list harvested crop lots for verified institutional buyers or request warehouse intake.`
- Line 219: `Crop Commodity`
- Lines 225–228: Options `Tomato (Hybrid)`, `Mustard / Rapeseed`, `Wheat (Sharbati)`, `Soybean (Yellow)`
- Line 233: `Quality Inspection Tier`
- Lines 239–241: Options `Grade A1 (Premium Export / Certified)`, `Grade A2 (Standard Wholesale)`, `Grade B (Processing Grade)`
- Line 246: `Quantity (kg)`
- Line 259: `Expected Price (₹ / kg)`
- Line 278: `Publish Produce Lot`
- Line 291: `{listings.length} lots`
- Line 322: `WDRA Warehousing Grid`
- Line 325: `e-NWR Working Capital Pledge`
- Line 328: `Store non-perishable lots in accredited depots to unlock up to 50% instant liquidity via partner bank escrows at 7% p.a.`
- Line 334: `Apply for e-NWR Pledge`

#### F. `apps/web/src/app/buyer/page.tsx` (Bulk Buyer & Vendor Desk) (21 items)
- Line 70: Notice template `` `Bid ${newRfq.id} of ₹${offerPrice}/kg submitted directly to grower cluster!` ``
- Line 83: Breadcrumb `Overview`
- Line 85: Breadcrumb `Bulk Buyer & Vendor Hub`
- Line 94: `Direct institutional procurement with standardized grading, RFQ negotiation, and bank escrow settlement.`
- Line 98: `Verified Enterprise Buyer #BYR-DL-802`
- Line 115: `Initiate bulk counter-bid on assayed produce lots.`
- Line 120: `Target Crop Lot`
- Lines 126–129: Dropdown produce lots ("LOT-RJ-8401 (Tomato Grade A1 - 4,200 kg)", etc.)
- Line 134: `Target Volume (kg)`
- Line 147: `Offer Rate (₹ / kg)`
- Line 165: `Transmit Bulk RFQ`
- Line 175: `Active Procurement Negotiations`
- Line 176: `{rfqs.length} active negotiations`
- Line 197: `Grower Cluster:`
- Line 198: `Volume:`
- Line 207: `Asking: ₹{rfq.askingRate}/kg · Your Bid:`
- Line 213: `Awaiting FPO consensus`
- Line 214: `Release Escrow Advance`
- Line 225: `Guaranteed Institutional Escrow (T+1 Settlement)`
- Line 232: `All confirmed bulk contracts lock purchase consideration into an RBI-regulated banking escrow...`

#### G. `apps/web/src/app/logistics/page.tsx` (Logistics & Fleet Command) (24 items)
- Line 53: Notice template `` `Vehicle #${vehicle}-7401 successfully dispatched with optimized routing manifest! Driver notified via SMS.` ``
- Line 66: Breadcrumb `Overview`
- Line 68: Breadcrumb `Logistics & Fleet Command`
- Line 74: `Capacitated Vehicle Routing Problem (VRP) engine for agrarian cluster pickups and warehouse consolidation.`
- Line 81: `OR-Tools Heuristic Optimizer Active`
- Line 97: `Vehicle Class & Capacity`
- Line 98: `Select fleet asset to recalibrate load constraints.`
- Lines 102–105: Vehicle options:
  - `Two-Wheeler (Moped/Cargo)`, `Max payload: 50 kg`
  - `Light Utility Pickup`, `Max payload: 200 kg`
  - `Refrigerated Delivery Van`, `Max payload: 1,000 kg`
  - `Heavy Commercial Truck`, `Max payload: 10,000 kg`
- Line 134: `Recompute VRP Matrix`
- Line 143: `Optimization Impact`
- Line 150: `Fuel Saved`, `Liters`
- Line 160: `CO₂ Averted`, `kg`
- Line 170: `Optimized Circuit:`, Line 174: `Sequential Baseline:`, Line 178: `Distance Cut:`
- Line 193: `Optimized Multi-Stop Waypoint Sequence`
- Line 196: `Depot Origin:`
- Line 202: `Est. Total Time: {routeResult.estimatedDurationMinutes} mins`
- Line 205: `Payload: {routeResult.totalPayloadKg} / {routeResult.capacityLimitKg} kg ({routeResult.capacityUtilizationPercent}%)`
- Line 213: `Vehicle Payload Utilization`
- Line 235: `Depot`, Line 237: `Fleet origin & return depot`
- Line 252: `Leg Distance:`, Line 253: `Cumulative Payload:`
- Line 266: `Dispatch Vehicle Manifest`

---

## 2. Logic Chain

1. **Premise**: Requirement R3 mandates 100% complete multilingual localization across all 6 regional languages (English, हिन्दी, ਪੰਜਾਬੀ, मराठी, తెలుగు, தமிழ்) with zero untranslated English strings or placeholder banners.
2. **Observation Step 1**: In `LanguageContext.tsx`, only 155 translation keys exist per language. These keys populate hero headlines, navbar titles, high-level advisory parameters, and top-level pillar descriptions.
3. **Observation Step 2**: Scanning the page implementations revealed that detailed forms, input placeholders, status tags, table headers, button labels, and operational toasts in `/farmer`, `/buyer`, `/logistics`, `/about`, and `InquiryModal` are written directly as hardcoded English literals in JSX.
4. **Deduction Step 3**: When an Indian farmer, buyer, or operator switches language to हिन्दी, ਪੰਜਾਬੀ, मराठी, తెలుగు, or தமிழ், the core transactional interfaces (the lot declaration form, RFQ bidding form, fleet dispatcher, accreditation search) remain predominantly English.
5. **Observation Step 4**: Fonts are restricted to Latin subsets (`subsets: ['latin']` in Geist), and `<html lang="en">` is static.
6. **Deduction Step 5**: Without Indic font family declarations, regional language characters render using system fallbacks which can clip diacritics and ligatures, reducing visual minimalism and readability.
7. **Conclusion Step 6**: Achieving full R3 compliance requires systematically extracting all ~94 hardcoded strings into structured dictionary keys, translating them accurately across all 6 languages, and wiring them into components with dynamic `lang` and font support.

---

## 3. Caveats

1. **Dynamic Backend Strings**: The API endpoints (`/api/ai/forecast` and `/api/ai/route-optimize`) generate dynamic English strings in `factors` (e.g. `"Historical time-lagged modal arrival volume analyzed across..."`). When rendered on client cards, these should either be parameterized dictionary keys or localized on the client.
2. **Proper Nouns & Commodity Names**: Geographic clusters (e.g., `"Phulera"`, `"Jaitpura"`, `"Malwa"`) and Depot license IDs (`"FL-RJ-0482"`) are proper nouns; they should remain phonetically transliterated or intact with numeral stability.
3. **Absence of Separate `/consumer` Route**: The consumer workflow is currently integrated into the Marketplace section on the home page (`/#marketplace`). If a separate `/consumer` route is required later, it can reuse the marketplace dictionary keys.

---

## 4. Conclusion

The application possesses a solid minimalist visual design and a working custom React i18n context that supports switching between the 6 target languages. However, the current localization coverage is approximately 62% complete due to **94 hardcoded UI strings** across portal workflows.

### Recommended 4-Step Remediation Plan:
1. **Dictionary Expansion**:
   - Expand `translations` in `apps/web/src/context/LanguageContext.tsx` from 155 keys to ~250 keys, adding structured sections:
     - `t.farmer`: labels, placeholders, commodity options, grades, metrics, buttons, toasts.
     - `t.buyer`: labels, placeholders, volume, counter-bid options, escrow info, toasts.
     - `t.logistics`: vehicle types, capacities, metrics, stop sequence, manifest buttons, toasts.
     - `t.about`: badges, statistics labels, verification widget, governance points.
     - `t.portal`: shared navigation buttons (`Open Farmer Desk`, `Open Procurement Desk`, `Open Route Optimizer`).
     - `t.common`: units (`/kg`, `km`, `Liters`, `lots`), breadcrumbs (`Overview`).
2. **Component Refactoring**:
   - Update `Navbar.tsx`, `InquiryModal.tsx`, `page.tsx`, `about/page.tsx`, `farmer/page.tsx`, `buyer/page.tsx`, and `logistics/page.tsx` to replace all hardcoded text with `t.*` lookups.
   - Use dynamic string interpolation for numbers and IDs (e.g. `t.farmer.lotPublished.replace('{id}', id).replace('{price}', price)`).
3. **HTML Attribute & Font Synchronization**:
   - In `apps/web/src/app/layout.tsx`, synchronize `<html lang={language}>` via client context or body state.
   - Add appropriate CSS font fallbacks in `globals.css` for Devanagari, Gurmukhi, Telugu, and Tamil.
4. **Persistence & Shared Sync**:
   - Mirror language selection into `document.cookie` (`farmlink_lang=...; path=/; max-age=31536000`) alongside `localStorage`.
   - Update `packages/shared/src/constants/index.ts` to export all 6 languages in `LANGS = ['en', 'hi', 'pa', 'mr', 'te', 'ta']` and synchronize `packages/shared/src/i18n` to prevent monorepo divergence.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Dictionary Key Integrity Check**:
   Run the verification script to verify key count and 100% parity across all 6 languages:
   ```powershell
   node .agents/teamwork/explorer_survey_3/detailed_inventory.js
   ```
   *Expected output*: `GRAND TOTAL HARDCODED STRINGS: 0` once implementer replaces literals.

2. **Next.js Production Build**:
   ```powershell
   cmd /c npx --yes pnpm --filter web build
   ```
   *Expected output*: TypeScript compilation finishes cleanly and all static routes (`/`, `/about`, `/buyer`, `/farmer`, `/logistics`) generate without errors.

3. **Shared Unit Tests**:
   ```powershell
   cmd /c npx --yes pnpm --filter @farmlink/shared test
   ```
   *Expected output*: All 7 test suites pass cleanly.

### 5.2 Invalidation Conditions
- Any occurrence of untranslated English text (e.g. "Select fleet asset", "Enter Depot ID", "Current Modal") when the user selects Hindi, Punjabi, Marathi, Telugu, or Tamil.
- Any crash due to missing translation keys (`undefined` property access) in any of the 6 languages.
- Any TypeScript compilation error during `next build`.
