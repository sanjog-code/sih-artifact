# FarmLink Premier 🌾
**Direct Produce Marketplace & Agrarian Intelligence Network**

Connecting Indian farmers, verified institutional buyers, and conscious consumers with transparent pricing, WDRA-accredited storage, and RBI-regulated nodal escrow settlement.

---

## 1. Product & Revenue Model

FarmLink Premier implements a sustainable, transparent monetization structure:

### 1.1 Farmers
* **Marketplace access is 100% free forever** — zero upfront listing or monthly membership fees.
* Transparent platform commission deducted exclusively upon completed sale escrow release:
  * **Basic**: Free access; **5% platform commission**. Standard listing, Mandi price benchmarking, UPI/NEFT escrow payouts.
  * **Premier**: **4% platform commission**. Unlocks verified buyer demand signals and aggregation hub priority.
  * **Premier Pro**: **3% platform commission**. AI listing copilot, 14-day price trajectory insights, promotional placement.
  * **Premier Elite**: **2% platform commission**. Institutional direct-dispatch matching, dedicated FPO advisor, zero-wait T+1 escrow settlement.
* **Non-AI Authority Guarantee**: A farmer’s plan tier and commission percentage are assigned strictly via auditable backend sales volume rules or admin action—**never autonomously by AI**.

### 1.2 Business Buyers (B2B Procurement SaaS)
* **Starter (₹4,999/mo | ₹49,990/yr)**: Essential procurement tools, basic supplier discovery, order management, single depot routing.
* **Growth (₹9,999/mo | ₹99,990/yr)**: Multi-supplier sourcing coordination, recurring procurement schedules, supplier performance analytics.
* **Pro (₹19,999/mo | ₹1,99,990/yr)**: Multi-depot routing, consolidated purchasing audit reports, priority dispatch allocation.
* **Enterprise (₹49,999+/mo | Custom)**: Custom ERP integrations, tailored SLA contracts, dedicated agri-procurement desk.
* **Server-Enforced Entitlements**: Advanced B2B features are gated by server-side middleware (`enforceBusinessFeature`), preventing unauthorized bypasses.

### 1.3 Consumers (Farm-to-Fork Memberships)
* **Basic (Free)**: Standard retail catalog, escrow-backed checkout, order tracking.
* **Premier (₹99/mo | ₹999/yr)**: Batch quality & traceability passports, ₹40 delivery fee discount per order.
* **Plus (₹199/mo | ₹1,999/yr)**: 100% Free eco-delivery on orders over ₹399, early-access harvest drops, dedicated support concierge.
* **Policy-Driven Discounts**: Delivery benefits are capped, deterministic, and auditable.

---

## 2. Technical Architecture

* **Monorepo Structure**:
  * `apps/web`: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide icons, mobile-first responsive design.
  * `apps/api`: NestJS backend service with Prisma ORM 5/6 and PostgreSQL connection.
  * `packages/shared`: Shared TypeScript package containing Zod schemas, domain rules (`rules/monetization.ts`, `rules/pricing.ts`, `rules/orders.ts`), and i18n dictionaries for 6 Indian languages (`en`, `hi`, `pa`, `mr`, `te`, `ta`).
* **Database & Infrastructure**:
  * PostgreSQL 17 via Docker Compose (`docker-compose.yml`).
  * Redis 7 for distributed caching and rate limiting.
  * MinIO for S3-compatible produce image & traceability document storage.
* **Payment Boundary**:
  * Provider interface (`apps/web/src/lib/server/payments/provider.ts`) supporting both `MockPaymentProvider` (default for local dev) and `RazorpayPaymentProvider`.
  * HMAC-SHA256 webhook signature verification with replay protection and idempotency logging.
  * Toggle between providers via a single environment variable: `PAYMENTS_PROVIDER=mock` or `PAYMENTS_PROVIDER=razorpay`.
* **Server-Only Google Gemini AI Assistance Layer**:
  * Server-side API endpoints storing `GEMINI_API_KEY` strictly in environment variables.
  * Strict Zod parsing on all AI inputs and outputs.
  * Mandatory disclaimer on all AI-assisted responses:
    > *"AI-assisted information. Confirm important agricultural, commercial, quality-certification, and financial decisions with authorized personnel."*

---

## 3. Core Server-Only AI Copilots

1. **Multilingual Onboarding Assistant** (`/api/ai/onboarding-assistant`)
   * Guides farmers and buyers through registration, profile setup, and listing drafts across 6 Indian languages.
2. **B2B Procurement Copilot** (`/api/ai/procurement-copilot`)
   * Converts unstructured buyer requirements into standardized RFQs and drafts multi-supplier scorecards.
3. **Supply-Demand Match Explanation** (`/api/ai/match-explanation`)
   * Transparently explains match alignment across location proximity, grade compatibility, price tolerance, and volume coverage.
4. **Product Listing Copilot** (`/api/ai/listing-copilot`)
   * Converts rough farmer notes or voice transcriptions into structured listings with standard units, grades, and tags. Requires explicit farmer review before publishing.

### Strict Non-AI Authority Safeguards
AI is strictly prohibited from:
- Setting prices or accepting quotes autonomously.
- Determining legal compliance or issuing official AGMARK certifications.
- Making credit underwriting, loan approval, or financial eligibility decisions.
- Capturing payments, executing refunds, or releasing nodal escrow funds.
- Progressing order statuses or allocating inventory autonomously.

---

## 4. Environment Variables

Copy `.env.example` to `.env` or `.env.local`:

```env
# Database
DATABASE_URL="postgresql://farmlink:farmlink_dev_password@localhost:5432/farmlink?schema=public"

# Google Gemini AI (Server-Only)
GEMINI_API_KEY="" # Leave empty to use deterministic mock fallback

# Payments Gateway
PAYMENTS_PROVIDER="mock" # "mock" for local development, "razorpay" for production
RAZORPAY_KEY_ID="rzp_test_mock_key"
RAZORPAY_KEY_SECRET="mock_secret"
RAZORPAY_WEBHOOK_SECRET="mock_webhook_secret"

# Sessions & URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="change-me-to-a-secure-32-char-random-secret"
```

---

## 5. Development & Testing Commands

```bash
# Start local PostgreSQL, Redis, and MinIO
docker compose up -d

# Install workspace dependencies
pnpm install

# Run comprehensive test suite across all workspace packages
pnpm test

# Run individual package tests
pnpm --filter @farmlink/shared test
pnpm --filter @farmlink/api test
pnpm --filter @farmlink/web test

# Build all packages
pnpm build

# Start web development server
pnpm dev:web
```

---

## 6. Verification & Test Coverage Summary

- ✅ **Farmer Commission Tiers**: 5% Basic, 4% Premier, 3% Premier Pro, 2% Premier Elite with exact net payout arithmetic.
- ✅ **B2B Entitlement Gates**: Server-side enforcement preventing unauthorized feature access.
- ✅ **Consumer Delivery Benefits**: Policy-driven capped delivery discounts.
- ✅ **Order Financials**: Server-side subtotal, commission, discounts, and fee disclosures.
- ✅ **Payment Webhook Verification**: Constant-time HMAC-SHA256 signature verification and idempotent deduplication.
- ✅ **AI Zod Schemas**: Strict input/output validation and non-authority disclaimers across all AI features.
