import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import type { SmallHouseWindStage } from "./smallHouseWind";

export const SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION = "0.1.0" as const;

export type SmallHouseStructuralCoordinateBasis = "global_cartesian_xyz_m";

export interface SmallHouseStructuralLoadCaseAdapterInput {
  schemaVersion: typeof SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION;
  surfaceComponentId: string;
  loadCaseId: string;
  solverNodeId: string;
  solverNodeGlobalM: GenesisVector3;
  coordinateBasis: SmallHouseStructuralCoordinateBasis;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type SmallHouseStructuralLoadCaseAdapterState =
  | "blocked_application_mapping"
  | "blocked_moment_result"
  | "blocked_source_snapshot_mismatch"
  | "blocked_surface_mismatch"
  | "blocked_node_reference_mismatch"
  | "mapping_ready";

export interface SmallHouseStructuralLoadCaseAdapterResult {
  schemaVersion: typeof SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION;
  evidenceLayer: "solver_input_mapping";
  stage: SmallHouseWindStage;
  state: SmallHouseStructuralLoadCaseAdapterState;
  canMap: boolean;
  structuralResult: "N/A";
  reason: string;
  surfaceComponentId: string | null;
  loadCaseId: string | null;
  solverNodeId: string | null;
  solverNodeGlobalM: GenesisVector3 | null;
  coordinateBasis: SmallHouseStructuralCoordinateBasis | null;
  sourceForceVectorN: GenesisVector3 | null;
  sourceApplicationPointGlobalM: GenesisVector3 | null;
  sourceForceMomentVectorNm: GenesisVector3 | null;
  sourceMomentReferencePointGlobalM: GenesisVector3 | null;
  mappedNodalLoad: {
    forceVectorN: GenesisVector3;
    momentVectorNm: GenesisVector3;
  } | null;
  solverResponse: {
    reactionsN: null;
    displacementsM: null;
    rotationsRad: null;
    memberForces: null;
    connectionDemands: null;
    baseShearN: null;
    rackingResponse: null;
    passFail: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
