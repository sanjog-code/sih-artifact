# Architectural Survey & Codebase Audit Report

## 1. Observation

### 1.1 Project Structure & Workspace Configuration
- **Root Directory**: `C:\Users\amans\.gemini\antigravity\scratch\sih-artifact`
- **Monorepo Manager**: `pnpm@12.4.1` with workspace definition in `pnpm-workspace.yaml` containing:
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```
- **Monorepo Members**:
  - `apps/web`: Next.js frontend (`name: "web"`, version `0.1.0`)
  - `apps/api`: NestJS backend (`name: "@farmlink/api"`, version `0.1.0`)
  - `packages/shared`: Shared types, Zod schemas, domain rules, i18n (`name: "@farmlink/shared"`, version `0.1.0`)
- **Supplementary Scratch Repository**:
  - `C:\Users\amans\.gemini\antigravity\scratch\FarmLink-AI` containing:
    - `ai/Agriculture_price_dataset.csv` (55,212,516 bytes, historical APMC mandi arrivals)
    - `ai/demand_model.pkl` (124,021,290 bytes, serialized scikit-learn model)
    - `ai/train_model.py` and `ai/predict_demand.py`
    - `ai/models/route_optimization/optimize_farm_route.py` (Google OR-Tools solver)
    - `frontend/consumer.html` and `frontend/vendor.html` (legacy vanilla HTML/JS prototypes)

### 1.2 Frontend Framework, Routing Tree & Portal Inventory (`apps/web`)
- **Framework & Dependencies** (`apps/web/package.json`):
  - Next.js: `16.3.5` (Canary / Next 16 with Turbopack)
  - React / React-DOM: `19.2.8`
  - Tailwind CSS: `^4.0.0` (configured via `@tailwindcss/postcss` in `postcss.config.mjs` and `@import "tailwindcss";` in `src/app/globals.css`)
  - Lucide React: `^1.54.0`
  - TypeScript: `^5.0.0`
- **Router Paradigm**: Next.js App Router located under `apps/web/src/app`.
- **Layout**: `apps/web/src/app/layout.tsx` wraps the app in Geist sans/mono fonts and `LanguageProvider` (`../context/LanguageContext`).
- **Route Inventory**:
  | Route | File Path | Component Type | Status & Functional Scope |
  |---|---|---|---|
  | `/` | `apps/web/src/app/page.tsx` | Client Component (`'use client'`) | Overview landing page containing Hero, Price Advisory (`#advisory`), Marketplace (`#marketplace`), 4 Pillars Architecture (`#architecture`), and Economic Comparison. |
  | `/about` | `apps/web/src/app/about/page.tsx` | Client Component (`'use client'`) | Institutional Cause & Trust page containing Core Cause, 5 Trust Pillars, Live Public Accreditation Verification Terminal, and Zero-Commission Pledge. |
  | `/farmer` | `apps/web/src/app/farmer/page.tsx` | Client Component (`'use client'`) | Farmer Command Center containing Direct Crop Lot Declaration form, Live AI Market Forecast card, Active Lots listing, and e-NWR pledge banner. |
  | `/buyer` | `apps/web/src/app/buyer/page.tsx` | Client Component (`'use client'`) | Bulk Buyer & Vendor Hub containing Bulk RFQ submission form, Active RFQ negotiations list, and Settlement Desk. |
  | `/logistics` | `apps/web/src/app/logistics/page.tsx` | Client Component (`'use client'`) | Logistics Command containing Capacitated Vehicle Routing Problem (VRP) fleet selector, waypoint sequence manifest, and carbon/fuel impact metrics. |
  | `/api/ai/forecast` | `apps/web/src/app/api/ai/forecast/route.ts` | Route Handler (Server) | GET endpoint returning simulated modal price forecasts, MSP floors, shelf-life days remaining, and demand signals based on `MARKET_BENCHMARKS` dictionary. |
  | `/api/ai/route-optimize` | `apps/web/src/app/api/ai/route-optimize/route.ts` | Route Handler (Server) | POST endpoint calculating Haversine distance and running a Nearest-Neighbor + 2-Opt heuristic vehicle routing sequence. |
