## 2026-10-10T18:52:28Z
You are worker_m4, the Final Integration, Crawl Audit & Build Sanitization Specialist.

Working directory: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\worker_m4
Project root: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact
Authoritative original request: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\ORIGINAL_REQUEST.md
Master Project Plan: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\PROJECT.md
Test Infrastructure: C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\TEST_INFRA.md
Parent Orchestrator Conversation ID: 824719d0-6b35-44b8-9f77-5aae587e296c

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission (Milestone 4 — Final Integration, Crawl Audit, ESLint Clean Build & Test Pass):
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md completely.
2. ESLint Sanitization in apps/web:
   - Inspect and fix all remaining ESLint errors in apps/web (specifically `src/app/farmer/page.tsx` and `src/app/logistics/page.tsx` for `no-explicit-any` and `react-hooks/set-state-in-effect`, plus any unused imports).
   - Run `cmd /c "cd apps\web && npx eslint . --quiet"` and ensure it exits with code 0 and ZERO errors.
3. Automated Website Crawl & Error Remediation Audit:
   - Implement an automated crawler script `scripts/crawl_audit.mjs` that crawls all routes:
     - `/` (Overview, Marketplace, Advisory, Pillars)
     - `/about` (Trust, Verification Terminal, Pledge)
     - `/farmer` (Crop lot declaration, AI forecast, persistence)
     - `/buyer` (Bulk RFQ bidding, escrow desks)
     - `/logistics` (VRP fleet optimization, dispatch manifests)
     - `/consumer` (Direct consumer produce catalog, cart, checkout)
     - API endpoints: `/api/ai/forecast`, `/api/ai/route-optimize`, `/api/ai/grading`, `/api/ai/shelf-life`.
   - Verify 0 broken links, 0 unhandled promise rejections, 0 missing assets, and 0 missing translations across all 6 languages.
4. Comprehensive Build & Test Verification:
   - Run `node scripts/run_e2e_tests.mjs`: Verify 132/132 tests pass with exit code 0.
   - Run `cmd /c "cd apps\web && npx tsc --noEmit"`: Verify exit code 0.
   - Run `cmd /c "cd packages\shared && npx tsc --noEmit && npx jest"`: Verify exit code 0.
   - Run `cmd /c "cd apps\web && npx next build"`: Verify clean production build generating all routes with 0 errors.
5. Write your complete handoff report to C:\Users\amans\.gemini\antigravity\scratch\sih-artifact\.agents\teamwork\worker_m4\handoff.md documenting every command executed, exit code, and test log.
6. Send completion message to parent orchestrator (824719d0-6b35-44b8-9f77-5aae587e296c).
