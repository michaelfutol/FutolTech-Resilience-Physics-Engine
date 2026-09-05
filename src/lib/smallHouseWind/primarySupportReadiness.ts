import type { GenesisVerificationState } from "../../types/genesis";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseStructuralComponentInput,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";
import {
  PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
  type PrimarySupportDofState,
  type PrimarySupportEndRestraintInput,
  type PrimarySupportMechanicsReadinessInput,
  type PrimarySupportMechanicsReadinessResult,
  type PrimarySupportScalarPropertyInput,
  type PrimarySupportStrengthDatumInput,
} from "../../types/primarySupportMechanics";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);
const DOF_STATES = new Set<PrimarySupportDofState>(["free", "restrained"]);
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

function validateEndRestraint(
  name: string,
  restraint: PrimarySupportEndRestraintInput,
): void {
  requireText(`${name}.endLabel`, restraint.endLabel);
  requireText(`${name}.sourceNote`, restraint.sourceNote);
  validateVerificationState(`${name}.verificationState`, restraint.verificationState);

  for (const key of DOF_KEYS) {
    if (!DOF_STATES.has(restraint.dofs[key])) {
      throw new Error(`${name}.dofs.${key} must be free or restrained`);
    }
  }
}

function validateScalarProperty(
  name: string,
  property: PrimarySupportScalarPropertyInput,
): void {
  if (property.value === null) {
    if (property.sourceNote !== null || property.verificationState !== null) {
      throw new Error(
        `${name} provenance must remain null when the engineering value is unknown`,
      );
    }
    return;
  }

  if (!Number.isFinite(property.value) || property.value <= 0) {
    throw new Error(`${name}.value must be a finite number greater than zero when supplied`);
  }
  if (property.sourceNote === null) {
    throw new Error(`${name}.sourceNote is required when a value is supplied`);
  }
  requireText(`${name}.sourceNote`, property.sourceNote);
  if (property.verificationState === null) {
    throw new Error(`${name}.verificationState is required when a value is supplied`);
  }
  validateVerificationState(`${name}.verificationState`, property.verificationState);
}

function validateStrengthData(strengthData: PrimarySupportStrengthDatumInput[]): void {
  const ids = new Set<string>();
  for (const datum of strengthData) {
    const id = requireText("strengthData.id", datum.id);
    if (ids.has(id)) {
      throw new Error(`Duplicate primary-support strength datum ID: ${id}`);
    }
    ids.add(id);
    requireText(`strengthData[${id}].label`, datum.label);
    requireText(`strengthData[${id}].sourceNote`, datum.sourceNote);
    validateVerificationState(
      `strengthData[${id}].verificationState`,
      datum.verificationState,
    );
    if (!Number.isFinite(datum.valuePa) || datum.valuePa <= 0) {
      throw new Error(`strengthData[${id}].valuePa must be greater than zero`);
    }
  }
}

function cloneScalarProperty(
  property: PrimarySupportScalarPropertyInput,
): PrimarySupportScalarPropertyInput {
  return { ...property };
}

function cloneEndRestraint(
  restraint: PrimarySupportEndRestraintInput,
): PrimarySupportEndRestraintInput {
  return {
    ...restraint,
    dofs: { ...restraint.dofs },
  };
}

function cloneSupport(
  support: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...support,
    centerM: { ...support.centerM },
    sizeM: { ...support.sizeM },
    rotationRad: { ...support.rotationRad },
  };
}

function cloneStrengthData(
  strengthData: PrimarySupportStrengthDatumInput[],
): PrimarySupportStrengthDatumInput[] {
  return strengthData.map((datum) => ({ ...datum }));
}