- **Portal Gap Analysis**:
  - **Consumer Portal**: Missing from `apps/web`. An unmigrated legacy prototype exists at `FarmLink-AI/frontend/consumer.html`.
  - **Vendor Portal**: Shared under `/buyer` ("Bulk Buyer & Vendor Hub"), but no dedicated `/vendor` route exists and no vendor link exists in navigation.
  - **Market & Advisory Portals**: Present only as anchor sections on the root page (`/#marketplace`, `/#advisory`) rather than dedicated standalone portal routes.
  - **Admin / Warehouse Portal**: No frontend route exists in `apps/web` (though `apps/api` has `src/modules/admin` and `src/modules/warehouse`). The navbar links `/#architecture` under the label "Warehousing & e-NWR".
  - **Navbar Navigation Gaps** (`apps/web/src/components/Navbar.tsx`):
    - Navbar only links to `/`, `/#marketplace`, `/#advisory`, `/#architecture`, and `/about`.
    - Routes `/farmer`, `/buyer`, and `/logistics` are completely orphaned from the top navigation bar and mobile drawer.
    - The "Access Portal" / "Portal Login" button calls `onOpenInquiry()` to open `InquiryModal.tsx` rather than directing users to Farmer/Buyer/Logistics portals.

### 1.3 State Management & Data Persistence Gaps
- **Client State**:
  - In `apps/web/src/app/page.tsx`: `PRODUCE_CATALOGUE` is a static in-memory array of 4 items (`LOT-RJ-8401` to `LOT-MH-6204`). Buying an item (`handleLotOrder`) merely sets a transient string `cartSuccessNotice` for 4.5 seconds.
  - In `apps/web/src/app/farmer/page.tsx`: Listings are initialized in a React `useState` array (`LST-8901`, `LST-8902`). Creating a lot appends to local component state. Upon page refresh or navigation, all newly declared produce lots are lost.
  - In `apps/web/src/app/buyer/page.tsx`: RFQs are initialized in a React `useState` array (`RFQ-7101`, `RFQ-7102`). Submitting an RFQ appends to local state. Upon page refresh, all newly submitted bids are lost.
  - In `apps/web/src/app/logistics/page.tsx`: Route calculation fetches from `/api/ai/route-optimize` and stores output in local `routeResult` state. Dispatches are ephemeral notices (`dispatchNotice`).
- **Persistence Mechanisms**:
  - `localStorage`: Only used in `apps/web/src/context/LanguageContext.tsx` to store `farmlink_lang`.
  - There is zero persistent state storage (neither `localStorage`, `sessionStorage`, IndexedDB, SQLite, nor REST integration with `apps/api`) for produce listings, orders, RFQs, price calculation history, or warehouse intake.
- **Backend Disconnect**:
  - `apps/api` runs on NestJS with a Prisma schema defining `ProduceLot`, `Order`, `Rfq`, `EscrowPayment`, `WarehouseReceipt`, `Route`, etc.
  - `apps/web` has zero client integration or proxy calls to `apps/api`. All interactions either operate in local component memory or call the two local Next.js API routes (`/api/ai/forecast` and `/api/ai/route-optimize`).

### 1.4 Internationalization (i18n) & Runtime Crash Bug
- **Implementation**: `apps/web/src/context/LanguageContext.tsx` supports 6 language codes: `en` (English), `hi` (Hindi), `pa` (Punjabi), `mr` (Marathi), `te` (Telugu), `ta` (Tamil).
- **Critical Runtime Crash Bug**:
  - `translations.en` defines keys for sub-portals at lines 194-206:
    ```ts
    farmer: {
      dashboard: 'Farmer Command & Lot Advisory',
      declare: 'Direct Produce Lot Declaration',
      lots: 'My Active Produce Lots',
    },
    buyer: {
      dashboard: 'Bulk Institutional Procurement Hub',
      rfq: 'Submit Bulk Purchase Offer (RFQ)',
    },
    logistics: {
      routes: 'Logistics & Dynamic Route Optimization',
    },
    ```
  - In languages `hi`, `pa`, `mr`, `te`, and `ta`, these keys are completely missing from the translation objects (e.g. `translations.hi` closes at line 376 after `modal`).
  - Line 1114 defines:
    ```ts
    const currentDict = (translations[language] || translations.en) as TranslationDictionary;
    ```
  - When `language` is `'hi'`, `translations['hi']` is truthy, so `currentDict` is set to `translations['hi']`. Because `currentDict.farmer` is `undefined`, navigating to `/farmer` triggers an unhandled runtime error:
    ```
    TypeError: Cannot read properties of undefined (reading 'dashboard')
    ```
  - Similarly, `/buyer` crashes on `t.buyer.dashboard` and `/logistics` crashes on `t.logistics.routes` whenever the user switches away from English.
  - Furthermore, extensive UI strings on `/farmer`, `/buyer`, and `/logistics` (labels, buttons, telemetry descriptions) are hardcoded in English, violating R3 (100% complete multilingual localization).

