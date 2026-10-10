# Project: FarmLink Overhaul

## Architecture
- **Monorepo Framework**: Next.js 16.3.5 (App Router, Turbopack, React 19, Tailwind CSS v4) in `apps/web`.
- **Shared Domain & Types**: `@farmlink/shared` in `packages/shared`.
- **Backend Service (Reference/Prisma)**: NestJS in `apps/api`.
- **AI/ML Assets**: Historical APMC dataset `Agriculture_price_dataset.csv` (55MB, 737,392 rows), trained model weights, VRP solver, shelf-life and grading rules.
- **Portals**:
  - Landing, Marketplace & Advisory (`/`)
  - Farmer Command Center (`/farmer`)
  - Bulk Buyer & Vendor Hub (`/buyer`)
  - Logistics & Fleet Command (`/logistics`)
  - Consumer Portal (`/consumer`)
  - Institutional Cause & Trust (`/about`)
  - Next.js API Route Handlers: `/api/ai/forecast`, `/api/ai/route-optimize`, `/api/ai/grading`, `/api/ai/shelf-life`.
- **Data Flow & Persistence**:
  - Reactive Client State Persistence Engine (`apps/web/src/lib/store/`) with localStorage synchronization, event broadcasting, and seed catalogue.
  - Type-safe Zod validation in `@farmlink/shared/src/schemas/ai.ts`.
  - In-process Next.js ML model serving with hierarchical fallback cascade.
- **Localization**:
  - 6 Indian languages: English (`en`), हिन्दी (`hi`), ਪੰਜਾਬੀ (`pa`), मराठी (`mr`), తెలుగు (`te`), தமிழ் (`ta`).
  - Deep-merge fallback resolution in `LanguageContext.tsx` ensuring zero runtime undefined errors.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Navigation & Portal Unification | Unify Navbar/Drawer with direct links to Farmer, Buyer, Logistics, Consumer, Marketplace, Advisory, About Us; dedicated /consumer route | M1 | Survey 1 |
| F02 | Reactive State Persistence Engine | Client-side reactive persistence store for produce listings, orders, RFQs, and warehouse receipts across sessions and refreshes | M1 | Survey 1 |
| F03 | Price & Demand Forecast Model & API | Train time-series regression on Agriculture_price_dataset.csv, verify test MAE (Wheat ₹0.33/kg, Potato ₹0.64/kg, etc.), export model and serve /api/ai/forecast with 5-tier fallback | M2 | Survey 2 |
| F04 | Capacitated VRP Route Optimizer & API | In-process Clarke-Wright + 2-Opt solver in /api/ai/route-optimize supporting fleet capacities, distance matrices, multi-tour partitioning, and fuel/carbon metrics | M2 | Survey 2 |
| F05 | Produce Quality Grading API | AGMARK optical grading heuristics (A1, A2, B, C, Reject) based on defect weights and surface area in /api/ai/grading | M2 | Survey 2 |
| F06 | Storage Shelf-Life Decay API | Arrhenius kinetic perishability model with VPD humidity adjustments and dynamic markdowns in /api/ai/shelf-life | M2 | Survey 2 |
| F07 | Type-Safe JSON Schemas for AI APIs | Zod schemas and TypeScript interfaces for all AI requests/responses with zero `any` types in @farmlink/shared | M2 | Survey 2 |
| F08 | 100% 6-Language Localization | Expand dictionaries to ~250 keys across all 6 languages (en, hi, pa, mr, te, ta), deep-fallback resolution, replace all 94 hardcoded English strings | M3 | Survey 3 |
| F09 | UI Readability & Indic Fonts | Clean terminal minimalism, tabular monospace data, responsive layouts, Indic font fallbacks for Devanagari, Gurmukhi, Telugu, Tamil | M3 | Survey 3 |
| F10 | ESLint & Production Build Sanitization | Fix all 6 ESLint errors in farmer/page.tsx and logistics/page.tsx, remove 15 unused import warnings, clean next build | M4 | Survey 1 |
| F11 | Automated Website Crawl & Error Audit | Automated crawler testing all routes with 0 broken links, 0 console errors, 0 missing assets, real state persistence verification | M4 | Survey 1 |
| F12 | Opaque-Box E2E Testing Suite (Tiers 1-4) | Comprehensive requirement-driven test suite with 4 tiers verifying feature coverage, boundaries, combinations, and realistic workloads | M_TEST | Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M_TEST | E2E Testing Track | Independent opaque-box test runner & Tiers 1-4 test cases; publishes TEST_READY.md | none | DONE |
| M1 | Architecture, Portals & State Engine | Navigation links, /consumer portal route, reactive persistence store (listings, orders, RFQs) | none | DONE |
| M2 | AI & ML Pipelines & Serving Endpoints | Model training on CSV (test MAE verification), VRP solver, grading, shelf-life, Next.js API routes & Zod schemas | none | DONE |
| M3 | UI Readability & 100% Localization | Indic font fallbacks, dictionary expansion, replace 94 hardcoded strings across all 6 languages, zero untranslated UI | M1 | DONE |
| M4 | Final Integration, Build & Audit | ESLint fixes, next build (0 errors, 0 warnings), pass 100% E2E tests, crawl audit, forensic integrity audit | M1, M2, M3, M_TEST | IN_PROGRESS |

