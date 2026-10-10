import { expect } from '../helpers/assertions.mjs';
import { solveRouteOptimization } from '../helpers/ai_engine.mjs';

export function runF04VrpBoundariesTests(harness) {
  harness.describe('Tier 2 - F04: VRP Optimizer Boundary & Corner Cases', () => {
    harness.it('F04-T2.1: Single waypoint route optimizes without division-by-zero errors', () => {
      const res = solveRouteOptimization({
        waypoints: [{ id: 'STOP-ONLY', name: 'Isolated Farm Silo', lat: 26.9124, lng: 75.7873, payloadKg: 100 }],
        vehicleClass: 'VAN',
      });

      expect.equal(res.success, true, 'Single waypoint optimization should succeed');
      expect.equal(res.routes.length, 1, 'Should return 1 route');
      expect.equal(res.routes[0].stops.length, 1, 'Route should contain exactly 1 stop');
    });

    harness.it('F04-T2.2: Extreme payload exceeding standard fleet capacity partitions into multiple vehicles', () => {
      const res = solveRouteOptimization({
        waypoints: [
          { id: 'S1', name: 'Mega Farm 1', lat: 26.9, lng: 75.7, payloadKg: 8000 },
          { id: 'S2', name: 'Mega Farm 2', lat: 27.1, lng: 75.8, payloadKg: 7000 },
          { id: 'S3', name: 'Mega Farm 3', lat: 26.8, lng: 75.6, payloadKg: 9000 },
        ],
        vehicleClass: 'TRUCK', // 10,000 kg capacity, total payload = 24,000 kg
      });

      expect.equal(res.isMultiVehicle, true, '24,000 kg payload must partition across trucks');
      expect.greaterOrEqual(res.routes.length, 3, 'Must deploy at least 3 trucks for 24,000 kg load');
    });

    harness.it('F04-T2.3: Coincident identical coordinates handle zero-distance calculation without NaN', () => {
      const res = solveRouteOptimization({
        waypoints: [
          { id: 'S1', name: 'Warehouse Gate A', lat: 26.9124, lng: 75.7873, payloadKg: 50 },
          { id: 'S2', name: 'Warehouse Gate B', lat: 26.9124, lng: 75.7873, payloadKg: 50 },
        ],
        vehicleClass: 'TWO_WHEELER',
      });

      expect.equal(res.success, true, 'Coincident points solve cleanly');
      expect.notOk(isNaN(res.totalDistanceKm), 'Total distance must not be NaN');
      expect.notOk(isNaN(res.co2AvertedKg), 'CO2 calculation must not be NaN');
    });

    harness.it('F04-T2.4: Empty waypoints request throws descriptive validation error', () => {
      expect.throws(
        () => solveRouteOptimization({ waypoints: [], vehicleClass: 'VAN' }),
        /waypoint/i,
        'Empty waypoints must throw validation error'
      );
    });

    harness.it('F04-T2.5: Custom capacity override respects explicit kilogram limit', () => {
      const res = solveRouteOptimization({
        waypoints: [
          { id: 'S1', name: 'Stop A', lat: 26.9, lng: 75.7, payloadKg: 400 },
          { id: 'S2', name: 'Stop B', lat: 27.0, lng: 75.8, payloadKg: 400 },
        ],
        vehicleClass: 'VAN',
        customCapacityKg: 500, // custom down-rated capacity
      });

      expect.equal(res.capacityLimitKg, 500, 'Custom capacity 500kg must override default VAN capacity (1000kg)');
      expect.equal(res.isMultiVehicle, true, '800kg total payload must trigger multi-vehicle under 500kg custom limit');
    });
  });
}
