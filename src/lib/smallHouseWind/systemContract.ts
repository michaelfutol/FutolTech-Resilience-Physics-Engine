import type { GenesisVector3, GenesisVerificationState } from "../../types/genesis";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseConnectionInput,
  type SmallHouseStructuralComponentInput,
  type SmallHouseStructuralComponentKind,
  type SmallHouseWindSpecimenInput,
  type SmallHouseWindStage,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";

const STAGE_ORDER: Record<SmallHouseWindStage, number> = {
  empty_envelope: 0,
  primary_supports: 1,
  floor_ring_frame: 2,
  walls: 3,
  roof: 4,
  connections: 5,
  bracing: 6,
  anchorage: 7,
  storm_protection: 8,
};

const EXPECTED_COMPONENT_STAGE: Record<
  SmallHouseStructuralComponentKind,
  SmallHouseStructuralComponentInput["activationStage"]
> = {
  primary_support: "primary_supports",
  floor_ring_frame_member: "floor_ring_frame",
  wall_panel: "walls",
  roof_panel: "roof",
  brace: "bracing",
  anchor: "anchorage",
  storm_protection_member: "storm_protection",
};

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);

function requireText(name: string, value: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} must be non-empty`);
  }
  return value;
}

function validateVerificationState(name: string, value: GenesisVerificationState): void {
  if (!VERIFICATION_STATES.has(value)) {
    throw new Error(`${name} must be a supported verification state`);
  }
}

function validateFiniteVector(name: string, vector: GenesisVector3): void {
  for (const [axis, value] of Object.entries(vector)) {
    if (!Number.isFinite(value)) {
      throw new Error(`${name}.${axis} must be finite`);
    }
  }
}

function validatePositiveSize(name: string, sizeM: GenesisVector3): void {
  validateFiniteVector(name, sizeM);
  for (const [axis, value] of Object.entries(sizeM)) {
    if (value <= 0) {
      throw new Error(`${name}.${axis} must be greater than zero`);
    }
  }
}

function cloneComponent(
  component: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...component,
    centerM: { ...component.centerM },
    sizeM: { ...component.sizeM },
  };
}

function cloneConnection(connection: SmallHouseConnectionInput): SmallHouseConnectionInput {
  return { ...connection };
}

export function validateSmallHouseWindSpecimen(
  input: SmallHouseWindSpecimenInput,
): SmallHouseWindSpecimenInput {
  if (input.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(`Unsupported small-house wind schema version: ${String(input.schemaVersion)}`);
  }

  requireText("specimen.id", input.id);
  requireText("specimen.label", input.label);
  requireText("specimen.sourceNote", input.sourceNote);
  validateVerificationState("specimen.verificationState", input.verificationState);

  requireText("envelope.id", input.envelope.id);
  requireText("envelope.sourceNote", input.envelope.sourceNote);
  validateVerificationState("envelope.verificationState", input.envelope.verificationState);
  validateFiniteVector("envelope.centerM", input.envelope.centerM);
  validatePositiveSize("envelope.sizeM", input.envelope.sizeM);

  const objectIds = new Set<string>([input.envelope.id]);
  const componentIds = new Set<string>();

  for (const component of input.components) {
    const id = requireText("component.id", component.id);
    if (objectIds.has(id)) {
      throw new Error(`Duplicate small-house object ID: ${id}`);
    }
    objectIds.add(id);
    componentIds.add(id);

    requireText(`component[${id}].sourceNote`, component.sourceNote);
    validateVerificationState(
      `component[${id}].verificationState`,
      component.verificationState,
    );
    validateFiniteVector(`component[${id}].centerM`, component.centerM);
    validatePositiveSize(`component[${id}].sizeM`, component.sizeM);

    const expectedStage = EXPECTED_COMPONENT_STAGE[component.kind];
    if (!expectedStage) {
      throw new Error(`Unsupported small-house component kind: ${String(component.kind)}`);
    }
    if (component.activationStage !== expectedStage) {
      throw new Error(
        `component[${id}] activation stage ${component.activationStage} does not match kind ${component.kind}; expected ${expectedStage}`,
      );
    }

    if (component.materialId !== null) {
      requireText(`component[${id}].materialId`, component.materialId);
    }
    if (
      component.massKg !== null &&
      (!Number.isFinite(component.massKg) || component.massKg <= 0)
    ) {
      throw new Error(`component[${id}].massKg must be positive when supplied`);
    }
  }

  for (const connection of input.connections) {
    const id = requireText("connection.id", connection.id);
    if (objectIds.has(id)) {
      throw new Error(`Duplicate small-house object ID: ${id}`);
    }
    objectIds.add(id);

    requireText(`connection[${id}].sourceNote`, connection.sourceNote);
    validateVerificationState(
      `connection[${id}].verificationState`,
      connection.verificationState,
    );
    const fromId = requireText(`connection[${id}].fromComponentId`, connection.fromComponentId);
    const toId = requireText(`connection[${id}].toComponentId`, connection.toComponentId);
    if (fromId === toId) {
      throw new Error(`connection[${id}] cannot connect a component to itself`);
    }
    if (!componentIds.has(fromId) || !componentIds.has(toId)) {
      throw new Error(`connection[${id}] references a missing component`);
    }
    if (
      connection.capacityN !== null &&
      (!Number.isFinite(connection.capacityN) || connection.capacityN < 0)
    ) {
      throw new Error(`connection[${id}].capacityN must be non-negative when supplied`);
    }

    const from = input.components.find((component) => component.id === fromId)!;
    const to = input.components.find((component) => component.id === toId)!;
    const latestEndpointStage = Math.max(
      STAGE_ORDER[from.activationStage],
      STAGE_ORDER[to.activationStage],
    );
    if (STAGE_ORDER[connection.activationStage] < latestEndpointStage) {
      throw new Error(
        `connection[${id}] cannot activate before both endpoint components exist`,
      );
    }
  }

  return {
    ...input,
    envelope: {
      ...input.envelope,
      centerM: { ...input.envelope.centerM },
      sizeM: { ...input.envelope.sizeM },
    },
    components: input.components.map(cloneComponent),
    connections: input.connections.map(cloneConnection),
  };
}

export function materializeSmallHouseWindStage(
  input: SmallHouseWindSpecimenInput,
  stage: SmallHouseWindStage,
): SmallHouseWindStageSnapshot {
  const specimen = validateSmallHouseWindSpecimen(input);
  const stageIndex = STAGE_ORDER[stage];
  if (stageIndex === undefined) {
    throw new Error(`Unsupported small-house wind stage: ${String(stage)}`);
  }

  const components = specimen.components
    .filter((component) => STAGE_ORDER[component.activationStage] <= stageIndex)
    .map(cloneComponent);
  const activeComponentIds = new Set(components.map((component) => component.id));
  const connections = specimen.connections
    .filter(
      (connection) =>
        STAGE_ORDER[connection.activationStage] <= stageIndex &&
        activeComponentIds.has(connection.fromComponentId) &&
        activeComponentIds.has(connection.toComponentId),
    )
    .map(cloneConnection);

  const hasPhysicalComponents = components.length > 0;

  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    specimenId: specimen.id,
    stage,
    envelope: {
      ...specimen.envelope,
      centerM: { ...specimen.envelope.centerM },
      sizeM: { ...specimen.envelope.sizeM },
    },
    components,
    connections,
    structuralResult: hasPhysicalComponents ? "DECLARED_COMPONENTS_ONLY" : "N/A",
    reason: hasPhysicalComponents
      ? "physical_components_declared_no_performance_claim"
      : "no_physical_specimen",
  };
}
