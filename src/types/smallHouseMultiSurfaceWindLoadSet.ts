import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import type {
  SmallHouseSurfaceWindActionInput,
  SmallHouseSurfaceWindActionResult,
} from "./smallHouseSurfaceWindAction";
import type { SmallHouseWindStage } from "./smallHouseWind";

export const SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION = "0.1.0" as const;

export interface SmallHouseMultiSurfaceWindLoadSetInput {
  schemaVersion: typeof SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION;
  surfaceActions: SmallHouseSurfaceWindActionInput[];
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type SmallHouseMultiSurfaceWindLoadSetState =
  | "blocked_insufficient_surfaces"
  | "blocked_duplicate_surface"
  | "blocked_surface_action"
  | "analytical_ready";

export interface SmallHouseMultiSurfaceWindLoadSetResult {
  schemaVersion: typeof SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  stage: SmallHouseWindStage;
  state: SmallHouseMultiSurfaceWindLoadSetState;
  canCalculate: boolean;
  structuralResult: "N/A";
  reason: string;
  /** Sorted by stable surface component ID; array order is not engineering meaning. */
  surfaceResults: SmallHouseSurfaceWindActionResult[];
  failedSurfaceComponentId: string | null;
  failureMessage: string | null;
  /** Pure algebraic sum of explicit single-surface global force vectors only. */
  globalForceVectorSumN: GenesisVector3 | null;
  /** Pure Euclidean magnitude of globalForceVectorSumN; not a reaction or demand. */
  resultantForceMagnitudeN: number | null;
  downstreamMechanics: {
    reactionN: null;
    baseShearN: null;
    upliftReactionN: null;
    slidingReactionN: null;
    rackingDemand: null;
    connectionDemandN: null;
    momentTorqueNm: null;
    loadPathDistribution: null;
    passFail: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
