# Test Infrastructure Specification: FarmLink Comprehensive E2E Verification

## 1. Test Philosophy & Methodology

### 1.1 Opaque-Box & Requirement-Driven Philosophy
The FarmLink End-to-End (E2E) Test Suite adheres to strict **opaque-box, requirement-driven verification**. Tests treat the entire software platform—frontends, storage engines, algorithmic solvers, and API endpoints—as external black-box units adhering to interface contracts defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`.
- **Zero Facade Testing**: Every test exercises concrete functional code, data structures, and mathematical invariants. No assertions rely on tautologies (`assert(true)`), mock bypasses, or shallow stubs.
- **Authoritative Expected Outputs**: All expected numerical outputs, MAE thresholds, statutory MSP floors, and AGMARK classification boundaries are directly grounded in:
  1. Historical APMC transaction dataset `Agriculture_price_dataset.csv` (737,392 records across 1,598 mandis).
  2. Ministry of Agriculture & Farmers Welfare statutory Minimum Support Price (MSP) benchmarks (Wheat ₹22.75/kg, Mustard ₹56.50/kg, Soybean ₹46.00/kg).
  3. AGMARK optical quality defect classification standards and Arrhenius perishability kinetics.
  4. Capacitated Vehicle Routing Problem (CVRP) physical fleet constraints (50 kg to 10,000 kg).

### 1.2 4-Tier Test Architecture
Testing is structured across four progressive, orthogonal tiers:
- **Tier 1: Functional Feature Coverage**: Verifies primary happy-path behavior, contract adherence, and response schemas for all 11 core functional features (F01–F11). Threshold: $\ge 5$ tests per feature ($\ge 55$ tests).
- **Tier 2: Boundary & Corner Cases**: Exercises extreme input ranges, edge conditions, invalid parameters, storage quotas, and zero/negative bounds across all 11 features. Threshold: $\ge 5$ tests per feature ($\ge 55$ tests).
- **Tier 3: Cross-Feature Integration Pairs**: Validates multi-module state flows, contract handoffs, and bidirectional synchronization across decoupled subsystems (e.g., Forecast $\leftrightarrow$ Persistence, VRP $\leftrightarrow$ Fleet Capacity, Grading $\leftrightarrow$ Dynamic Markdown). Threshold: $\ge 12$ tests.
- **Tier 4: Real-World Application Scenarios**: Simulates end-to-end multi-step agricultural workflows modeled after real agrarian stakeholders (farmers, bulk procurers, warehouse managers, fleet dispatchers, and rural consumers). Threshold: $\ge 6$ tests.
- **Total Minimum Target**: $\ge 128$ comprehensive test cases.

---

## 2. Feature Inventory Mapping (F01 – F12)

| Feature ID | Feature Name | Description & Contract Anchor | Tier 1 Tests | Tier 2 Tests | Tier 3/4 Inclusion |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **F01** | Navigation & Portal Unification | Unify Navbar/Drawer with direct links to Farmer, Buyer, Logistics, Consumer, Marketplace, Advisory, About Us; dedicated `/consumer` route | 5 | 5 | Yes |
| **F02** | Reactive State Persistence Engine | Client-side reactive persistence store for produce listings, orders, RFQs, and warehouse receipts across sessions and reloads | 5 | 5 | Yes |
| **F03** | Price & Demand Forecast Model & API | Regression model on APMC data, verified test MAE (Wheat ₹0.33/kg, Potato ₹0.64/kg), `/api/ai/forecast` with 5-tier fallback cascade & MSP floors | 5 | 5 | Yes |
| **F04** | Capacitated VRP Route Optimizer & API | In-process Clarke-Wright + 2-Opt solver in `/api/ai/route-optimize` supporting fleet capacities (50kg–10,000kg), distance matrices, multi-vehicle partitioning, fuel/CO2 | 5 | 5 | Yes |
| **F05** | Produce Quality Grading API | AGMARK optical grading heuristics (A1, A2, B, C, Reject) based on defect weights and surface area in `/api/ai/grading` | 5 | 5 | Yes |
| **F06** | Storage Shelf-Life Decay API | Arrhenius kinetic perishability model with VPD humidity adjustments and dynamic markdowns in `/api/ai/shelf-life` | 5 | 5 | Yes |
| **F07** | Type-Safe JSON Schemas for AI APIs | Zod schemas and TypeScript interfaces for all AI requests/responses with zero `any` types in `@farmlink/shared` | 5 | 5 | Yes |
| **F08** | 100% 6-Language Localization | Expand dictionaries across 6 languages (en, hi, pa, mr, te, ta), deep-fallback resolution, zero untranslated UI strings | 5 | 5 | Yes |
| **F09** | UI Readability & Indic Fonts | Clean terminal minimalism, tabular monospace data, responsive layouts, Indic font fallbacks for Devanagari, Gurmukhi, Telugu, Tamil | 5 | 5 | Yes |
| **F10** | ESLint & Build Sanitization | Fix ESLint errors, remove unused warnings, verify clean code hygiene, zero banned hackathon terms | 5 | 5 | Yes |
| **F11** | Automated Website Crawl & Error Audit | Automated crawler testing all routes with 0 broken links, 0 console errors, 0 missing assets, real state persistence verification | 5 | 5 | Yes |
| **F12** | Opaque-Box E2E Testing Suite | Comprehensive requirement-driven test suite with 4 tiers verifying feature coverage, boundaries, combinations, and realistic workloads | Harness | Harness | Core Runner |

---

## 3. Test Architecture & Directory Layout

```
sih-artifact/
├── scripts/
│   └── run_e2e_tests.mjs          # Standalone executable test runner entrypoint
├── test/
│   └── e2e/
│       ├── index.mjs              # Master test aggregator & runner orchestrator
│       ├── helpers/
│       │   ├── assertions.mjs     # Custom test harness & assertion library
│       │   ├── env.mjs            # Workspace root resolution & path resolution
│       │   ├── storage_simulator.mjs # Browser localStorage & event bus simulator
│       │   ├── route_verifier.mjs # Portal route & layout AST inspection engine
│       │   ├── i18n_verifier.mjs  # 6-language dictionary auditor & fallback engine
│       │   └── ai_engine.mjs      # In-process algorithmic oracle & API client
│       ├── tier1_features/
│       │   ├── f01_navigation.mjs
│       │   ├── f02_persistence.mjs
│       │   ├── f03_price_forecast.mjs
│       │   ├── f04_vrp_route_opt.mjs
│       │   ├── f05_produce_grading.mjs
│       │   ├── f06_shelf_life_decay.mjs
│       │   ├── f07_type_safe_schemas.mjs
│       │   ├── f08_localization_6lang.mjs
│       │   ├── f09_ui_readability.mjs
│       │   ├── f10_build_sanitization.mjs
│       │   └── f11_crawl_audit.mjs
│       ├── tier2_boundaries/
│       │   ├── f01_nav_boundaries.mjs
│       │   ├── f02_store_boundaries.mjs
│       │   ├── f03_forecast_boundaries.mjs
│       │   ├── f04_vrp_boundaries.mjs
│       │   ├── f05_grading_boundaries.mjs
│       │   ├── f06_shelf_boundaries.mjs
│       │   ├── f07_schema_boundaries.mjs
│       │   ├── f08_i18n_boundaries.mjs
│       │   ├── f09_ui_boundaries.mjs
│       │   ├── f10_build_boundaries.mjs
│       │   └── f11_crawl_boundaries.mjs
│       ├── tier3_interactions/
│       │   └── cross_feature_pairs.mjs
│       └── tier4_scenarios/
│           └── real_world_scenarios.mjs
├── TEST_INFRA.md                  # This test infrastructure specification
└── TEST_READY.md                  # Test suite completion & execution certificate
```

---

## 4. Runner Invocation & Pass/Fail Semantics

### 4.1 Invocation Commands
The test suite is fully self-contained and requires zero external daemon processes. It can be invoked via standard Node.js or npm script commands:
```bash
# Direct Node invocation
node scripts/run_e2e_tests.mjs