function validateReadinessInput(input: PrimarySupportMechanicsReadinessInput): void {
  if (input.schemaVersion !== PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported primary-support mechanics schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.supportComponentId", input.supportComponentId);
  if (!new Set(["local_x", "local_y", "local_z"]).has(input.longitudinalAxis)) {
    throw new Error("input.longitudinalAxis must be local_x, local_y, or local_z");
  }

  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  validateEndRestraint("input.endA", input.endA);
  validateEndRestraint("input.endB", input.endB);
  if (input.endA.endLabel.trim() === input.endB.endLabel.trim()) {
    throw new Error("input.endA and input.endB must use distinct end labels");
  }

  validateScalarProperty("input.axialElasticModulusPa", input.axialElasticModulusPa);
  validateScalarProperty("input.sectionAreaM2", input.sectionAreaM2);
  validateScalarProperty(
    "input.principalSecondMoment1M4",
    input.principalSecondMoment1M4,
  );
  validateScalarProperty(
    "input.principalSecondMoment2M4",
    input.principalSecondMoment2M4,
  );
  validateStrengthData(input.strengthData);
}

function collectUnknownFields(
  support: SmallHouseStructuralComponentInput,
  input: PrimarySupportMechanicsReadinessInput,
): string[] {
  const unknowns: string[] = [];
  if (support.materialId === null) unknowns.push("support.materialId");
  if (support.massKg === null) unknowns.push("support.massKg");
  if (input.axialElasticModulusPa.value === null) {
    unknowns.push("axialElasticModulusPa");
  }
  if (input.sectionAreaM2.value === null) unknowns.push("sectionAreaM2");
  if (input.principalSecondMoment1M4.value === null) {
    unknowns.push("principalSecondMoment1M4");
  }
  if (input.principalSecondMoment2M4.value === null) {
    unknowns.push("principalSecondMoment2M4");
  }
  if (input.strengthData.length === 0) unknowns.push("strengthData");
  return unknowns;
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: PrimarySupportMechanicsReadinessInput,
) {
  return {
    schemaVersion: PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    calculationAvailable: false as const,
    structuralResult: "N/A" as const,
    longitudinalAxis: input.longitudinalAxis,
    endA: cloneEndRestraint(input.endA),
    endB: cloneEndRestraint(input.endB),
    axialElasticModulusPa: cloneScalarProperty(input.axialElasticModulusPa),
    sectionAreaM2: cloneScalarProperty(input.sectionAreaM2),
    principalSecondMoment1M4: cloneScalarProperty(input.principalSecondMoment1M4),
    principalSecondMoment2M4: cloneScalarProperty(input.principalSecondMoment2M4),
    strengthData: cloneStrengthData(input.strengthData),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessPrimarySupportMechanicsReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: PrimarySupportMechanicsReadinessInput,
): PrimarySupportMechanicsReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  validateReadinessInput(input);

  const base = baseResult(snapshot, input);

  if (snapshot.stage === "empty_envelope") {
    return {
      ...base,
      state: "blocked_stage_before_primary_supports",
      canReview: false,
      reason:
        "The selected stage contains no physical primary supports. Mechanics readiness is blocked rather than inferred from the envelope.",
      support: null,
      unknownFields: [],
    };
  }

  const selectedComponent = snapshot.components.find(
    (component) => component.id === input.supportComponentId,
  );
  if (!selectedComponent) {
    return {
      ...base,
      state: "blocked_support_not_active",
      canReview: false,
      reason:
        "The requested support component is not active in the selected validated stage snapshot.",
      support: null,
      unknownFields: [],
    };
  }

  if (selectedComponent.kind !== "primary_support") {
    return {
      ...base,
      state: "blocked_not_primary_support",
      canReview: false,
      reason:
        "The selected component exists but is not declared as a primary_support, so this mechanics readiness contract cannot reinterpret it.",
      support: cloneSupport(selectedComponent),
      unknownFields: [],
    };
  }

  const support = cloneSupport(selectedComponent);
  const unknownFields = collectUnknownFields(support, input);
  const hasUnknowns = unknownFields.length > 0;

  return {
    ...base,
    state: hasUnknowns ? "review_ready_with_unknowns" : "review_ready",
    canReview: true,
    reason: hasUnknowns
      ? "Primary-support identity, declared geometry/orientation, longitudinal axis, and end-restraint assumptions are reviewable. Mechanical/material properties remain explicitly incomplete and no reactions, displacements, stresses, buckling, capacity, or whole-house wind performance are calculated."
      : "Primary-support identity, declared geometry/orientation, longitudinal axis, end restraints, and caller-supplied property evidence are reviewable. This contract still performs no reactions, displacements, stresses, buckling, capacity, or whole-house wind calculation.",
    support,
    unknownFields,
  };
}
