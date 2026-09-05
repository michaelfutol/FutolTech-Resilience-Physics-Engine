import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import type { SmallHouseWindStage } from "./smallHouseWind";

export const SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION = "0.1.0" as const;

export interface SmallHouseSurfaceForceApplicationPointInput {
  schemaVersion: typeof SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION;
  surfaceComponentId: string;
  applicationPointGlobalM: GenesisVector3;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type SmallHouseSurfaceForceApplicationPointState =
  | "blocked_source_action"
  | "blocked_source_snapshot_mismatch"
  | "blocked_surface_mismatch"
  | "mapping_ready";

export interface SmallHouseSurfaceForceApplicationPointResult {
  schemaVersion: typeof SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  stage: SmallHouseWindStage;
  state: SmallHouseSurfaceForceApplicationPointState;
  canMap: boolean;
  structuralResult: "N/A";
  reason: string;
  surfaceComponentId: string | null;
  sourceForceVectorN: GenesisVector3 | null;
  applicationPointGlobalM: GenesisVector3 | null;
  applicationPointBasis: "caller_declared_global_point" | null;
  inferredApplicationPointGlobalM: null;
  centerOfPressureGlobalM: null;
  solverNodeId: null;
  downstreamMechanics: {
    momentTorqueNm: null;
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