# Alternative package runner
npm run test:e2e
```

### 4.2 Pass/Fail Semantics
- **Exit Code 0**: Every test assertion across all 4 tiers evaluated to true. Zero uncaught exceptions, zero rejected promises, zero missing dictionary keys, and zero contract mismatches.
- **Exit Code 1**: At least one test assertion failed or encountered a runtime error. The runner prints the exact failed test name, file path, line number, expected vs actual values, and execution stack trace.

---

## 5. Minimum Coverage Thresholds & Actual Counts

| Test Tier | Metric / Target | Required Minimum | Implemented & Verified | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Tier 1** | Primary Feature Coverage (F01–F11) | $\ge 55$ tests (5/feat) | **55 tests** | PASS |
| **Tier 2** | Boundary & Corner Cases (F01–F11) | $\ge 55$ tests (5/feat) | **55 tests** | PASS |
| **Tier 3** | Cross-Feature Interaction Pairs | $\ge 12$ tests | **14 tests** | PASS |
| **Tier 4** | Real-World Stakeholder Scenarios | $\ge 6$ tests | **8 tests** | PASS |
| **Total** | **Comprehensive E2E Suite** | $\mathbf{\ge 128\text{ tests}}$ | $\mathbf{132\text{ tests}}$ | **PASS** |

---

## 6. Authoritative Reference Oracles & Tolerances

1. **AI Price Forecasting (`F03`)**:
   - Wheat Verified Test MAE: $\le ₹0.50/\text{kg}$ (Empirical: $₹0.33/\text{kg}$).
   - Potato Verified Test MAE: $\le ₹1.00/\text{kg}$ (Empirical: $₹0.64/\text{kg}$).
   - Tomato Verified Test MAE: $\le ₹5.00/\text{kg}$ (Empirical: $₹4.04/\text{kg}$).
   - MSP Guardrail: Predicted price $\ge \text{MSP}$ for Wheat ($₹22.75/\text{kg}$), Mustard ($₹56.50/\text{kg}$), Soybean ($₹46.00/\text{kg}$).
   - 5-Tier Fallback Cascade: Must resolve in sequence: `EXACT_MARKET` $\to$ `DISTRICT_AGGREGATE` $\to$ `STATE_AGGREGATE` $\to$ `COMMODITY_BASELINE` $\to$ `NATIONAL_BASELINE`.
2. **Capacitated VRP Optimizer (`F04`)**:
   - Vehicle capacities: TWO_WHEELER: 50 kg, CAR: 200 kg, VAN: 1,000 kg, TRUCK: 10,000 kg.
   - Partitioning constraint: $\forall \text{route}_i, \sum \text{payload} \le \text{capacity}$. When total payload exceeds vehicle class limit, must partition into multiple vehicles and set `isMultiVehicle: true`.
   - Savings metric: $\text{distanceSavedKm} = \text{baselineDistanceKm} - \text{totalDistanceKm} \ge 0$.
   - Emission factor: $\text{co2AvertedKg} = \text{fuelSavedLiters} \times 2.68\text{ kg CO}_2/\text{L}$.
3. **Produce Quality Grading (`F05`)**:
   - Defect Area $< 5\%$ and Severity $< 0.2 \implies \text{Grade A1}$, quality $\ge 90$, discount $= 0\%$.
   - Defect Area $5\text{--}10\% \implies \text{Grade A2}$, quality $75\text{--}89$, discount $5\text{--}10\%$.
   - Defect Area $10\text{--}20\% \implies \text{Grade B}$, quality $60\text{--}74$, discount $15\text{--}20\%$.
   - Defect Area $20\text{--}30\% \implies \text{Grade C}$, quality $40\text{--}59$, discount $30\text{--}40\%$.
   - Defect Area $> 30\%$ or Fungal Spoilage $\implies \text{Reject}$, discount $= 100\%$.
4. **Storage Shelf-Life Decay (`F06`)**:
   - Arrhenius Temperature Dependence: Ambient $35^\circ\text{C}$ must decay $\ge 2.5\times$ faster than cold storage $4^\circ\text{C}$.
   - Relative Humidity: RH $< 55\%$ accelerates moisture loss.
   - Dynamic markdown monotonically increases as remaining shelf life decreases.
5. **Localization Integrity (`F08`)**:
   - 6 supported languages: `en`, `hi`, `pa`, `mr`, `te`, `ta`.
   - Exact parity: $\text{keys}(L) = \text{keys}(\text{en})$ for all $L \in \{\text{hi}, \text{pa}, \text{mr}, \text{te}, \text{ta}\}$.
   - Zero missing keys, zero untranslated `undefined` lookups, deep fallback enabled.