### 1.5 Build Tooling, Linter, and Test Status
- **TypeScript (`tsc`)**:
  - `apps/web`: `cmd /c "cd apps\web && npx tsc --noEmit"` exited with code 0 (Pass).
  - `packages/shared`: `cmd /c "cd packages\shared && npx tsc --noEmit"` exited with code 0 (Pass).
  - `apps/api`: `cmd /c "cd apps\api && npx tsc -p tsconfig.build.json --noEmit"` exited with code 0 after executing `npx prisma generate` (Pass).
- **Next.js Production Build**:
  - `cmd /c "cd apps\web && npx next build"` compiled successfully in 554ms with Turbopack, generating 8 routes (Pass).
- **ESLint**:
  - `cmd /c "cd apps\web && npx eslint . --quiet"` exited with code 1, reporting 6 errors:
    1. `src/app/farmer/page.tsx:46:40` - `@typescript-eslint/no-explicit-any`: Unexpected `any` on `aiData`.
    2. `src/app/farmer/page.tsx:85:5` - `react-hooks/set-state-in-effect`: Synchronous `setState` inside `useEffect` calling `fetchAiAdvisory(commodity)`.
    3. `src/app/logistics/page.tsx:28:50` - `@typescript-eslint/no-explicit-any`: Unexpected `any` on `routeResult`.
    4. `src/app/logistics/page.tsx:49:5` - `react-hooks/set-state-in-effect`: Synchronous `setState` inside `useEffect` calling `calculateRoute(vehicle)`.
    5. `src/app/logistics/page.tsx:109:55` - `@typescript-eslint/no-explicit-any`: Unexpected `any` on `v.id as any`.
    6. `src/app/logistics/page.tsx:241:57` - `@typescript-eslint/no-explicit-any`: Unexpected `any`.
  - Plus 15 warnings for unused imports (`AlertCircle`, `Clock`, `TrendingDown`, etc.).
- **Automated Tests**:
  - `packages/shared`: `npx jest` passed all 7 suites and 32 unit tests.
  - `apps/web`: Zero automated tests exist (no test script configured).
  - `apps/api`: Jest is configured, but 0 `.spec.ts` files exist, causing `jest` to exit with code 1 ("No tests found").

---

## 2. Logic Chain

