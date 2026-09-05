import type { GenesisVerificationState } from "./genesis";
import type {
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION = "0.1.0" as const;

export type PrimarySupportLongitudinalAxis = "local_x" | "local_y" | "local_z";
export type PrimarySupportDofState = "free" | "restrained";

export interface PrimarySupportRestraintDofs {
  ux: PrimarySupportDofState;
  uy: PrimarySupportDofState;
  uz: PrimarySupportDofState;
  rx: PrimarySupportDofState;
  ry: PrimarySupportDofState;
  rz: PrimarySupportDofState;
}

export interface PrimarySupportEndRestraintInput {
  endLabel: string;
  dofs: PrimarySupportRestraintDofs;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

/**
 * A scalar engineering property remains unknown when value is null.
 * When a value is supplied, provenance and verification state are mandatory.
 */
export interface PrimarySupportScalarPropertyInput {
  value: number | null;
  sourceNote: string | null;
  verificationState: GenesisVerificationState | null;
}

/**
 * Strength data are preserved as labeled evidence only in this readiness gate.
 * No strength datum is interpreted as a governing capacity until a later,
 * explicitly defined mechanics model says how that datum is used.
 */
export interface PrimarySupportStrengthDatumInput {
  id: string;
  label: string;
  valuePa: number;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface PrimarySupportMechanicsReadinessInput {
  schemaVersion: typeof PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION;
  supportComponentId: string;
  longitudinalAxis: PrimarySupportLongitudinalAxis;
  endA: PrimarySupportEndRestraintInput;
  endB: PrimarySupportEndRestraintInput;
  axialElasticModulusPa: PrimarySupportScalarPropertyInput;
  sectionAreaM2: PrimarySupportScalarPropertyInput;
  principalSecondMoment1M4: PrimarySupportScalarPropertyInput;
  principalSecondMoment2M4: PrimarySupportScalarPropertyInput;
  strengthData: PrimarySupportStrengthDatumInput[];
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type PrimarySupportMechanicsReadinessState =
  | "blocked_stage_before_primary_supports"
  | "blocked_support_not_active"
  | "blocked_not_primary_support"
  | "review_ready_with_unknowns"
  | "review_ready";

export interface PrimarySupportMechanicsReadinessResult {
  schemaVersion: typeof PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: PrimarySupportMechanicsReadinessState;
  canReview: boolean;
  /**
   * Deliberately false for this contract. A later calculation contract must
   * introduce loads, mechanics idealization, equations/solver basis, and the
   * outputs it is authorized to compute.
   */
  calculationAvailable: false;
  structuralResult: "N/A";
  reason: string;
  support: SmallHouseStructuralComponentInput | null;
  longitudinalAxis: PrimarySupportLongitudinalAxis;
  endA: PrimarySupportEndRestraintInput;
  endB: PrimarySupportEndRestraintInput;
  axialElasticModulusPa: PrimarySupportScalarPropertyInput;
  sectionAreaM2: PrimarySupportScalarPropertyInput;
  principalSecondMoment1M4: PrimarySupportScalarPropertyInput;
  principalSecondMoment2M4: PrimarySupportScalarPropertyInput;
  strengthData: PrimarySupportStrengthDatumInput[];
  unknownFields: string[];
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
