export type VehicleClass = 'TWO_WHEELER' | 'CAR' | 'VAN' | 'TRUCK';

export const VEHICLE_CAPACITIES_KG: Record<VehicleClass, number> = {
  TWO_WHEELER: 50,
  CAR: 200,
  VAN: 1000,
  TRUCK: 10000,
};

export const FUEL_CONSUMPTION_L_PER_KM: Record<VehicleClass, number> = {
  TWO_WHEELER: 0.03,
  CAR: 0.07,
  VAN: 0.12,
  TRUCK: 0.28,
};

export const CO2_KG_PER_LITER_DIESEL = 2.68;

export interface WaypointInput {
  id: string;
  name: string;
  lat: number;
  lng?: number;
  lon?: number;
  payloadKg?: number;
  quantityKg?: number;
  type?: 'DEPOT' | 'PICKUP' | 'DROPOFF';
  address?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface OriginInput {
  id?: string;
  name?: string;
  lat: number;
  lng?: number;
  lon?: number;
  address?: string;
}

export interface VrpSolverParams {
  waypoints?: WaypointInput[];
  stops?: WaypointInput[];
  origin?: OriginInput;
  vehicleClass?: VehicleClass;
  vehicleType?: VehicleClass;
  distanceMatrix?: number[][];
  customCapacityKg?: number;
}

export interface OptimizedStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  payloadKg: number;
  cumulativeLoadKg: number;
  distanceToNextKm: number;
  durationToNextMinutes: number;
  type?: 'DEPOT' | 'PICKUP' | 'DROPOFF';
  address?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface VehicleTour {
  vehicleId: number;
  stops: OptimizedStop[];
  distanceKm: number;
  durationMinutes: number;
  payloadKg: number;
}

export interface VrpSolverResult {
  success: boolean;
  vehicleClass: VehicleClass;
  capacityLimitKg: number;
  totalPayloadKg: number;
  capacityUtilizationPercent: number;
  routes: VehicleTour[];
  totalDistanceKm: number;
  baselineDistanceKm: number;
  distanceSavedKm: number;
  fuelSavedLiters: number;
  co2AvertedKg: number;
  isMultiVehicle: boolean;
  unoptimizedDistanceKm?: number;
  co2SavedKg?: number;
  origin?: { name: string; lat: number; lng: number; address?: string };
  orderedStops?: OptimizedStop[];
  estimatedDurationMinutes?: number;
  isOverloaded?: boolean;
  timestamp: string;
}

// Spherical Earth Haversine formula with 1.28 road-tortuosity multiplier
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  tortuosity: number = 1.28
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c * tortuosity).toFixed(2));
}