## Interface Contracts

### AI API Contracts (`packages/shared/src/schemas/ai.ts`)
- `GET /api/ai/forecast?commodity=...&state=...&district=...&market=...`
  - Output: `{ success: true, commodity, state, district, market, currentModalPrice, predictedModalPrice, predictedChangePercent, confidenceScore, testMaeQuintal, testMaeKg, mspFloor, demandSignal, fairPriceRange: { min, max }, factors: string[], fallbackLevel: "EXACT_MARKET" | "DISTRICT_AGGREGATE" | "STATE_AGGREGATE" | "COMMODITY_BASELINE" | "NATIONAL_BASELINE" }`
- `POST /api/ai/route-optimize`
  - Input: `{ waypoints: [{ id, name, lat, lng, payloadKg, type }], vehicleClass: "TWO_WHEELER" | "CAR" | "VAN" | "TRUCK", distanceMatrix?: number[][], customCapacityKg?: number }`
  - Output: `{ success: true, vehicleClass, capacityLimitKg, totalPayloadKg, capacityUtilizationPercent, routes: [{ vehicleId, stops: [...], distanceKm, durationMinutes, payloadKg }], totalDistanceKm, baselineDistanceKm, distanceSavedKm, fuelSavedLiters, co2AvertedKg, isMultiVehicle: boolean }`
- `POST /api/ai/grading`
  - Input: `{ commodity: string, defects: [{ type: string, severity: number, areaPct: number }], lightingScore?: number }`
  - Output: `{ success: true, commodity, qualityScore: number, grade: "Grade A1" | "Grade A2" | "Grade B" | "Grade C" | "Reject", defectSummary: string[], suggestedDiscountPercent: number }`
- `GET/POST /api/ai/shelf-life`
  - Input: `{ commodity: string, currentQualityScore: number, storageDays: number, ambientTemperatureC: number, relativeHumidityPct: number }`
  - Output: `{ success: true, commodity, remainingShelfLifeDays: number, currentQualityRetainedPct: number, decayRatePerDay: number, dynamicMarkdownPercent: number, riskLevel: "OPTIMAL" | "MONITOR" | "EXPEDITE_SALE" | "DISPOSAL_RISK" }`

### Client Persistence Store Contract (`apps/web/src/lib/store/index.ts`)
- `ProduceStore`: `getListings()`, `addListing(lot)`, `subscribe(cb)`
- `OrderStore`: `getOrders()`, `placeOrder(order)`, `subscribe(cb)`
- `RfqStore`: `getRfqs()`, `submitRfq(rfq)`, `updateStatus(id, status)`, `subscribe(cb)`
- `WarehouseStore`: `getReceipts()`, `pledgeReceipt(receipt)`, `subscribe(cb)`
- All stores read from and write to `localStorage` under `farmlink_*` keys with broadcast updates across tabs.

## Code Layout
- `apps/web/src/app/`
  - `page.tsx` — Landing, Market & Advisory
  - `about/page.tsx` — Trust & Cause
  - `farmer/page.tsx` — Farmer Hub
  - `buyer/page.tsx` — Buyer & Vendor Hub
  - `logistics/page.tsx` — Logistics Command
  - `consumer/page.tsx` — Dedicated Consumer Marketplace
  - `api/ai/forecast/route.ts` — Price & Demand Forecast endpoint
  - `api/ai/route-optimize/route.ts` — VRP Route Optimization endpoint
  - `api/ai/grading/route.ts` — Produce Quality Grading endpoint
  - `api/ai/shelf-life/route.ts` — Storage Shelf-Life Decay endpoint
- `apps/web/src/lib/store/` — Reactive persistence stores
- `apps/web/src/lib/ai/` — VRP solver, ML model predictor, heuristics
- `apps/web/src/data/` — `mandi_forecast_model.json` (exported weights and benchmark index)
- `apps/web/src/context/LanguageContext.tsx` — 6-language dictionary and fallback provider
- `packages/shared/src/schemas/ai.ts` — Zod schemas and TypeScript types
- `test/e2e/` — Requirement-driven E2E test suite (Tiers 1-4)
