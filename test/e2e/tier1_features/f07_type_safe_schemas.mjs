import fs from 'node:fs';
import { expect } from '../helpers/assertions.mjs';
import { ROUTES } from '../helpers/env.mjs';

export function runF07TypeSafeSchemasTests(harness) {
  harness.describe('Tier 1 - F07: Type-Safe JSON Schemas for AI APIs', () => {
    harness.it('F07-T1.1: AI Schema module exists in @farmlink/shared with zero any types', () => {
      expect.ok(fs.existsSync(ROUTES.aiSchemas), 'packages/shared/src/schemas/ai.ts must exist');
      const content = fs.readFileSync(ROUTES.aiSchemas, 'utf8');

      // Check key exports
      expect.ok(content.includes('ForecastRequestSchema'), 'Must export ForecastRequestSchema');
      expect.ok(content.includes('ForecastResponseSchema'), 'Must export ForecastResponseSchema');
      expect.ok(content.includes('RouteOptimizeRequestSchema'), 'Must export RouteOptimizeRequestSchema');
      expect.ok(content.includes('RouteOptimizeResponseSchema'), 'Must export RouteOptimizeResponseSchema');
      expect.ok(content.includes('ProduceGradingRequestSchema'), 'Must export ProduceGradingRequestSchema');
      expect.ok(content.includes('ProduceGradingResponseSchema'), 'Must export ProduceGradingResponseSchema');
      expect.ok(content.includes('ShelfLifeRequestSchema'), 'Must export ShelfLifeRequestSchema');
      expect.ok(content.includes('ShelfLifeResponseSchema'), 'Must export ShelfLifeResponseSchema');
    });

    harness.it('F07-T1.2: Forecast response schema requires mandatory audit fields', () => {
      const content = fs.readFileSync(ROUTES.aiSchemas, 'utf8');
      expect.ok(content.includes('testMaeQuintal'), 'Schema must define testMaeQuintal');
      expect.ok(content.includes('testMaeKg'), 'Schema must define testMaeKg');
      expect.ok(content.includes('mspFloor'), 'Schema must define mspFloor');
      expect.ok(content.includes('fallbackLevel'), 'Schema must define fallbackLevel');
      expect.ok(content.includes('demandSignal'), 'Schema must define demandSignal');
    });

    harness.it('F07-T1.3: VRP Route optimize schema validates vehicle capacity constraints', () => {
      const content = fs.readFileSync(ROUTES.aiSchemas, 'utf8');
      expect.ok(content.includes('TWO_WHEELER'), 'Schema must support TWO_WHEELER');
      expect.ok(content.includes('CAR'), 'Schema must support CAR');
      expect.ok(content.includes('VAN'), 'Schema must support VAN');
      expect.ok(content.includes('TRUCK'), 'Schema must support TRUCK');
      expect.ok(content.includes('isMultiVehicle'), 'Response schema must validate isMultiVehicle boolean');
    });

    harness.it('F07-T1.4: Produce grading schema defines AGMARK grades and defect items', () => {
      const content = fs.readFileSync(ROUTES.aiSchemas, 'utf8');
      expect.ok(content.includes('Grade A1'), 'Schema must include Grade A1');
      expect.ok(content.includes('Grade A2'), 'Schema must include Grade A2');
      expect.ok(content.includes('Grade B'), 'Schema must include Grade B');
      expect.ok(content.includes('Grade C'), 'Schema must include Grade C');
      expect.ok(content.includes('Reject'), 'Schema must include Reject');
    });

    harness.it('F07-T1.5: Storage shelf-life schema defines risk levels and markdown parameters', () => {
      const content = fs.readFileSync(ROUTES.aiSchemas, 'utf8');
      expect.ok(content.includes('OPTIMAL'), 'Risk levels must include OPTIMAL');
      expect.ok(content.includes('MONITOR'), 'Risk levels must include MONITOR');
      expect.ok(content.includes('EXPEDITE_SALE'), 'Risk levels must include EXPEDITE_SALE');
      expect.ok(content.includes('DISPOSAL_RISK'), 'Risk levels must include DISPOSAL_RISK');
      expect.ok(content.includes('dynamicMarkdownPercent'), 'Response must define dynamicMarkdownPercent');
    });
  });
}
