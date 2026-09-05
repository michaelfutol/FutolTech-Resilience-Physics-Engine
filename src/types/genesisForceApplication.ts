import type {
  GenesisDebrisDynamicsGateResult,
  GenesisVector3,
  GenesisVerificationState,
} from "./genesis";
import type {
  GenesisPostReleaseAerodynamicGateResult,
  GenesisPostReleaseAerodynamicResult,
} from "./genesisAerodynamics";

export const GENESIS_FORCE_APPLICATION_SCHEMA_VERSION = "0.1.0" as const;

export interface GenesisAerodynamicForceApplicationInput {
  /** Explicit opt-in. Aerodynamic analytical output is never applied automatically. */
  enabled: boolean;
  bodyId: string;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type GenesisAerodynamicForceApplicationGateState =
  | "blocked_not_enabled"
  | "blocked_dynamics_not_ready"
  | "blocked_aerodynamics_not_ready"
  | "blocked_body_id_missing"
  | "blocked_body_mismatch"
  | "blocked_source_note_missing"
  | "force_application_ready";

export interface GenesisAerodynamicForceApplicationGateResult {
  schemaVersion: typeof GENESIS_FORCE_APPLICATION_SCHEMA_VERSION;
  evidenceLayer: "rpe_simulation";
  state: GenesisAerodynamicForceApplicationGateState;
  canApply: boolean;
  bodyId: string;
  reason: string;
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
  upstream: {
    dynamicsState: GenesisDebrisDynamicsGateResult["state"];
    aerodynamicGateState: GenesisPostReleaseAerodynamicGateResult["state"] | "missing";
    aerodynamicBodyId: string | null;
  };
}

/**
 * A deterministic application plan only. Creating this object does not mutate
 * Rapier or advance simulation time.
 */
export interface GenesisAerodynamicForceApplicationPlan {
  schemaVersion: typeof GENESIS_FORCE_APPLICATION_SCHEMA_VERSION;
  evidenceLayer: "rpe_simulation";
  bodyId: string;
  applicationMode: "center_of_mass_constant_force";
  startOffsetSeconds: 0;
  durationSeconds: number;
  forceN: GenesisVector3;
  /** No torque is inferred in the first post-release model. */
  torqueNm: null;
  sourceAerodynamicResult: {
    schemaVersion: GenesisPostReleaseAerodynamicResult["schemaVersion"];
    evidenceLayer: GenesisPostReleaseAerodynamicResult["evidenceLayer"];
    relativeAirSpeedMps: number;
    dragForceMagnitudeN: number;
  };
  assumptions: {
    forceHeldConstantOverDeclaredInterval: true;
    applicationPoint: "center_of_mass";
    aerodynamicTorqueModeled: false;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
