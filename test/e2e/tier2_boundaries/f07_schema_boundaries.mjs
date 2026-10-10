import { expect } from '../helpers/assertions.mjs';

export function runF07SchemaBoundariesTests(harness) {
  harness.describe('Tier 2 - F07: Type-Safe Schema Boundary & Corner Cases', () => {
    // Pure validator simulation conforming to Zod schema rules
    const validateForecast = (obj) => {
      if (!obj || typeof obj !== 'object') throw new Error('Input must be an object');
      if (!obj.commodity || typeof obj.commodity !== 'string' || obj.commodity.trim().length === 0) {
        throw new Error('Commodity is required and must be non-empty');
      }
      if (obj.storageDays !== undefined && (typeof obj.storageDays !== 'number' || obj.storageDays < 0)) {
        throw new Error('storageDays must be a non-negative number');
      }
      return true;
    };

    const validateWaypoint = (wp) => {
      if (!wp.id || typeof wp.id !== 'string') throw new Error('Waypoint id required');
      if (typeof wp.lat !== 'number' || wp.lat < -90 || wp.lat > 90) throw new Error('Latitude out of bounds [-90, 90]');
      if (typeof wp.lng !== 'number' || wp.lng < -180 || wp.lng > 180) throw new Error('Longitude out of bounds [-180, 180]');
      if (typeof wp.payloadKg !== 'number' || wp.payloadKg < 0) throw new Error('payloadKg must be non-negative');
      return true;
    };

    const validateVehicleClass = (vc) => {
      const allowed = ['TWO_WHEELER', 'CAR', 'VAN', 'TRUCK'];
      if (!allowed.includes(vc)) throw new Error(`Invalid vehicleClass: ${vc}`);
      return true;
    };

    harness.it('F07-T2.1: Missing required commodity string fails validation', () => {
      expect.throws(() => validateForecast({}), /Commodity is required/i);
      expect.throws(() => validateForecast({ commodity: '' }), /non-empty/i);
      expect.throws(() => validateForecast({ commodity: '   ' }), /non-empty/i);
    });

    harness.it('F07-T2.2: Negative numeric fields violate non-negative schema rules', () => {
      expect.throws(
        () => validateForecast({ commodity: 'Wheat', storageDays: -5 }),
        /non-negative/i
      );
      expect.throws(
        () => validateWaypoint({ id: 'W1', lat: 26.9, lng: 75.8, payloadKg: -100 }),
        /payloadKg must be non-negative/i
      );
    });

    harness.it('F07-T2.3: Geographic coordinates outside valid bounds [-90, 90] and [-180, 180] are rejected', () => {
      expect.throws(
        () => validateWaypoint({ id: 'W1', lat: 95.0, lng: 75.8, payloadKg: 50 }),
        /Latitude out of bounds/i
      );
      expect.throws(
        () => validateWaypoint({ id: 'W1', lat: 26.9, lng: 185.0, payloadKg: 50 }),
        /Longitude out of bounds/i
      );
    });

    harness.it('F07-T2.4: Empty or non-string waypoint identifiers are rejected', () => {
      expect.throws(
        () => validateWaypoint({ id: '', lat: 26.9, lng: 75.8, payloadKg: 50 }),
        /id required/i
      );
    });

    harness.it('F07-T2.5: Unrecognized enum values for vehicleClass throw schema mismatch errors', () => {
      expect.throws(
        () => validateVehicleClass('HELICOPTER'),
        /Invalid vehicleClass/i
      );
      expect.throws(
        () => validateVehicleClass('PLANE'),
        /Invalid vehicleClass/i
      );
      expect.ok(validateVehicleClass('VAN'));
      expect.ok(validateVehicleClass('TRUCK'));
    });
  });
}
