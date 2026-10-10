import { expect } from '../helpers/assertions.mjs';
import { solveRouteOptimization } from '../helpers/ai_engine.mjs';

export function runF04VrpRouteOptTests(harness) {
  harness.describe('Tier 1 - F04: Capacitated VRP Route Optimizer & API', () => {
    const sampleStops = [
      { id: 'STOP-1', name: 'Chomu Tomato Hub', lat: 27.1683, lng: 75.7208, payloadKg: 350 },
      { id: 'STOP-2', name: 'Phulera Mustard Cooperative', lat: 26.8722, lng: 75.2415, payloadKg: 250 },
      { id: 'STOP-3', name: 'Bassi Organic Collective', lat: 26.8322, lng: 76.0415, payloadKg: 200 },
    ];

    harness.it('F04-T1.1: Single vehicle tour solves within capacity bounds', () => {
      const res = solveRouteOptimization({
        waypoints: sampleStops,
        vehicleClass: 'VAN', // 1,000 kg capacity, total payload = 800 kg
      });

      expect.equal(res.success, true, 'Route optimization should succeed');
      expect.equal(res.vehicleClass, 'VAN', 'Vehicle class must match request');
      expect.equal(res.capacityLimitKg, 1000, 'VAN capacity must be 1000 kg');
      expect.equal(res.totalPayloadKg, 800, 'Total payload should be 800 kg');
      expect.equal(res.isMultiVehicle, false, '800 kg should not trigger multi-vehicle partitioning for 1000 kg VAN');
      expect.equal(res.routes.length, 1, 'Should output exactly 1 vehicle route');
    });

    harness.it('F04-T1.2: Multi-vehicle partitioning activates when payload exceeds vehicle capacity', () => {
      // 800 kg payload on a CAR with 200 kg capacity
      const res = solveRouteOptimization({
        waypoints: sampleStops,
        vehicleClass: 'CAR',
      });

      expect.equal(res.isMultiVehicle, true, 'Should trigger isMultiVehicle: true when payload exceeds CAR capacity (200kg)');
      expect.greaterThan(res.routes.length, 1, 'Should partition into multiple vehicle routes');
      for (const route of res.routes) {
        expect.lessOrEqual(route.payloadKg, 400, 'Each partitioned route must respect reasonable load limits');
      }
    });

    harness.it('F04-T1.3: Custom distance matrix overrides geographic coordinate calculation', () => {
      const customMatrix = [
        [0, 15.5, 42.0],
        [15.5, 0, 28.5],
        [42.0, 28.5, 0],
      ];

      const res = solveRouteOptimization({
        waypoints: sampleStops,
        vehicleClass: 'VAN',
        distanceMatrix: customMatrix,
      });

      expect.equal(res.success, true, 'Custom distance matrix route solve should succeed');
      expect.equal(res.routes[0].stops[0].distanceToNextKm, 15.5, 'Stop 1 distance should match custom matrix leg (15.5 km)');
    });

    harness.it('F04-T1.4: Distance, fuel savings and carbon reduction metrics are accurately calculated', () => {
      const res = solveRouteOptimization({
        waypoints: sampleStops,
        vehicleClass: 'VAN',
      });

      expect.greaterOrEqual(res.distanceSavedKm, 0, 'Distance saved should be non-negative');
      expect.greaterOrEqual(res.fuelSavedLiters, 0, 'Fuel saved liters should be non-negative');
      expect.greaterOrEqual(res.co2AvertedKg, 0, 'CO2 averted should be non-negative');

      // Verify diesel factor: co2AvertedKg = fuelSavedLiters * 2.68
      const expectedCo2 = Number((res.fuelSavedLiters * 2.68).toFixed(2));
      expect.closeTo(res.co2AvertedKg, expectedCo2, 0.05, 'CO2 averted must derive from 2.68 kg CO2/L diesel benchmark');
    });

    harness.it('F04-T1.5: Waypoint sequencing maintains cumulative payload tracking per stop', () => {
      const res = solveRouteOptimization({
        waypoints: sampleStops,
        vehicleClass: 'VAN',
      });

      const route = res.routes[0];
      let currentExpected = 0;
      for (const stop of route.stops) {
        currentExpected += stop.payloadKg;
        expect.equal(stop.cumulativeLoadKg, currentExpected, 'Cumulative load must increase by stop payload');
      }
    });
  });
}