// 2-Opt Local Search Improvement Heuristic
function refineRoute2Opt(route: number[], distMatrix: number[][]): number[] {
  if (route.length <= 3) return route; // [0, stop, 0] cannot be improved by 2-opt

  let improved = true;
  let currentRoute = [...route];

  while (improved) {
    improved = false;
    for (let i = 1; i < currentRoute.length - 2; i++) {
      for (let j = i + 1; j < currentRoute.length - 1; j++) {
        const u1 = currentRoute[i - 1];
        const u2 = currentRoute[i];
        const v1 = currentRoute[j];
        const v2 = currentRoute[j + 1];

        const currentDist = distMatrix[u1][u2] + distMatrix[v1][v2];
        const newDist = distMatrix[u1][v1] + distMatrix[u2][v2];

        if (newDist < currentDist - 1e-4) {
          // Reverse segment from i to j
          const segment = currentRoute.slice(i, j + 1).reverse();
          currentRoute = [
            ...currentRoute.slice(0, i),
            ...segment,
            ...currentRoute.slice(j + 1),
          ];
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return currentRoute;
}

export function solveCapacitatedVrp(params: VrpSolverParams): VrpSolverResult {
  const vehicleClass = params.vehicleClass || params.vehicleType || 'VAN';
  const capacityLimitKg =
    params.customCapacityKg && params.customCapacityKg > 0
      ? params.customCapacityKg
      : VEHICLE_CAPACITIES_KG[vehicleClass] || 1000;

  // Origin / Depot (Node 0)
  const defaultDepot = {
    id: 'DEPOT-0',
    name: 'Jaipur Regional Warehousing Hub',
    lat: 26.9124,
    lng: 75.7873,
  };

  const rawOrigin = params.origin;
  const depot = {
    id: rawOrigin?.id || defaultDepot.id,
    name: rawOrigin?.name || defaultDepot.name,
    lat: rawOrigin?.lat ?? defaultDepot.lat,
    lng: rawOrigin?.lng ?? rawOrigin?.lon ?? defaultDepot.lng,
  };

  // Waypoints / Customer Stops (Nodes 1 to N)
  const rawWaypoints = params.waypoints || params.stops || [];
  const normalizedStops = rawWaypoints.map((w, idx) => ({
    id: w.id || `STOP-${idx + 1}`,
    name: w.name || `Waypoint ${idx + 1}`,
    lat: w.lat,
    lng: w.lng ?? w.lon ?? 0,
    payloadKg: Math.max(0, w.payloadKg ?? w.quantityKg ?? 0),
    type: w.type || 'DROPOFF',
    address: w.address,
    contactName: w.contactName,
    contactPhone: w.contactPhone,
  }));

  if (normalizedStops.length === 0) {
    return {
      success: true,
      vehicleClass,
      capacityLimitKg,
      totalPayloadKg: 0,
      capacityUtilizationPercent: 0,
      routes: [],
      totalDistanceKm: 0,
      baselineDistanceKm: 0,
      distanceSavedKm: 0,
      fuelSavedLiters: 0,
      co2AvertedKg: 0,
      isMultiVehicle: false,
      origin: depot,
      orderedStops: [],
      estimatedDurationMinutes: 0,
      isOverloaded: false,
      timestamp: new Date().toISOString(),
    };
  }

  const allNodes = [depot, ...normalizedStops];
  const numNodes = allNodes.length;
  const numStops = normalizedStops.length;

  // Build Distance Matrix (N+1 x N+1)
  let distMatrix: number[][];
  if (
    params.distanceMatrix &&
    params.distanceMatrix.length >= numNodes &&
    params.distanceMatrix.every((row) => row.length >= numNodes)
  ) {
    distMatrix = params.distanceMatrix.map((row) => row.slice(0, numNodes));
  } else {
    distMatrix = Array.from({ length: numNodes }, () => new Array(numNodes).fill(0));
    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        if (i === j) {
          distMatrix[i][j] = 0;
        } else {
          distMatrix[i][j] = calculateHaversineDistance(
            allNodes[i].lat,
            allNodes[i].lng,
            allNodes[j].lat,
            allNodes[j].lng
          );
        }
      }
    }
  }

  // Calculate Unoptimized Baseline (Sequential Direct Round-Trips: Depot -> i -> Depot)
  let baselineDistanceKm = 0;
  for (let i = 1; i <= numStops; i++) {
    baselineDistanceKm += distMatrix[0][i] + distMatrix[i][0];
  }
  baselineDistanceKm = Number(baselineDistanceKm.toFixed(2));

  // Clarke-Wright Savings Algorithm
  // 1. Initial independent routes: for each customer i, Route_i = [0, i, 0]
  interface SubRoute {
    nodes: number[]; // e.g. [1, 3, 4] (excluding depot 0)
    load: number;
  }

  const subRoutes: SubRoute[] = [];
  for (let i = 1; i <= numStops; i++) {
    subRoutes.push({
      nodes: [i],
      load: normalizedStops[i - 1].payloadKg,
    });
  }

  // 2. Compute Savings S(i, j) = D(0, i) + D(0, j) - D(i, j) for all 1 <= i < j <= numStops
  interface SavingsPair {
    i: number;
    j: number;
    saving: number;
  }

  const savings: SavingsPair[] = [];
  for (let i = 1; i <= numStops; i++) {
    for (let j = i + 1; j <= numStops; j++) {
      const s = distMatrix[0][i] + distMatrix[0][j] - distMatrix[i][j];
      savings.push({ i, j, saving: s });
    }
  }

  // Sort descending by savings
  savings.sort((a, b) => b.saving - a.saving);

  // 3. Iteratively merge routes if capacity constraint holds and nodes are exterior
  for (const pair of savings) {
    const { i, j } = pair;

    let routeAIndex = -1;
    let routeBIndex = -1;

    for (let r = 0; r < subRoutes.length; r++) {
      if (subRoutes[r].nodes.includes(i)) routeAIndex = r;
      if (subRoutes[r].nodes.includes(j)) routeBIndex = r;
    }

    if (routeAIndex === -1 || routeBIndex === -1 || routeAIndex === routeBIndex) {
      continue;
    }

    const routeA = subRoutes[routeAIndex];
    const routeB = subRoutes[routeBIndex];

    // Capacity constraint check
    if (routeA.load + routeB.load > capacityLimitKg) {
      continue;
    }

    // Check if i and j are endpoints
    const iIsFirst = routeA.nodes[0] === i;
    const iIsLast = routeA.nodes[routeA.nodes.length - 1] === i;
    const jIsFirst = routeB.nodes[0] === j;
    const jIsLast = routeB.nodes[routeB.nodes.length - 1] === j;

    if ((!iIsFirst && !iIsLast) || (!jIsFirst && !jIsLast)) {
      continue;
    }

    let mergedNodes: number[] = [];

    if (iIsLast && jIsFirst) {
      mergedNodes = [...routeA.nodes, ...routeB.nodes];
    } else if (iIsFirst && jIsLast) {
      mergedNodes = [...routeB.nodes, ...routeA.nodes];
    } else if (iIsFirst && jIsFirst) {
      mergedNodes = [...routeA.nodes.slice().reverse(), ...routeB.nodes];
    } else if (iIsLast && jIsLast) {
      mergedNodes = [...routeA.nodes, ...routeB.nodes.slice().reverse()];
    }

    if (mergedNodes.length > 0) {
      routeA.nodes = mergedNodes;
      routeA.load += routeB.load;
      subRoutes.splice(routeBIndex, 1);
    }
  }

  // 4. Refine Each Route with 2-Opt and Compute Stop-by-Stop Metrics
  const vehicleTours: VehicleTour[] = [];
  let totalOptimizedDistance = 0;
  let totalPayloadKg = 0;

  for (let idx = 0; idx < subRoutes.length; idx++) {
    const subRoute = subRoutes[idx];
    const rawCycle = [0, ...subRoute.nodes, 0];
    const refinedCycle = refineRoute2Opt(rawCycle, distMatrix);

    let tourDistance = 0;
    let runningLoad = 0;
    const stopsList: OptimizedStop[] = [];

    for (let s = 1; s < refinedCycle.length - 1; s++) {
      const nodeIndex = refinedCycle[s];
      const nextNodeIndex = refinedCycle[s + 1];
      const stopInfo = normalizedStops[nodeIndex - 1];

      runningLoad += stopInfo.payloadKg;
      const legDist = distMatrix[nodeIndex][nextNodeIndex];
      tourDistance += distMatrix[refinedCycle[s - 1]][nodeIndex];

      // Estimated duration: 42 km/h average rural-to-mandi transit + 15 min handling per stop
      const legDurationMinutes = Math.round((legDist / 42) * 60 + 15);

      stopsList.push({
        id: stopInfo.id,
        name: stopInfo.name,
        lat: stopInfo.lat,
        lng: stopInfo.lng,
        payloadKg: stopInfo.payloadKg,
        cumulativeLoadKg: runningLoad,
        distanceToNextKm: Number(legDist.toFixed(2)),
        durationToNextMinutes: legDurationMinutes,
        type: stopInfo.type,
        address: stopInfo.address,
        contactName: stopInfo.contactName,
        contactPhone: stopInfo.contactPhone,
      });
    }

    // Add return leg to depot distance
    const lastNode = refinedCycle[refinedCycle.length - 2];
    tourDistance += distMatrix[lastNode][0];
    tourDistance = Number(tourDistance.toFixed(2));

    const totalDurationMinutes = Math.round((tourDistance / 42) * 60 + stopsList.length * 15);

    vehicleTours.push({
      vehicleId: idx + 1,
      stops: stopsList,
      distanceKm: tourDistance,
      durationMinutes: totalDurationMinutes,
      payloadKg: subRoute.load,
    });

    totalOptimizedDistance += tourDistance;
    totalPayloadKg += subRoute.load;
  }

  totalOptimizedDistance = Number(totalOptimizedDistance.toFixed(2));
  const distanceSavedKm = Number(Math.max(0, baselineDistanceKm - totalOptimizedDistance).toFixed(2));
  const fuelRate = FUEL_CONSUMPTION_L_PER_KM[vehicleClass] || 0.12;
  const fuelSavedLiters = Number((distanceSavedKm * fuelRate).toFixed(2));
  const co2AvertedKg = Number((fuelSavedLiters * CO2_KG_PER_LITER_DIESEL).toFixed(2));

  const totalCapacityProvided = capacityLimitKg * vehicleTours.length;
  const capacityUtilizationPercent =
    totalCapacityProvided > 0
      ? Number(((totalPayloadKg / totalCapacityProvided) * 100).toFixed(1))
      : 0;

  // Flatten ordered stops from all vehicle tours for single-glance manifest presentation
  const allOrderedStops = vehicleTours.flatMap((vt) => vt.stops);
  const totalEstDurationMinutes = vehicleTours.reduce((sum, vt) => sum + vt.durationMinutes, 0);

  return {
    success: true,
    vehicleClass,
    capacityLimitKg,
    totalPayloadKg,
    capacityUtilizationPercent,
    routes: vehicleTours,
    totalDistanceKm: totalOptimizedDistance,
    baselineDistanceKm,
    distanceSavedKm,
    fuelSavedLiters,
    co2AvertedKg,
    isMultiVehicle: vehicleTours.length > 1,
    unoptimizedDistanceKm: baselineDistanceKm,
    co2SavedKg: co2AvertedKg,
    origin: depot,
    orderedStops: allOrderedStops,
    estimatedDurationMinutes: totalEstDurationMinutes,
    isOverloaded: totalPayloadKg > totalCapacityProvided,
    timestamp: new Date().toISOString(),
  };
}
