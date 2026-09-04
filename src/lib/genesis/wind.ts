import {
  GENESIS_SCHEMA_VERSION,
  type GenesisAnalyticalWindResult,
  type GenesisConnectionAssessment,
  type GenesisConnectionInput,
  type GenesisPanelInput,
  type GenesisWindInput,
} from "../../types/genesis";

function requireFinite(name: string, value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  return value;
}

function requireNonNegative(name: string, value: number): number {
  requireFinite(name, value);
  if (value < 0) {
    throw new Error(`${name} must be greater than or equal to zero`);
  }
  return value;
}

function requirePositive(name: string, value: number): number {
  requireFinite(name, value);
  if (value <= 0) {
    throw new Error(`${name} must be greater than zero`);
  }
  return value;
}

export function kphToMps(speedKph: number): number {
  return requireNonNegative("speedKph", speedKph) / 3.6;
}

export function calculateDynamicPressurePa(
  speedMps: number,
  airDensityKgPerM3: number,
): number {
  const speed = requireNonNegative("speedMps", speedMps);
  const density = requirePositive("airDensityKgPerM3", airDensityKgPerM3);
  return 0.5 * density * speed * speed;
}

export function calculatePanelWindForceN(
  dynamicPressurePa: number,
  exposedAreaM2: number,
  pressureCoefficient: number,
): number {
  const pressure = requireNonNegative("dynamicPressurePa", dynamicPressurePa);
  const area = requireNonNegative("exposedAreaM2", exposedAreaM2);
  const coefficient = requireFinite("pressureCoefficient", pressureCoefficient);
  return pressure * area * coefficient;
}

export function calculateAnalyticalPanelWind(
  wind: GenesisWindInput,
  panel: GenesisPanelInput,
): GenesisAnalyticalWindResult {
  const speedMps = kphToMps(wind.speedKph);
  const directionDegrees = requireFinite("directionDegrees", wind.directionDegrees);
  const dynamicPressurePa = calculateDynamicPressurePa(
    speedMps,
    wind.airDensityKgPerM3,
  );
  const panelForceN = calculatePanelWindForceN(
    dynamicPressurePa,
    panel.exposedAreaM2,
    panel.pressureCoefficient,
  );

  return {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    speedMps,
    dynamicPressurePa,
    panelForceN,
    assumptions: {
      directionDegrees,
      airDensityKgPerM3: wind.airDensityKgPerM3,
      exposedAreaM2: panel.exposedAreaM2,
      pressureCoefficient: panel.pressureCoefficient,
    },
  };
}

export function assessConnectionDemand(
  demandN: number,
  connection: GenesisConnectionInput,
): GenesisConnectionAssessment {
  const demand = Math.abs(requireFinite("demandN", demandN));

  if (connection.capacityN === null) {
    return { demandN: demand, capacityN: null, state: "unverified" };
  }

  const capacity = requireNonNegative("capacityN", connection.capacityN);
  return {
    demandN: demand,
    capacityN: capacity,
    state: demand > capacity ? "exceeded" : "within_capacity",
  };
}
