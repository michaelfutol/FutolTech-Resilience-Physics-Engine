import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import type { SmallHouseWindStage } from "./smallHouseWind";

export const SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION = "0.1.0" as const;

export interface SmallHouseSurfaceForceMomentInput {
  schemaVersion: typeof SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION;
  surfaceComponentId: string;
  referencePointGlobalM: GenesisVector3;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type SmallHouseSurfaceForceMomentState =
  | "blocked_source_mapping"
  | "blocked_source_snapshot_mismatch"
  | "blocked_surface_mismatch"
  | "analytical_ready";

export interface SmallHouseSurfaceForceMomentResult {
  schemaVersion: typeof SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  stage: SmallHouseWindStage;
  state: SmallHouseSurfaceForceMomentState;
  canCalculate: boolean;
  structuralResult: "N/A";
  reason: string;
  surfaceComponentId: string | null;
  sourceForceVectorN: GenesisVector3 | null;
  applicationPointGlobalM: GenesisVector3 | null;
  referencePointGlobalM: GenesisVector3 | null;
  leverArmGlobalM: GenesisVector3 | null;
  forceMomentVectorNm: GenesisVector3 | null;
  forceMomentMagnitudeNm: number | null;
  momentBasis: "force_moment_about_caller_declared_global_reference_point" | null;
  /** No intrinsic/aerodynamic couple is defined by this contract. */
  aerodynamicTorqueNm: null;
  downstreamMechanics: {
    reactionN: null;
    baseShearN: null;
    upliftReactionN: null;
    slidingReactionN: null;
    rackingDemand: null;
    connectionDemandN: null;
    loadPathDistribution: null;
    passFail: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
