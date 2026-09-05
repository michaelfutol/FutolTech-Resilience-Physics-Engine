import type { GenesisVerificationState } from "../../types/genesis";
import type {
  PrimarySupportDofState,
  PrimarySupportEndRestraintInput,
  PrimarySupportMechanicsReadinessResult,
} from "../../types/primarySupportMechanics";
import {
  PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION,
  type PrimarySupportCantileverInput,
  type PrimarySupportCantileverResult,
} from "../../types/primarySupportCantilever";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);
const DOF_KEYS = ["ux", "uy", "uz", "rx", "ry", "rz"] as const;

function requireText(name: string, value: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} must be non-empty`);
  }
  return value;
}

function validateVerificationState(
  name: string,
  value: GenesisVerificationState,
): void {
  if (!VERIFICATION_STATES.has(value)) {
    throw new Error(`${name} must be a supported verification state`);
  }
}

function allDofsAre(
  restraint: PrimarySupportEndRestraintInput,
  state: PrimarySupportDofState,
): boolean {
  return DOF_KEYS.every((key) => restraint.dofs[key] === state);
}

function resolveCantileverEnds(readiness: PrimarySupportMechanicsReadinessResult): {
  fixedEndLabel: string;
  freeEndLabel: string;
} {
  const aFixed = allDofsAre(readiness.endA, "restrained");
  const aFree = allDofsAre(readiness.endA, "free");
  const bFixed = allDofsAre(readiness.endB, "restrained");
  const bFree = allDofsAre(readiness.endB, "free");

  if (aFixed && bFree) {
    return {
      fixedEndLabel: readiness.endA.endLabel,
      freeEndLabel: readiness.endB.endLabel,
    };
  }
  if (aFree && bFixed) {
    return {
      fixedEndLabel: readiness.endB.endLabel,
      freeEndLabel: readiness.endA.endLabel,
    };
  }

  throw new Error(
    "Cantilever benchmark requires one end with all six DOFs restrained and the other end with all six DOFs free",
  );
}

function resolveLengthM(readiness: PrimarySupportMechanicsReadinessResult): number {
  if (!readiness.support) {
    throw new Error("Cantilever benchmark requires an active primary-support component");
  }

  const { sizeM } = readiness.support;
  switch (readiness.longitudinalAxis) {
    case "local_x":
      return sizeM.x;
    case "local_y":
      return sizeM.y;
    case "local_z":
      return sizeM.z;
    default:
      throw new Error("Unsupported primary-support longitudinal axis");
  }
}

function requirePositiveProperty(name: string, value: number | null): number {
  if (value === null) {
    throw new Error(`${name} must be explicitly supplied before this analytical benchmark can run`);
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than zero`);
  }
  return value;
}

export function calculatePrimarySupportCantilever(
  input: PrimarySupportCantileverInput,
): PrimarySupportCantileverResult {
  if (input.schemaVersion !== PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported primary-support cantilever schema version: ${String(input.schemaVersion)}`,
    );
  }
  if (!input.readiness.canReview || !input.readiness.support) {
    throw new Error(
      "Primary-support cantilever calculation requires a reviewable readiness result with an active support",
    );
  }
  if (input.readiness.calculationAvailable !== false) {
    throw new Error(
      "Primary-support readiness contract has an unexpected calculation state",
    );
  }

  requireText("input.tipLoad.sourceNote", input.tipLoad.sourceNote);
  validateVerificationState(
    "input.tipLoad.verificationState",
    input.tipLoad.verificationState,
  );
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);

  if (!Number.isFinite(input.tipLoad.signedTipLoadN) || input.tipLoad.signedTipLoadN === 0) {
    throw new Error("input.tipLoad.signedTipLoadN must be a finite non-zero number");
  }

  const { fixedEndLabel, freeEndLabel } = resolveCantileverEnds(input.readiness);
  const lengthM = resolveLengthM(input.readiness);
  if (!Number.isFinite(lengthM) || lengthM <= 0) {
    throw new Error("Primary-support longitudinal length must be greater than zero");
  }

  const elasticModulusPa = requirePositiveProperty(
    "axialElasticModulusPa",
    input.readiness.axialElasticModulusPa.value,
  );
  const secondMomentM4 = requirePositiveProperty(
    input.bendingProperty === "principal_1"
      ? "principalSecondMoment1M4"
      : "principalSecondMoment2M4",
    input.bendingProperty === "principal_1"
      ? input.readiness.principalSecondMoment1M4.value
      : input.readiness.principalSecondMoment2M4.value,
  );

  const signedTipLoadN = input.tipLoad.signedTipLoadN;
  const fixedEndShearMagnitudeN = Math.abs(signedTipLoadN);
  const fixedEndMomentMagnitudeNm = Math.abs(signedTipLoadN) * lengthM;
  const signedTipDeflectionM =
    (signedTipLoadN * Math.pow(lengthM, 3)) /
    (3 * elasticModulusPa * secondMomentM4);

  if (
    !Number.isFinite(fixedEndShearMagnitudeN) ||
    !Number.isFinite(fixedEndMomentMagnitudeNm) ||
    !Number.isFinite(signedTipDeflectionM)
  ) {
    throw new Error("Primary-support cantilever calculation produced a non-finite result");
  }

  return {
    schemaVersion: PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    model: "linear_elastic_euler_bernoulli_cantilever_tip_load",
    supportComponentId: input.readiness.support.id,
    longitudinalAxis: input.readiness.longitudinalAxis,
    fixedEndLabel,
    freeEndLabel,
    lengthM,
    bendingProperty: input.bendingProperty,
    elasticModulusPa,
    secondMomentM4,
    signedTipLoadN,
    fixedEndShearMagnitudeN,
    fixedEndMomentMagnitudeNm,
    signedTipDeflectionM,
    equations: {
      shear: "V = |P|",
      fixedEndMoment: "M = |P|L",
      tipDeflection: "delta = PL^3/(3EI)",
    },
    assumptions: [
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
    ],
    structuralResult: "ANALYTICAL_RESPONSE_ONLY",
    capacityResult: "NOT_EVALUATED",
    provenance: {
      readinessSourceNote: input.readiness.provenance.sourceNote,
      readinessVerificationState: input.readiness.provenance.verificationState,
      loadSourceNote: input.tipLoad.sourceNote,
      loadVerificationState: input.tipLoad.verificationState,
      calculationSourceNote: input.sourceNote,
      calculationVerificationState: input.verificationState,
    },
  };
}
