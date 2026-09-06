import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import type { SmallHouseStructuralLoadCaseAdapterResult } from "./smallHouseStructuralLoadCaseAdapter";

export const SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export type SmallHouseStructuralSolverTarget = "openseespy";
export type SmallHouseStructuralAnalysisIntent = "linear_static_3d";
export type SmallHouseStructuralUnitSystem = "SI_N_m_Pa";
export type SmallHouseStructuralDofState = "fixed" | "free";
export type SmallHouseStructuralElementFormulation = "elastic_beam_column_3d";

export interface SmallHouseStructuralNodeRestraints {
  ux: SmallHouseStructuralDofState;
  uy: SmallHouseStructuralDofState;
  uz: SmallHouseStructuralDofState;
  rx: SmallHouseStructuralDofState;
  ry: SmallHouseStructuralDofState;
  rz: SmallHouseStructuralDofState;
}

export interface SmallHouseStructuralNodeInput {
  id: string;
  globalM: GenesisVector3;
  restraints: SmallHouseStructuralNodeRestraints;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseElasticBeamColumn3dProperties {
  materialId: string;
  sectionId: string;
  areaM2: number;
  elasticModulusPa: number;
  shearModulusPa: number;
  iyM4: number;
  izM4: number;
  torsionConstantM4: number;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseStructuralElementInput {
  id: string;
  formulation: SmallHouseStructuralElementFormulation;
  nodeIId: string;
  nodeJId: string;
  /**
   * Explicit unit local-y direction in global coordinates.
   * It must be perpendicular to the element longitudinal axis. RPE does not infer
   * this direction from rendered geometry.
   */
  localYDirectionGlobal: GenesisVector3;
  properties: SmallHouseElasticBeamColumn3dProperties;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseStructuralLoadCaseInput {
  id: string;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseStructuralModelInput {
  schemaVersion: typeof SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION;
  modelId: string;
  intendedSolver: SmallHouseStructuralSolverTarget;
  analysisIntent: SmallHouseStructuralAnalysisIntent;
  coordinateBasis: "global_cartesian_xyz_m";
  unitSystem: SmallHouseStructuralUnitSystem;
  nodes: SmallHouseStructuralNodeInput[];
  elements: SmallHouseStructuralElementInput[];
  loadCases: SmallHouseStructuralLoadCaseInput[];
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type SmallHouseStructuralModelReadinessState =
  | "blocked_adapter_evidence"
  | "blocked_adapter_node_missing"
  | "blocked_adapter_load_case_missing"
  | "blocked_adapter_node_coordinate_mismatch"
  | "solver_model_ready";

export interface SmallHouseStructuralModelReadinessResult {
  schemaVersion: typeof SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION;
  evidenceLayer: "solver_input_model_review";
  state: SmallHouseStructuralModelReadinessState;
  canExecuteSolver: boolean;
  structuralResult: "N/A";
  solverExecuted: false;
  reason: string;
  modelId: string | null;
  intendedSolver: SmallHouseStructuralSolverTarget | null;
  analysisIntent: SmallHouseStructuralAnalysisIntent | null;
  coordinateBasis: "global_cartesian_xyz_m" | null;
  unitSystem: SmallHouseStructuralUnitSystem | null;
  nodes: SmallHouseStructuralNodeInput[];
  elements: SmallHouseStructuralElementInput[];
  loadCases: SmallHouseStructuralLoadCaseInput[];
  acceptedMappedLoad: {
    loadCaseId: string;
    solverNodeId: string;
    solverNodeGlobalM: GenesisVector3;
    forceVectorN: GenesisVector3;
    momentVectorNm: GenesisVector3;
  } | null;
  sourceAdapterEvidence: Pick<
    SmallHouseStructuralLoadCaseAdapterResult,
    "schemaVersion" | "evidenceLayer" | "surfaceComponentId" | "loadCaseId" | "solverNodeId"
  > | null;
  solverResponse: {
    reactions: null;
    displacementsM: null;
    rotationsRad: null;
    elementForces: null;
    baseShearN: null;
    connectionDemands: null;
    rackingResponse: null;
    capacityUtilization: null;
    passFail: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
