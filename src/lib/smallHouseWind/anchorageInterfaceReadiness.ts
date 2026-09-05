import type { GenesisVerificationState } from "../../types/genesis";
import {
  ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION,
  type AnchorageInterfaceReadinessInput,
  type AnchorageInterfaceReadinessResult,
} from "../../types/anchorageInterfaceReadiness";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseConnectionInput,
  type SmallHouseStructuralComponentInput,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);

const STAGE_ORDER = [
  "empty_envelope",
  "primary_supports",
  "floor_ring_frame",
  "walls",
  "roof",
  "connections",
  "bracing",
  "anchorage",
  "storm_protection",
] as const;

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

function cloneConnection(
  connection: SmallHouseConnectionInput,
): SmallHouseConnectionInput {
  return { ...connection };
}

function cloneComponent(
  component: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...component,
    centerM: { ...component.centerM },
    sizeM: { ...component.sizeM },
    rotationRad: { ...component.rotationRad },
  };
}

function isIncidentToAnchor(
  connection: SmallHouseConnectionInput,
  anchorId: string,
): boolean {
  return (
    connection.fromComponentId === anchorId ||
    connection.toComponentId === anchorId
  );
}

function otherEndpointId(
  connection: SmallHouseConnectionInput,
  anchorId: string,
): string | null {
  if (connection.fromComponentId === anchorId) return connection.toComponentId;
  if (connection.toComponentId === anchorId) return connection.fromComponentId;
  return null;
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: AnchorageInterfaceReadinessInput,
  anchor: SmallHouseStructuralComponentInput | null,
) {
  return {
    schemaVersion: ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    anchorageMechanicsAvailable: false as const,
    structuralResult: "N/A" as const,
    topology: {
      explicitAttachmentConnection: input.attachmentConnectionId !== null,
      physicalAttachmentPointKnown: false as const,
      inferredAttachmentPointM: null,
    },
    declaredUnknowns: {
      materialId: anchor?.materialId ?? null,
      massKg: anchor?.massKg ?? null,
      topologyCapacityN: null,
    },
    mechanics: {
      boltOrRodType: null,
      boltDiameterM: null,
      embedmentLengthM: null,
      basePlateGeometry: null,
      weldOrFastenerDetails: null,
      pedestalGeometry: null,
      footingGeometry: null,
      concreteStrengthPa: null,
      soilModel: null,
      soilBearingPa: null,
      interfaceFrictionCoefficient: null,
      pulloutModel: null,
      breakoutModel: null,
      upliftReactionN: null,
      shearReactionN: null,
      slidingResistanceN: null,
      overturningResistanceNm: null,
      demandN: null,
      capacityN: null,
      utilization: null,
      passFail: null,
    } as const,
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessAnchorageInterfaceReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: AnchorageInterfaceReadinessInput,
): AnchorageInterfaceReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported anchorage interface readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.anchorId", input.anchorId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  if (input.attachmentConnectionId !== null) {
    requireText("input.attachmentConnectionId", input.attachmentConnectionId);
  }

  if (
    STAGE_ORDER.indexOf(snapshot.stage) < STAGE_ORDER.indexOf("anchorage")
  ) {
    return {
      ...baseResult(snapshot, input, null),
      state: "blocked_stage_before_anchorage",
      canReviewInterface: false,
      reason:
        "The selected stage precedes anchor activation. RPE does not infer an anchorage interface from later-stage markers, proximity, rendered touching geometry, or the ground plane.",
      anchor: null,
      attachmentConnection: null,
      support: null,
    };
  }

  const anchor = snapshot.components.find(
    (component) => component.id === input.anchorId,
  );
  if (!anchor) {
    return {
      ...baseResult(snapshot, input, null),
      state: "blocked_anchor_not_active",
      canReviewInterface: false,
      reason:
        "The requested anchor identity is not active in the selected validated stage snapshot.",
      anchor: null,
      attachmentConnection: null,
      support: null,
    };
  }

  const base = baseResult(snapshot, input, anchor);

  if (anchor.kind !== "anchor") {
    return {
      ...base,
      state: "blocked_component_not_anchor",
      canReviewInterface: false,
      reason:
        "The selected component is active but is not classified as an anchor. RPE does not reinterpret support, brace, panel, or marker geometry as anchorage.",
      anchor: cloneComponent(anchor),
      attachmentConnection: null,
      support: null,
    };
  }

  if (input.attachmentConnectionId === null) {
    return {
      ...base,
      state: "interface_incomplete",
      canReviewInterface: false,
      reason:
        "The anchor marker is active, but no explicit active anchor-to-support topology record has been selected. Proximity or apparent contact does not establish an attachment interface.",
      anchor: cloneComponent(anchor),
      attachmentConnection: null,
      support: null,
    };
  }

  const connection = snapshot.connections.find(
    (candidate) => candidate.id === input.attachmentConnectionId,
  );
  if (!connection) {
    return {
      ...base,
      state: "blocked_connection_not_active",
      canReviewInterface: false,
      reason:
        "The caller-selected anchorage connection is not active in the selected validated stage snapshot. RPE does not substitute another nearby relationship.",
      anchor: cloneComponent(anchor),
      attachmentConnection: null,
      support: null,
    };
  }

  const withConnection = {
    ...base,
    declaredUnknowns: {
      ...base.declaredUnknowns,
      topologyCapacityN: connection.capacityN,
    },
  };

  if (!isIncidentToAnchor(connection, anchor.id)) {
    return {
      ...withConnection,
      state: "blocked_connection_not_incident_to_anchor",
      canReviewInterface: false,
      reason:
        "The selected connection is active but does not explicitly reference the selected anchor. RPE does not bridge unrelated topology from geometry or distance.",
      anchor: cloneComponent(anchor),
      attachmentConnection: cloneConnection(connection),
      support: null,
    };
  }

  const endpointId = otherEndpointId(connection, anchor.id);
  const endpoint = endpointId
    ? snapshot.components.find((component) => component.id === endpointId) ?? null
    : null;

  if (!endpoint || endpoint.kind !== "primary_support") {
    return {
      ...withConnection,
      state: "blocked_other_endpoint_not_support",
      canReviewInterface: false,
      reason:
        "The selected anchorage relationship does not terminate at an active primary support. RPE does not treat another component or the ground plane as a substitute support interface.",
      anchor: cloneComponent(anchor),
      attachmentConnection: cloneConnection(connection),
      support: endpoint ? cloneComponent(endpoint) : null,
    };
  }

  return {
    ...withConnection,
    state: "review_ready_interface",
    canReviewInterface: true,
    reason:
      "An active anchor marker and an explicit active anchor-to-primary-support topology record are identified. This establishes interface identity only. Physical attachment point, bolt/rod geometry, embedment, base plate, pedestal/footing, concrete/soil model, uplift/sliding/overturning reactions, failure modes, demand, capacity, utilization, and PASS/FAIL remain unavailable.",
    anchor: cloneComponent(anchor),
    attachmentConnection: cloneConnection(connection),
    support: cloneComponent(endpoint),
  };
}
