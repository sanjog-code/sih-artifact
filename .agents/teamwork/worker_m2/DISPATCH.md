## 2026-10-10T18:13:10Z
[Message] timestamp=2026-10-10T18:13:10Z sender=824719d0-6b35-44b8-9f77-5aae587e296c priority=MESSAGE_PRIORITY_HIGH content=You are worker_m2, an AI & ML Implementation Specialist.

Working directory: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\worker_m2
Project root: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact
Authoritative original request: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\ORIGINAL_REQUEST.md
Master Project Plan: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\PROJECT.md
Parent Orchestrator Conversation ID: 824719d0-6b35-44b8-9f77-5aae587e296c

Scope boundaries & Write Ownership:
- You exclusively own:
  - packages/shared/src/schemas/ai.ts
  - packages/shared/src/index.ts (re-export ai schemas)
  - scripts/train_forecast_model.mjs
  - apps/web/src/data/mandi_forecast_model.json
  - apps/web/src/lib/ai/ (entire directory: forecast.ts, vrp-solver.ts, produce-grading.ts, shelf-life.ts, index.ts)
  - apps/web/src/app/api/ai/forecast/route.ts
  - apps/web/src/app/api/ai/route-optimize/route.ts
  - apps/web/src/app/api/ai/grading/route.ts
  - apps/web/src/app/api/ai/shelf-life/route.ts
- DO NOT edit apps/web/src/components/Navbar.tsx or store files (owned by worker_m1).
- DO NOT edit test/e2e/ (owned by test_writer_e2e).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission (Milestone 2 — AI & ML Pipelines & Serving Endpoints):
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\explorer_survey_2\handoff.md completely.
2. Train, Evaluate & Export Price & Demand Forecasting Model:
   - Implement `scripts/train_forecast_model.mjs`.
   - Read and process `C:\Users\amans\.gemini\antigravity\scratch\FarmLink-AI\ai\Agriculture_price_dataset.csv` (737,392 rows, 5 commodities: Potato, Onion, Wheat, Tomato, Rice).
   - Perform chronological 80/20 train/test evaluation across all lag-featured samples.
   - Verify and log test MAE benchmarks (Wheat ₹0.33/kg, Potato ₹0.64/kg, Onion ₹2.76/kg, Tomato ₹4.04/kg, Rice ₹4.45/kg).
   - Export regression model weights, feature multipliers, hierarchical mandi benchmark index (Mandi -> District -> State -> National), and statutory MSP floor prices to `apps/web/src/data/mandi_forecast_model.json`.
3. Expose Next.js Route Handler `apps/web/src/app/api/ai/forecast/route.ts`:
   - Serve model from `mandi_forecast_model.json` in-memory with <2ms latency.
   - Accept query parameters: `commodity`, `state`, `district`, `market`.
   - Implement 5-tier fallback cascade:
     Tier 1: Exact Mandi match
     Tier 2: District aggregate
     Tier 3: State aggregate
     Tier 4: Commodity baseline
     Tier 5: Agricultural class fallback with statutory MSP floors
   - Return structured type-safe JSON: predictedModalPrice, predictedChangePercent, confidenceScore, testMaeQuintal, testMaeKg, mspFloor, demandSignal, fairPriceRange, factors, fallbackLevel.
4. Implement Capacitated VRP Solver in `apps/web/src/lib/ai/vrp-solver.ts` and `apps/web/src/app/api/ai/route-optimize/route.ts`:
   - In-process TypeScript Clarke-Wright Savings algorithm + 2-Opt local search refinement.
   - Support fleet capacities: TWO_WHEELER (50kg), CAR (200kg), VAN (1000kg), TRUCK (10000kg).
   - Accept user-supplied distance matrix OR compute Haversine road-winding coordinates.
   - When total payload exceeds vehicle capacity, partition stops across multiple vehicle routes.
   - Calculate fuel saved (liters) and CO2 emissions averted (kg) against baseline sequential routes.
5. Implement Produce Quality Grading in `apps/web/src/lib/ai/produce-grading.ts` and `apps/web/src/app/api/ai/grading/route.ts`:
   - Optical defect scoring heuristics conforming to AGMARK standards (Grade A1, Grade A2, Grade B, Grade C, Reject).
   - Defect weights: bruising, discoloration, shriveling, foreign matter, fungal decay.
6. Implement Storage Shelf-Life Decay in `apps/web/src/lib/ai/shelf-life.ts` and `apps/web/src/app/api/ai/shelf-life/route.ts`:
   - Arrhenius kinetic perishability model: k(T) = k_ref * Q10^((T - T_ref) / 10).
   - Vapor Pressure Deficit (VPD) humidity adjustment.
   - Return remaining shelf-life days, quality retention curve, and dynamic markdown discount curve (0-35%).
7. Define Zod Schemas in `packages/shared/src/schemas/ai.ts`:
   - ForecastRequestSchema, ForecastResponseSchema, RouteOptimizeRequestSchema, RouteOptimizeResponseSchema, ProduceGradingRequestSchema, ProduceGradingResponseSchema, ShelfLifeRequestSchema, ShelfLifeResponseSchema.
   - Ensure zero `any` types.
8. Verify all endpoints: run `scripts/train_forecast_model.mjs`, run `cmd /c "cd packages/shared && npx tsc --noEmit"` and `cmd /c "cd apps/web && npx tsc --noEmit"`. Verify passing tests.
9. Write your handoff report to C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\worker_m2\handoff.md.
10. Send a message to parent orchestrator (824719d0-6b35-44b8-9f77-5aae587e296c) via send_message notifying completion with summary and path to handoff.md.