1. **Premise 1 (R1 & Acceptance Criteria)**: The project requirements demand that every route, page, and interactive component across FarmLink portals (Farmer, Vendor, Consumer, Market, Advisory, About Us) must execute without broken endpoints, console errors, or mock fallbacks, with real state persistence.
2. **Premise 2 (Observations 1.2 & 1.3)**: Inspection of `apps/web/src/app` confirms that produce listing on `/farmer`, order creation on `/`, and RFQ submission on `/buyer` rely exclusively on ephemeral React `useState`. Reloading the page or navigating between routes discards all user actions. There is no active client-side database, `localStorage` store, or backend synchronization.
3. **Premise 3 (Observation 1.4)**: In `LanguageContext.tsx`, `translations.en` defines `farmer`, `buyer`, and `logistics` sub-objects, but `translations.hi`, `translations.pa`, `translations.mr`, `translations.te`, and `translations.ta` do not. Since `currentDict` assigns the active language dictionary without deep fallback merging against `translations.en`, accessing `t.farmer.dashboard`, `t.buyer.dashboard`, or `t.logistics.routes` in any non-English language triggers an unhandled `TypeError: Cannot read properties of undefined`.
4. **Premise 4 (Observation 1.5)**: Running `npx eslint .` on `apps/web` fails with 6 errors due to explicit `any` usages and React 19 / Next 16 compiler hook warnings (`react-hooks/set-state-in-effect`).
5. **Premise 5 (Observation 1.1 & 1.2)**: `FarmLink-AI/ai` contains the full historical dataset (`Agriculture_price_dataset.csv`, 55MB) and the Python OR-Tools VRP model (`optimize_farm_route.py`). However, Next.js routes `/api/ai/forecast` and `/api/ai/route-optimize` currently use static dictionary lookups and custom TypeScript distance heuristics rather than the verified ML training artifacts.
6. **Inference**: Therefore, achieving full compliance with the original request requires a coordinated multi-phase remediation strategy:
   - A unified reactive persistence adapter (client-side storage engine) to ensure real state persistence for listings, orders, RFQs, and warehouse receipts.
   - Comprehensive dictionary completion and safe deep-merge fallback in `LanguageContext.tsx` to eliminate runtime crashes and provide 100% translations across all 6 languages.
   - Dedicated portal routes for Consumer and Vendor (or clear navigation linking Buyer/Vendor, Consumer, Market, Advisory).
   - ESLint cleanup eliminating all 6 errors and 15 warnings.
   - Integrating verified AI/ML pipelines with regression models trained on `Agriculture_price_dataset.csv` and calibrated VRP solver logic.

---

## 3. Caveats

- **Scope Boundary**: As a read-only exploration agent, no modifications were made to any application code, tests, or configurations.
- **Backend Service State**: `apps/api` requires a running PostgreSQL database and Redis instance to start in development mode; its runtime behavior was evaluated via static inspection and TypeScript compilation (`npx tsc`).
- **Python Environment**: The Python scripts in `FarmLink-AI/ai` require Python packages (`scikit-learn`, `pandas`, `ortools`, `joblib`). Their standalone execution was not invoked during this survey turn.

---

## 4. Conclusion

The FarmLink Next.js web application possesses a modern, high-performance foundation (Next.js 16.3.5, React 19, Tailwind CSS v4) with clean typography and aesthetic presentation. However, critical architectural gaps prevent it from meeting production acceptance criteria:
1. **Critical Runtime Crash**: Non-English language selection on `/farmer`, `/buyer`, and `/logistics` causes immediate fatal unhandled promise/render crashes due to missing dictionary keys in `LanguageContext.tsx`.
2. **Missing State Persistence**: All interactive transaction flows (produce listing, order creation, RFQ negotiation) operate in volatile component state and are wiped on refresh.
3. **Portal Gaps**: Consumer portal is absent from the Next.js app; Vendor is collapsed under Buyer; Market and Advisory exist only as homepage anchors; portals are missing from the top navigation bar.
4. **Linter Failures**: ESLint reports 6 errors and 15 warnings in `apps/web`.
5. **Disconnected AI/ML Pipeline**: Rich training assets in `FarmLink-AI/ai` are not yet unified or validated against the Next.js API endpoints.

### Recommended Remediation Strategy

