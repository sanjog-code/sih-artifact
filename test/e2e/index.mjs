/**
 * FarmLink Comprehensive E2E Test Suite Index
 * Master test aggregator executing all 4 tiers across all 12 core features.
 */

import { harness } from './helpers/assertions.mjs';

// Tier 1: Functional Feature Coverage (F01 - F11)
import { runF01NavigationTests } from './tier1_features/f01_navigation.mjs';
import { runF02PersistenceTests } from './tier1_features/f02_persistence.mjs';
import { runF03PriceForecastTests } from './tier1_features/f03_price_forecast.mjs';
import { runF04VrpRouteOptTests } from './tier1_features/f04_vrp_route_opt.mjs';
import { runF05ProduceGradingTests } from './tier1_features/f05_produce_grading.mjs';
import { runF06ShelfLifeDecayTests } from './tier1_features/f06_shelf_life_decay.mjs';
import { runF07TypeSafeSchemasTests } from './tier1_features/f07_type_safe_schemas.mjs';
import { runF08Localization6LangTests } from './tier1_features/f08_localization_6lang.mjs';
import { runF09UiReadabilityTests } from './tier1_features/f09_ui_readability.mjs';
import { runF10BuildSanitizationTests } from './tier1_features/f10_build_sanitization.mjs';
import { runF11CrawlAuditTests } from './tier1_features/f11_crawl_audit.mjs';

// Tier 2: Boundary & Corner Cases (F01 - F11)
import { runF01NavBoundariesTests } from './tier2_boundaries/f01_nav_boundaries.mjs';
import { runF02StoreBoundariesTests } from './tier2_boundaries/f02_store_boundaries.mjs';
import { runF03ForecastBoundariesTests } from './tier2_boundaries/f03_forecast_boundaries.mjs';
import { runF04VrpBoundariesTests } from './tier2_boundaries/f04_vrp_boundaries.mjs';
import { runF05GradingBoundariesTests } from './tier2_boundaries/f05_grading_boundaries.mjs';
import { runF06ShelfBoundariesTests } from './tier2_boundaries/f06_shelf_boundaries.mjs';
import { runF07SchemaBoundariesTests } from './tier2_boundaries/f07_schema_boundaries.mjs';
import { runF08I18nBoundariesTests } from './tier2_boundaries/f08_i18n_boundaries.mjs';
import { runF09UiBoundariesTests } from './tier2_boundaries/f09_ui_boundaries.mjs';
import { runF10BuildBoundariesTests } from './tier2_boundaries/f10_build_boundaries.mjs';
import { runF11CrawlBoundariesTests } from './tier2_boundaries/f11_crawl_boundaries.mjs';

// Tier 3: Cross-Feature Integration Pairs
import { runTier3CrossFeatureTests } from './tier3_interactions/cross_feature_pairs.mjs';

// Tier 4: Real-World Agrarian Scenarios
import { runTier4RealWorldScenarios } from './tier4_scenarios/real_world_scenarios.mjs';

export async function executeAllTests() {
  const startTime = performance.now();

  // Tier 1 execution
  runF01NavigationTests(harness);
  runF02PersistenceTests(harness);
  runF03PriceForecastTests(harness);
  runF04VrpRouteOptTests(harness);
  runF05ProduceGradingTests(harness);
  runF06ShelfLifeDecayTests(harness);
  runF07TypeSafeSchemasTests(harness);
  runF08Localization6LangTests(harness);
  runF09UiReadabilityTests(harness);
  runF10BuildSanitizationTests(harness);
  runF11CrawlAuditTests(harness);

  // Tier 2 execution
  runF01NavBoundariesTests(harness);
  runF02StoreBoundariesTests(harness);
  runF03ForecastBoundariesTests(harness);
  runF04VrpBoundariesTests(harness);
  runF05GradingBoundariesTests(harness);
  runF06ShelfBoundariesTests(harness);
  runF07SchemaBoundariesTests(harness);
  runF08I18nBoundariesTests(harness);
  runF09UiBoundariesTests(harness);
  runF10BuildBoundariesTests(harness);
  runF11CrawlBoundariesTests(harness);

  // Tier 3 execution
  runTier3CrossFeatureTests(harness);

  // Tier 4 execution
  runTier4RealWorldScenarios(harness);

  const durationMs = performance.now() - startTime;
  return { harness, durationMs };
}
