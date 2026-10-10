# Master Plan — FarmLink Overhaul Project

## Objective
Coordinate the complete overhaul of FarmLink as specified in `ORIGINAL_REQUEST.md`:
1. Comprehensive website crawl & error remediation across all portals (Farmer, Vendor, Consumer, Market, Advisory, About Us) with 0 broken links, 0 unhandled promise rejections, 0 missing assets, and verified state persistence.
2. AI & ML pipeline training and integration:
   - Price & Demand Forecast model trained on `Agriculture_price_dataset.csv`, test MAE verified, served via Next.js API endpoints.
   - Logistics & Route Optimizer (VRP with vehicle capacity constraints and distance matrices).
   - Produce Quality Assessment and Storage Shelf-Life Decay models/heuristics integrated.
   - Type-safe JSON API responses with robust fallbacks.
3. Readability, Minimalism UI, and 100% complete Multilingual Localization across English, हिन्दी, ਪੰਜਾਬੀ, मराठी, తెలుగు, தமிழ்.
4. Clean production build (`next build`, TypeScript compilation, linting) with 0 errors and 0 warnings, all tests passing.

## Phases
### Phase 0: Full Codebase Survey (3 Parallel Explorers)
- Explorer 1: Project structure, routing, Next.js architecture, state management, package dependencies.
- Explorer 2: Existing AI/ML scripts/models, `Agriculture_price_dataset.csv`, logistics/VRP, shelf-life and grading modules.
- Explorer 3: UI components, localization setup (locales, dictionaries), and portal workflows across Farmer, Vendor, Consumer, Market, Advisory, About Us.
- Deliverable: Consolidated `PROJECT.md` with full Architecture, Feature Inventory, Milestones, and Interface Contracts.

### Phase 1: Dual Track — E2E Test Suite & Infra
- Requirements-driven test runner, covering all 4 tiers:
  - Tier 1: Feature coverage
  - Tier 2: Boundary & corner cases
  - Tier 3: Cross-feature combinations
  - Tier 4: Real-world user journeys
- Publishes `TEST_READY.md`.

### Phase 2: AI & ML Pipeline Training & Next.js API Integration
- Train Price & Demand forecast model on `Agriculture_price_dataset.csv`, evaluate test MAE, serialize/export model.
- Implement Vehicle Routing Problem (VRP) solver with capacity constraints and distance matrices.
- Implement Produce Quality Grading & Storage Shelf-Life decay heuristics.
- Expose all via Next.js API routes with structured type-safe JSON and fallback handling.

### Phase 3: Website Crawl & Error Remediation
- Automated crawl of all routes.
- Fix broken links, unhandled rejections, state persistence for produce listing, order creation, RFQ negotiation, price calculation, warehousing intake.

### Phase 4: UI Minimalism & 100% 6-Language Localization
- Minimalist design, clean typography, responsive layout across all portals.
- 100% translation coverage for English, Hindi, Punjabi, Marathi, Telugu, Tamil without missing keys or hardcoded English strings.

### Phase 5: Verification, Production Build & Integrity Audit
- Run and pass all unit and E2E tests (100% pass rate).
- Production build (`next build`, `npm run lint`, `tsc`) with 0 errors and 0 warnings.
- Independent Forensic Audit (`teamwork_preview_auditor`) verifying zero cheating/mocking.
- Final completion handoff to Sentinel.
