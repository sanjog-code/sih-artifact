# BRIEFING — 2026-10-10T18:11:00Z

## Mission
Deep survey of the AI & ML pipelines, datasets, route optimization components, and mathematical/heuristic models for FarmLink.

## 🔒 My Identity
- Archetype: explorer
- Roles: survey, analysis, synthesis
- Working directory: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\explorer_survey_2
- Original parent: 824719d0-6b35-44b8-9f77-5aae587e296c
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify any application code or dataset files

## Current Parent
- Conversation ID: 824719d0-6b35-44b8-9f77-5aae587e296c
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `Agriculture_price_dataset.csv` in `C:\Users\amans\.gemini\antigravity\scratch\FarmLink-AI\ai`
  - `FarmLink-AI/ai/train_model.py`, `predict_demand.py`, `optimize_farm_route.py`
  - `FarmLink-AI/backend/routes/ai.js`, `routeOptimization.js`
  - `sih-artifact/apps/web/src/app/api/ai/forecast/route.ts`, `route-optimize/route.ts`
  - `sih-artifact/apps/api/src/modules/grading`, `pricing`, `logistics`, `warehouse`
  - `sih-artifact/packages/shared/src/rules/grading.ts`, `pricing.ts`
- **Key findings**:
  - Dataset has 737,392 rows, 5 commodities (Potato, Onion, Wheat, Tomato, Rice), 29 states, 1598 mandis, 0 missing values.
  - Empirically verified time-series regression test MAE: Wheat ₹0.33/kg, Potato ₹0.64/kg, Onion ₹2.76/kg, Tomato ₹4.04/kg, Rice ₹4.45/kg.
  - Next.js forecast route currently has 8 hardcoded benchmarks and needs real model inference with fallback cascade.
  - Next.js route-optimize currently does single-vehicle nearest-neighbor; needs true CVRP with vehicle capacities and distance matrix input.
  - Produce grading and shelf-life decay endpoints are missing from Next.js and need dedicated type-safe routes.
- **Unexplored areas**: None. Full survey complete.

## Key Decisions Made
- Recommend training and exporting a compact, fast model + hierarchical benchmark index to JSON (`mandi_forecast_model.json`) for sub-millisecond, zero-dependency in-process Next.js serving.
- Recommend pure TypeScript Capacitated VRP (Clarke-Wright Savings + 2-Opt) engine supporting distance matrix inputs and fleet constraints.
- Formulated kinetic Arrhenius decay equations for warehousing shelf-life and AGMARK multi-attribute optical grading heuristic.

## Artifact Index
- handoff.md — Comprehensive survey report
