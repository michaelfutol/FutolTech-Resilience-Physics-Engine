import type { GenesisVerificationState } from "../../types/genesis";
import type {
  SmallHouseConnectionInput,
  SmallHouseStructuralComponentInput,
  SmallHouseWindSpecimenInput,
} from "../../types/smallHouseWind";
import {
  SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION,
  type SmallHouseControlledABComparisonInput,
  type SmallHouseControlledABComparisonResult,
  type SmallHouseControlledABInvariants,
} from "../../types/smallHouseControlledAB";
import { validateSmallHouseWindSpecimen } from "./systemContract";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);

function requireText(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${name} must be non-empty`);
  }
  return trimmed;
}

function validateVerificationState(value: GenesisVerificationState): void {
  if (!VERIFICATION_STATES.has(value)) {
    throw new Error("comparison.verificationState must be a supported verification state");
  }
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function sortedComponents(
  components: readonly SmallHouseStructuralComponentInput[],
): SmallHouseStructuralComponentInput[] {
  return [...components].sort((a, b) => a.id.localeCompare(b.id));
}

function sortedConnections(
  connections: readonly SmallHouseConnectionInput[],
): SmallHouseConnectionInput[] {
  return [...connections].sort((a, b) => a.id.localeCompare(b.id));
}

function specimenMetadata(specimen: SmallHouseWindSpecimenInput) {
  return {
    schemaVersion: specimen.schemaVersion,
    id: specimen.id,
    label: specimen.label,
    sourceNote: specimen.sourceNote,
    verificationState: specimen.verificationState,
  };
}

function componentGeometry(component: SmallHouseStructuralComponentInput) {
  return {
    id: component.id,
    kind: component.kind,
    activationStage: component.activationStage,
    centerM: component.centerM,
    sizeM: component.sizeM,
    rotationRad: component.rotationRad,
  };
}

function cloneConnection(
  connection: SmallHouseConnectionInput | null,
): SmallHouseConnectionInput | null {
  return connection ? { ...connection } : null;
}

export function compareControlledSmallHouseVariants(
  input: SmallHouseControlledABComparisonInput,
): SmallHouseControlledABComparisonResult {
  if (input.schemaVersion !== SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported controlled Small House A/B schema version: ${String(input.schemaVersion)}`,
    );
  }

  const caseALabel = requireText("comparison.caseA.label", input.caseA.label);
  const caseBLabel = requireText("comparison.caseB.label", input.caseB.label);
  const sourceNote = requireText("comparison.sourceNote", input.sourceNote);
  validateVerificationState(input.verificationState);

  if (input.declaredChange.kind !== "connection_record_added") {
    throw new Error(
      `Unsupported controlled Small House A/B change kind: ${String(input.declaredChange.kind)}`,
    );
  }
  const declaredConnectionId = requireText(
    "comparison.declaredChange.connectionId",
    input.declaredChange.connectionId,
  );

  const caseA = validateSmallHouseWindSpecimen(input.caseA.specimen);
  const caseB = validateSmallHouseWindSpecimen(input.caseB.specimen);

  const metadataUnchanged =
    stableJson(specimenMetadata(caseA)) === stableJson(specimenMetadata(caseB));
  const envelopeUnchanged = stableJson(caseA.envelope) === stableJson(caseB.envelope);

  const componentsA = sortedComponents(caseA.components);
  const componentsB = sortedComponents(caseB.components);
  const componentRecordsUnchanged = stableJson(componentsA) === stableJson(componentsB);
  const componentGeometryUnchanged =
    stableJson(componentsA.map(componentGeometry)) ===
    stableJson(componentsB.map(componentGeometry));

  const declaredInA =
    caseA.connections.find((connection) => connection.id === declaredConnectionId) ?? null;
  const declaredInB =
    caseB.connections.find((connection) => connection.id === declaredConnectionId) ?? null;

  const existingConnectionsA = sortedConnections(caseA.connections);
  const existingConnectionsB = sortedConnections(
    caseB.connections.filter((connection) => connection.id !== declaredConnectionId),
  );
  const existingConnectionRecordsUnchanged =
    stableJson(existingConnectionsA) === stableJson(existingConnectionsB);

  const declaredRecordPresentOnlyInB = declaredInA === null && declaredInB !== null;
  const onlyDeclaredConnectionAdded =
    declaredRecordPresentOnlyInB &&
    caseB.connections.length === caseA.connections.length + 1 &&
    existingConnectionRecordsUnchanged;

  const invariants: SmallHouseControlledABInvariants = {
    specimenMetadataUnchanged: metadataUnchanged,
    envelopeUnchanged,
    componentRecordsUnchanged,
    componentGeometryUnchanged,
    existingConnectionRecordsUnchanged,
    onlyDeclaredConnectionAdded,
  };

  const allUnrelatedInputsInvariant =
    invariants.specimenMetadataUnchanged &&
    invariants.envelopeUnchanged &&
    invariants.componentRecordsUnchanged &&
    invariants.componentGeometryUnchanged &&
    invariants.existingConnectionRecordsUnchanged;

  let state: SmallHouseControlledABComparisonResult["state"];
  let reason: string;

  if (!declaredRecordPresentOnlyInB) {
    state = "blocked_declared_change_not_satisfied";
    reason =
      "The declared connection-record addition is not present only in Case B. A controlled A/B comparison requires Case A to omit that exact record and Case B to add it explicitly.";
  } else if (!onlyDeclaredConnectionAdded || !allUnrelatedInputsInvariant) {
    state = "blocked_unrelated_input_difference";
    reason =
      "The declared connection record exists only in Case B, but at least one unrelated specimen input also changed. Controlled A/B review is blocked until every non-declared input is invariant.";
  } else {
    state = "controlled_input_difference";
    reason =
      "Exactly one declared connection record was added in Case B while specimen metadata, envelope, every component record and geometry, and every pre-existing connection remained invariant. This proves controlled input difference only; it does not establish improved structural performance.";
  }

  return {
    schemaVersion: SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review",
    state,
    canCompareControlledInputs: state === "controlled_input_difference",
    mechanicsAvailable: false,
    performanceComparisonAvailable: false,
    structuralResult: "N/A",
    caseA: {
      label: caseALabel,
      specimenId: caseA.id,
    },
    caseB: {
      label: caseBLabel,
      specimenId: caseB.id,
    },
    declaredChange: {
      kind: "connection_record_added",
      connectionId: declaredConnectionId,
    },
    observedDifference: {
      kind: "connection_record_added",
      connection: cloneConnection(declaredInB),
    },
    invariants,
    performanceConclusion: null,
    sourceNote,
    verificationState: input.verificationState,
    reason,
  };
}