| Phase | Target Area | Concrete Actions |
|---|---|---|
| **Phase 1: i18n & Crash Remediation** | `LanguageContext.tsx` | 1. Implement a safe fallback merger so missing keys automatically fall back to `translations.en`.<br>2. Add complete translations for `farmer`, `buyer`, `logistics`, `market`, `advisory`, and `warehouse` across all 6 regional languages (Hindi, Punjabi, Marathi, Telugu, Tamil).<br>3. Replace all remaining hardcoded English strings in portal pages. |
| **Phase 2: Navigation & Portal Unification** | `Navbar.tsx`, `apps/web/src/app` | 1. Update `Navbar.tsx` desktop and mobile menus to link directly to Farmer Hub (`/farmer`), Buyer & Vendor Desk (`/buyer`), Logistics (`/logistics`), Marketplace, Advisory, and About Us.<br>2. Add dedicated `/consumer` portal (migrating from `FarmLink-AI/frontend/consumer.html`) or establish clear multi-persona landing links.<br>3. Connect "Portal Login" directly to persona selection or authenticated desks. |
| **Phase 3: State Persistence Engine** | `apps/web/src/lib/store` | 1. Implement a robust client-side persistence store (using `localStorage` with reactive listeners or lightweight store) storing:<br>   - Produce Lots (`ProduceListingStore` initialized with seed catalogue, updated by farmer declaration).<br>   - Orders & RFQ negotiations (`OrderStore` and `RfqStore` tracking bids, status changes, and escrow hold).<br>   - Warehouse intake & e-NWR pledges.<br>2. Wire up `/farmer`, `/buyer`, `/`, and `/logistics` so all listings and bids persist and reactively synchronize across tabs and reloads. |
| **Phase 4: ESLint & Build Sanitation** | `apps/web/src/app/**` | 1. Fix `src/app/farmer/page.tsx` and `src/app/logistics/page.tsx` to resolve `react-hooks/set-state-in-effect` (refactor data fetching with proper async lifecycle or microtask separation).<br>2. Replace all `any` types with explicit TypeScript interfaces (`AiForecastResult`, `RouteOptimizationResult`, `VehicleClass`).<br>3. Clean up all 15 unused import warnings. |
| **Phase 5: AI & ML Integration** | `/api/ai/**`, `FarmLink-AI/ai` | 1. Verify model training metrics (test MAE) on `Agriculture_price_dataset.csv`.<br>2. Calibrate Next.js `/api/ai/forecast` with verified modal price regression weights and perishability decay curves.<br>3. Calibrate `/api/ai/route-optimize` capacity constraints and distance matrices with verified OR-Tools outputs.<br>4. Implement optical produce grading estimation heuristic in shared rules. |
| **Phase 6: Verification & Test Automation** | `test/`, `apps/web` | 1. Add unit and component tests verifying i18n fallback safety, lot persistence, order flow, and RFQ negotiation.<br>2. Verify production build passes cleanly (`npx next build && npx eslint .`). |

---

## 5. Verification Method

To independently reproduce and verify all observations documented in this report:

1. **Verify Next.js Production Build**:
   ```powershell
   cmd /c "cd apps\web && npx next build"
   ```
   *Expected Result*: Compiles successfully with Turbopack, reporting 8 routes.

2. **Verify ESLint Failures**:
   ```powershell
   cmd /c "cd apps\web && npx eslint . --quiet"
   ```
   *Expected Result*: Exits with code 1, reporting 6 errors (3 `no-explicit-any` and 2 `react-hooks/set-state-in-effect` in `farmer/page.tsx` and `logistics/page.tsx`).

3. **Verify LanguageContext Crash Bug**:
   Inspect `apps/web/src/context/LanguageContext.tsx`:
   - Search for `farmer:` inside the `hi:` translation object (starts at line 208).
   - Observe that `farmer`, `buyer`, and `logistics` do not exist in `hi`, `pa`, `mr`, `te`, or `ta`.
   - Inspect line 1114: `currentDict = (translations[language] || translations.en)`.
   - Verify that when `language === 'hi'`, `currentDict.farmer` is `undefined`, causing `t.farmer.dashboard` in `apps/web/src/app/farmer/page.tsx` line 118 to throw a `TypeError`.

4. **Verify State Persistence Gap**:
   - Inspect `apps/web/src/app/farmer/page.tsx` lines 50-69 (`useState<FarmerListing[]>`) and lines 88-102 (`handleCreateListing`).
   - Observe that `setListings([newLot, ...listings])` updates only component memory with no calls to `localStorage` or backend APIs.
   - Inspect `apps/web/src/app/buyer/page.tsx` lines 41-76 (`useState<RfqItem[]>`) and lines 62-76 (`handleSubmitRfq`).

5. **Verify Shared Package Test Health**:
   ```powershell
   cmd /c "cd packages\shared && npx jest"
   ```
   *Expected Result*: 7 suites passed, 32 tests passed.

6. **Verify Prisma Generate in API**:
   ```powershell
   cmd /c "cd apps\api && npx prisma generate && npx tsc -p tsconfig.build.json --noEmit"
   ```
   *Expected Result*: Exits with code 0 after Prisma Client generation.
