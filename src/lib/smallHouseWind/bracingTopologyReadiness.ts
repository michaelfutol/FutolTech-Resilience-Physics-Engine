import type { GenesisVerificationState } from "../../types/genesis";
import {
  BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION,
  type BracingTopologyReadinessInput,
  type BracingTopologyReadinessResult,
} from "../../types/bracingTopologyReadiness";
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

function isIncidentToBrace(
  connection: SmallHouseConnectionInput,
  braceId: string,
): boolean {
  return (
    connection.fromComponentId === braceId ||
    connection.toComponentId === braceId
  );
}

function otherEndpointId(
  connection: SmallHouseConnectionInput,
  braceId: string,
): string | null {
  if (connection.fromComponentId === braceId) return connection.toComponentId;
  if (connection.toComponentId === braceId) return connection.fromComponentId;
  return null;
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: BracingTopologyReadinessInput,
) {
  return {
    schemaVersion: BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    bracingMechanicsAvailable: false as const,
    structuralResult: "N/A" as const,
    topology: {
      explicitSelectedEndCount: input.endConnectionIds.filter(
        (id): id is string => id !== null,
      ).length,
      distinctSelectedConnections:
        input.endConnectionIds[0] !== null &&
        input.endConnectionIds[1] !== null &&
        input.endConnectionIds[0] !== input.endConnectionIds[1],
      physicalJointLocationsKnown: false as const,
      inferredJointLocations: [null, null] as const,
    },
    mechanics: {
      axialForceN: null,
      tensionCompressionState: null,
      axialStiffnessNPerM: null,
      effectiveLengthM: null,
      slendernessRatio: null,
      bucklingModel: null,
      rackingContribution: null,
      demandN: null,
      capacityN: null,
      utilization: null,
      passFail: null,
      loadPathAdequacy: null,
    } as const,
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessBracingTopologyReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: BracingTopologyReadinessInput,
): BracingTopologyReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported bracing topology readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.braceId", input.braceId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  for (const [index, id] of input.endConnectionIds.entries()) {
    if (id !== null) requireText(`input.endConnectionIds[${index}]`, id);
  }

  const base = baseResult(snapshot, input);

  if (STAGE_ORDER.indexOf(snapshot.stage) < STAGE_ORDER.indexOf("bracing")) {
    return {
      ...base,
      state: "blocked_stage_before_bracing",
      canReviewTopology: false,
      reason:
        "The selected stage precedes brace activation. RPE does not infer a brace relationship from visible diagonal geometry or later-stage data.",
      brace: null,
      incidentConnections: [],
      selectedEndConnections: [null, null],
      otherEndpointComponents: [null, null],
    };
  }

  const brace = snapshot.components.find(
    (component) => component.id === input.braceId,
  );
  if (!brace) {
    return {
      ...base,
      state: "blocked_brace_not_active",
      canReviewTopology: false,
      reason:
        "The requested brace identity is not active in the selected validated stage snapshot.",
      brace: null,
      incidentConnections: [],
      selectedEndConnections: [null, null],
      otherEndpointComponents: [null, null],
    };
  }

  const incidentConnections = snapshot.connections.filter((connection) =>
    isIncidentToBrace(connection, brace.id),
  );
  const clonedIncidentConnections = incidentConnections.map(cloneConnection);

  if (brace.kind !== "brace") {
    return {
      ...base,
      state: "blocked_component_not_brace",
      canReviewTopology: false,
      reason:
        "The selected component is active but is not classified as a brace. RPE does not reinterpret visible geometry as bracing.",
      brace: cloneComponent(brace),
      incidentConnections: clonedIncidentConnections,
      selectedEndConnections: [null, null],
      otherEndpointComponents: [null, null],
    };
  }

  const [endAId, endBId] = input.endConnectionIds;

  if (endAId !== null && endBId !== null && endAId === endBId) {
    const selected = snapshot.connections.find(
      (connection) => connection.id === endAId,
    );
    return {
      ...base,
      state: "blocked_duplicate_connection",
      canReviewTopology: false,
      reason:
        "A two-ended brace relationship requires two distinct explicit connection records. One connection cannot be silently reused as both brace ends.",
      brace: cloneComponent(brace),
      incidentConnections: clonedIncidentConnections,
      selectedEndConnections: [
        selected ? cloneConnection(selected) : null,
        selected ? cloneConnection(selected) : null,
      ],
      otherEndpointComponents: [null, null],
    };
  }

  const selectedConnections: [
    SmallHouseConnectionInput | null,
    SmallHouseConnectionInput | null,
  ] = [
    endAId === null
      ? null
      : snapshot.connections.find((connection) => connection.id === endAId) ?? null,
    endBId === null
      ? null
      : snapshot.connections.find((connection) => connection.id === endBId) ?? null,
  ];

  for (let index = 0; index < 2; index += 1) {
    const requestedId = input.endConnectionIds[index];
    const selected = selectedConnections[index];
    if (requestedId !== null && !selected) {
      return {
        ...base,
        state: "blocked_connection_not_active",
        canReviewTopology: false,
        reason:
          "A caller-selected brace-end connection is not active in the selected validated stage snapshot. No replacement relationship is inferred.",
        brace: cloneComponent(brace),
        incidentConnections: clonedIncidentConnections,
        selectedEndConnections: selectedConnections.map((connection) =>
          connection ? cloneConnection(connection) : null,
        ) as [SmallHouseConnectionInput | null, SmallHouseConnectionInput | null],
        otherEndpointComponents: [null, null],
      };
    }
    if (selected && !isIncidentToBrace(selected, brace.id)) {
      return {
        ...base,
        state: "blocked_connection_not_incident_to_brace",
        canReviewTopology: false,
        reason:
          "A selected connection is active but does not explicitly reference the selected brace. RPE does not bridge unrelated topology from geometry.",
        brace: cloneComponent(brace),
        incidentConnections: clonedIncidentConnections,
        selectedEndConnections: selectedConnections.map((connection) =>
          connection ? cloneConnection(connection) : null,
        ) as [SmallHouseConnectionInput | null, SmallHouseConnectionInput | null],
        otherEndpointComponents: [null, null],
      };
    }
  }

  if (selectedConnections[0] === null || selectedConnections[1] === null) {
    return {
      ...base,
      state: "load_path_incomplete",
      canReviewTopology: false,
      reason:
        "The brace is visible and explicit incident topology may exist, but two distinct brace-end connection records have not been declared. A diagonal-looking member is not treated as a complete load path.",
      brace: cloneComponent(brace),
      incidentConnections: clonedIncidentConnections,
      selectedEndConnections: selectedConnections.map((connection) =>
        connection ? cloneConnection(connection) : null,
      ) as [SmallHouseConnectionInput | null, SmallHouseConnectionInput | null],
      otherEndpointComponents: [null, null],
    };
  }

  const otherEndpointIds = selectedConnections.map((connection) =>
    otherEndpointId(connection!, brace.id),
  ) as [string | null, string | null];
  const otherEndpoints = otherEndpointIds.map((id) =>
    id === null
      ? null
      : snapshot.components.find((component) => component.id === id) ?? null,
  ) as [SmallHouseStructuralComponentInput | null, SmallHouseStructuralComponentInput | null];

  if (!otherEndpoints[0] || !otherEndpoints[1]) {
    return {
      ...base,
      state: "blocked_other_endpoint_not_active",
      canReviewTopology: false,
      reason:
        "A selected bracing connection references an endpoint component that is not active in the current stage snapshot. No substitute endpoint is inferred.",
      brace: cloneComponent(brace),
      incidentConnections: clonedIncidentConnections,
      selectedEndConnections: [
        cloneConnection(selectedConnections[0]),
        cloneConnection(selectedConnections[1]),
      ],
      otherEndpointComponents: [
        otherEndpoints[0] ? cloneComponent(otherEndpoints[0]) : null,
        otherEndpoints[1] ? cloneComponent(otherEndpoints[1]) : null,
      ],
    };
  }

  return {
    ...base,
    state: "review_ready_topology",
    canReviewTopology: true,
    reason:
      "Two distinct active connection records explicitly reference the selected brace and active opposite endpoint components. This establishes reviewable two-ended topology only; physical joint points, axial stiffness/force, tension/compression behavior, buckling, racking contribution, capacity, utilization, PASS/FAIL, and load-path adequacy remain unavailable.",
    brace: cloneComponent(brace),
    incidentConnections: clonedIncidentConnections,
    selectedEndConnections: [
      cloneConnection(selectedConnections[0]),
      cloneConnection(selectedConnections[1]),
    ],
    otherEndpointComponents: [
      cloneComponent(otherEndpoints[0]),
      cloneComponent(otherEndpoints[1]),
    ],
  };
}
