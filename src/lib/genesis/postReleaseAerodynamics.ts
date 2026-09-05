import type { GenesisVector3 } from "../../types/genesis";
import type {
  GenesisPostReleaseAerodynamicGateResult,
  GenesisPostReleaseAerodynamicInput,
  GenesisPostReleaseAerodynamicResult,
} from "../../types/genesisAerodynamics";
import { GENESIS_POST_RELEASE_AERO_SCHEMA_VERSION } from "../../types/genesisAerodynamics";
import type { GenesisDebrisDynamicsGateResult } from "../../types/genesis";

function validateOptionalFinite(
  name: string,
  value: number | null,
  predicate: (value: number) => boolean,
  constraint: string,
): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number when supplied`);
  }
  if (!predicate(value)) {
    throw new Error(`${name} ${constraint}`);
  }
  return value;
}

function validateOptionalVector(name: string, vector: GenesisVector3 | null): GenesisVector3 | null {
  if (vector === null) return null;
  for (const [axis, value] of Object.entries(vector)) {
    if (!Number.isFinite(value)) {
      throw new Error(`${name}.${axis} must be a finite number when supplied`);
    }
  }
  return vector;
}

function magnitude(vector: GenesisVector3): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function scale(vector: GenesisVector3, factor: number): GenesisVector3 {
  return {
    x: vector.x * factor,
    y: vector.y * factor,
    z: vector.z * factor,
  };
}

export function assessGenesisPostReleaseAerodynamicGate(
  dynamicsGate: GenesisDebrisDynamicsGateResult,
  input: GenesisPostReleaseAerodynamicInput,
): GenesisPostReleaseAerodynamicGateResult {
  const intervalSeconds = validateOptionalFinite(
    "intervalSeconds",
    input.intervalSeconds,
    (value) => value > 0,
    "must be greater than zero",
  );
  const airDensityKgPerM3 = validateOptionalFinite(
    "airDensityKgPerM3",
    input.airDensityKgPerM3,
    (value) => value > 0,
    "must be greater than zero",
  );
  const relativeAirVelocityMps = validateOptionalVector(
    "relativeAirVelocityMps",
    input.relativeAirVelocityMps,
  );
  const projectedAreaM2 = validateOptionalFinite(
    "projectedAreaM2",
    input.projectedAreaM2,
    (value) => value > 0,
    "must be greater than zero",
  );
  const dragCoefficient = validateOptionalFinite(
    "dragCoefficient",
    input.dragCoefficient,
    (value) => value >= 0,
    "must be greater than or equal to zero",
  );

  const bodyId = input.bodyId.trim();
  const sourceNote = input.sourceNote.trim();

  const base = {
    schemaVersion: GENESIS_POST_RELEASE_AERO_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical" as const,
    bodyId,
    intervalSeconds,
    airDensityKgPerM3,
    relativeAirVelocityMps,
    projectedAreaM2,
    dragCoefficient,
    provenance: {
      sourceNote,
      verificationState: input.verificationState,
    },
    upstream: {
      dynamicsState: dynamicsGate.state,
    },
  };

  if (!dynamicsGate.canSimulate || dynamicsGate.state !== "simulation_ready") {
    return {
      ...base,
      state: "blocked_dynamics_not_ready",
      canCalculate: false,
      reason:
        "Post-release aerodynamics are blocked until the explicit debris-dynamics gate is simulation_ready.",
    };
  }

  if (bodyId === "") {
    return {
      ...base,
      state: "blocked_body_id_missing",
      canCalculate: false,
      reason: "Body identity is missing; RPE will not apply an anonymous aerodynamic load.",
    };
  }

  if (sourceNote === "") {
    return {
      ...base,
      state: "blocked_source_note_missing",
      canCalculate: false,
      reason: "Aerodynamic provenance/source note is missing.",
    };
  }

  if (intervalSeconds === null) {
    return {
      ...base,
      state: "blocked_interval_missing",
      canCalculate: false,
      reason:
        "Integration interval is missing; RPE will not convert force to impulse without an explicit duration.",
    };
  }

  if (airDensityKgPerM3 === null) {
    return {
      ...base,
      state: "blocked_air_density_missing",
      canCalculate: false,
      reason: "Post-release air density is missing; it is not inherited silently from pre-release wind input.",
    };
  }

  if (relativeAirVelocityMps === null) {
    return {
      ...base,
      state: "blocked_relative_air_velocity_missing",
      canCalculate: false,
      reason:
        "Relative airflow vector is missing; RPE will not infer it from the pre-release hazard or body velocity.",
    };
  }

  if (projectedAreaM2 === null) {
    return {
      ...base,
      state: "blocked_projected_area_missing",
      canCalculate: false,
      reason:
        "Projected area is missing; RPE will not infer a post-release orientation/area from the original attached panel.",
    };
  }

  if (dragCoefficient === null) {
    return {
      ...base,
      state: "blocked_drag_coefficient_missing",
      canCalculate: false,
      reason: "Drag coefficient is missing; no aerodynamic coefficient is invented.",
    };
  }

  return {
    ...base,
    state: "aerodynamic_ready",
    canCalculate: true,
    reason:
      "All simplified post-release aerodynamic inputs are explicit. A quasi-steady drag force and constant-force impulse may be calculated as RPE analytical evidence.",
  };
}

export function calculateGenesisPostReleaseAerodynamics(
  gate: GenesisPostReleaseAerodynamicGateResult,
): GenesisPostReleaseAerodynamicResult {
  if (
    !gate.canCalculate ||
    gate.state !== "aerodynamic_ready" ||
    gate.intervalSeconds === null ||
    gate.airDensityKgPerM3 === null ||
    gate.relativeAirVelocityMps === null ||
    gate.projectedAreaM2 === null ||
    gate.dragCoefficient === null
  ) {
    throw new Error("Post-release aerodynamic calculation requires an aerodynamic_ready gate");
  }

  const relativeAirSpeedMps = magnitude(gate.relativeAirVelocityMps);
  const dynamicPressurePa = 0.5 * gate.airDensityKgPerM3 * relativeAirSpeedMps ** 2;
  const dragForceMagnitudeN = dynamicPressurePa * gate.projectedAreaM2 * gate.dragCoefficient;

  const directionScale = relativeAirSpeedMps === 0 ? 0 : dragForceMagnitudeN / relativeAirSpeedMps;
  const dragForceN = scale(gate.relativeAirVelocityMps, directionScale);
  const constantForceImpulseNs = scale(dragForceN, gate.intervalSeconds);

  return {
    schemaVersion: GENESIS_POST_RELEASE_AERO_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    bodyId: gate.bodyId,
    intervalSeconds: gate.intervalSeconds,
    relativeAirSpeedMps,
    dynamicPressurePa,
    dragForceMagnitudeN,
    dragForceN,
    constantForceImpulseNs,
    assumptions: {
      relativeAirVelocityConvention: "air_relative_to_body",
      airDensityKgPerM3: gate.airDensityKgPerM3,
      projectedAreaM2: gate.projectedAreaM2,
      dragCoefficient: gate.dragCoefficient,
      forceHeldConstantOverInterval: true,
    },
    provenance: gate.provenance,
  };
}
