import type {
  GenesisDebrisDynamicsGateResult,
  GenesisVector3,
  GenesisVerificationState,
} from "./genesis";

export const GENESIS_POST_RELEASE_AERO_SCHEMA_VERSION = "0.1.0" as const;

/**
 * Narrow caller-supplied contract for a simplified quasi-steady drag calculation
 * after rigid-body release. No value is inherited silently from the pre-release
 * panel calculation.
 */
export interface GenesisPostReleaseAerodynamicInput {
  bodyId: string;
  intervalSeconds: number | null;
  airDensityKgPerM3: number | null;
  /** Air velocity relative to the body. Force on the body follows this vector. */
  relativeAirVelocityMps: GenesisVector3 | null;
  /** Caller-supplied projected area for the current state/orientation. */
  projectedAreaM2: number | null;
  dragCoefficient: number | null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type GenesisPostReleaseAerodynamicGateState =
  | "blocked_dynamics_not_ready"
  | "blocked_body_id_missing"
  | "blocked_source_note_missing"
  | "blocked_interval_missing"
  | "blocked_air_density_missing"
  | "blocked_relative_air_velocity_missing"
  | "blocked_projected_area_missing"
  | "blocked_drag_coefficient_missing"
  | "aerodynamic_ready";

export interface GenesisPostReleaseAerodynamicGateResult {
  schemaVersion: typeof GENESIS_POST_RELEASE_AERO_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  state: GenesisPostReleaseAerodynamicGateState;
  canCalculate: boolean;
  bodyId: string;
  intervalSeconds: number | null;
  airDensityKgPerM3: number | null;
  relativeAirVelocityMps: GenesisVector3 | null;
  projectedAreaM2: number | null;
  dragCoefficient: number | null;
  reason: string;
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
  upstream: {
    dynamicsState: GenesisDebrisDynamicsGateResult["state"];
  };
}

export interface GenesisPostReleaseAerodynamicResult {
  schemaVersion: typeof GENESIS_POST_RELEASE_AERO_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  bodyId: string;
  intervalSeconds: number;
  relativeAirSpeedMps: number;
  dynamicPressurePa: number;
  dragForceMagnitudeN: number;
  dragForceN: GenesisVector3;
  /** F·Δt for the explicitly declared interval under a constant-force assumption. */
  constantForceImpulseNs: GenesisVector3;
  assumptions: {
    relativeAirVelocityConvention: "air_relative_to_body";
    airDensityKgPerM3: number;
    projectedAreaM2: number;
    dragCoefficient: number;
    forceHeldConstantOverInterval: true;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
