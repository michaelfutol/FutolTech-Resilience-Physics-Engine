import type { GenesisVerificationState } from "./genesis";
import type {
  PrimarySupportLongitudinalAxis,
  PrimarySupportMechanicsReadinessResult,
} from "./primarySupportMechanics";

export const PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION = "0.1.0" as const;

export type PrimarySupportPrincipalBendingProperty = "principal_1" | "principal_2";

export interface PrimarySupportCantileverTipLoadInput {
  /**
   * Signed scalar transverse point load in the explicitly selected benchmark
   * bending plane. Positive/negative controls the sign of calculated
   * deflection only; support-demand outputs are reported as magnitudes to
   * avoid implying an unstated global-axis sign convention.
   */
  signedTipLoadN: number;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface PrimarySupportCantileverInput {
  schemaVersion: typeof PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION;
  readiness: PrimarySupportMechanicsReadinessResult;
  bendingProperty: PrimarySupportPrincipalBendingProperty;
  tipLoad: PrimarySupportCantileverTipLoadInput;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface PrimarySupportCantileverResult {
  schemaVersion: typeof PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  model: "linear_elastic_euler_bernoulli_cantilever_tip_load";
  supportComponentId: string;
  longitudinalAxis: PrimarySupportLongitudinalAxis;
  fixedEndLabel: string;
  freeEndLabel: string;
  lengthM: number;
  bendingProperty: PrimarySupportPrincipalBendingProperty;
  elasticModulusPa: number;
  secondMomentM4: number;
  signedTipLoadN: number;
  fixedEndShearMagnitudeN: number;
  fixedEndMomentMagnitudeNm: number;
  signedTipDeflectionM: number;
  equations: {
    shear: "V = |P|";
    fixedEndMoment: "M = |P|L";
    tipDeflection: "delta = PL^3/(3EI)";
  };
  assumptions: readonly [
    "isolated_prismatic_member",
    "linear_elastic_material_response",
    "small_deflection",
    "euler_bernoulli_bending",
    "no_shear_deformation",
    "no_geometric_non_linearity_or_p_delta",
    "no_connection_slip_or_joint_flexibility",
    "tip_point_load_only",
    "selected_principal_second_moment_supplied_explicitly",
    "no_strength_or_capacity_check",
    "no_whole_house_load_path_claim",
  ];
  structuralResult: "ANALYTICAL_RESPONSE_ONLY";
  capacityResult: "NOT_EVALUATED";
  provenance: {
    readinessSourceNote: string;
    readinessVerificationState: GenesisVerificationState;
    loadSourceNote: string;
    loadVerificationState: GenesisVerificationState;
    calculationSourceNote: string;
    calculationVerificationState: GenesisVerificationState;
  };
}
