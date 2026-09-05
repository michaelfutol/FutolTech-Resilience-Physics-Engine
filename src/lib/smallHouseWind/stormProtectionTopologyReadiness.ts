import type { GenesisVerificationState } from "../../types/genesis";
import {
  STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION,
  type StormProtectionTopologyReadinessInput,
  type StormProtectionTopologyReadinessResult,
} from "../../types/stormProtectionTopologyReadiness";
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

function isIncidentToRestraint(
  connection: SmallHouseConnectionInput,
  restraintMemberId: string,
): boolean {
  return (
    connection.fromComponentId === restraintMemberId ||
    connection.toComponentId === restraintMemberId
  );
}

function otherEndpointId(
  connection: SmallHouseConnectionInput,
  restraintMemberId: string,
): string | null {
  if (connection.fromComponentId === restraintMemberId) {
    return connection.toComponentId;
  }
  if (connection.toComponentId === restraintMemberId) {
    return connection.fromComponentId;
  }
  return null;
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: StormProtectionTopologyReadinessInput,
) {
  return {
    schemaVersion: STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    stormProtectionMechanicsAvailable: false as const,
    structuralResult: "N/A" as const,
    topology: {
      explicitSelectedEndCount: input.endConnectionIds.filter(
        (id): id is string => id !== null,
      ).length,
      distinctSelectedConnections:
        input.endConnectionIds[0] !== null &&
        input.endConnectionIds[1] !== null &&
        input.endConnectionIds[0] !== input.endConnectionIds[1],
      distinctOtherEndpointComponents: false,
      physicalAttachmentPointsKnown: false as const,
      inferredAttachmentPoints: [null, null] as const,
    },
    mechanics: {
      tensionN: null,
      preloadN: null,
      axialStiffnessNPerM: null,
      slackM: null,
      elongationM: null,
      windUpliftDemandN: null,
      restraintForceN: null,
      loadSharing: null,
      memberCapacityN: null,
      connectionCapacityN: null,
      utilization: null,
      passFail: null,
      wholeHouseImprovement: null,
    } as const,
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessStormProtectionTopologyReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: StormProtectionTopologyReadinessInput,
): StormProtectionTopologyReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (
    input.schemaVersion !==
    STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION
  ) {
    throw new Error(
      `Unsupported storm-protection topology readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.restraintMemberId", input.restraintMemberId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  for (const [index, id] of input.endConnectionIds.entries()) {
    if (id !== null) requireText(`input.endConnectionIds[${index}]`, id);
  }

  const base = baseResult(snapshot, input);

  if (
    STAGE_ORDER.indexOf(snapshot.stage) <
    STAGE_ORDER.indexOf("storm_protection")
  ) {
    return {
      ...base,
      state: "blocked_stage_before_storm_protection",
      canReviewTopology: false,
      reason:
        "The selected stage precedes storm-protection activation. RPE does not infer a restraint path from later-stage strap geometry or visible crossings.",
      restraintMember: null,
      incidentConnections: [],
      selectedEndConnections: [null, null],
      otherEndpointComponents: [null, null],
    };
  }

  const restraintMember = snapshot.components.find(
    (component) => component.id === input.restraintMemberId,
  );
  if (!restraintMember) {
    return {
      ...base,
      state: "blocked_restraint_not_active",
      canReviewTopology: false,
      reason:
        "The requested storm-protection restraint identity is not active in the selected validated stage snapshot.",
      restraintMember: null,
      incidentConnections: [],
      selectedEndConnections: [null, null],
      otherEndpointComponents: [null, null],
    };
  }

  const incidentConnections = snapshot.connections.filter((connection) =>
    isIncidentToRestraint(connection, restraintMember.id),
  );
  const clonedIncidentConnections = incidentConnections.map(cloneConnection);

  if (restraintMember.kind !== "storm_protection_member") {
    return {
      ...base,
      state: "blocked_component_not_storm_protection_member",
      canReviewTopology: false,
      reason:
        "The selected component is active but is not classified as a storm-protection member. RPE does not reinterpret visible geometry as a restraint.",
      restraintMember: cloneComponent(restraintMember),
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
        "A two-ended restraint path requires two distinct explicit connection records. One topology record cannot be silently reused as both restraint ends.",
      restraintMember: cloneComponent(restraintMember),
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
          "A caller-selected restraint-end connection is not active in the selected validated stage snapshot. No replacement relationship is inferred.",
        restraintMember: cloneComponent(restraintMember),
        incidentConnections: clonedIncidentConnections,
        selectedEndConnections: selectedConnections.map((connection) =>
          connection ? cloneConnection(connection) : null,
        ) as [SmallHouseConnectionInput | null, SmallHouseConnectionInput | null],
        otherEndpointComponents: [null, null],
      };
    }

    if (selected && !isIncidentToRestraint(selected, restraintMember.id)) {
      return {
        ...base,
        state: "blocked_connection_not_incident_to_restraint",
        canReviewTopology: false,
        reason:
          "A selected connection is active but does not explicitly reference the selected storm-protection member. RPE does not bridge unrelated topology from rendered crossings or proximity.",
        restraintMember: cloneComponent(restraintMember),
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
      state: "restraint_path_incomplete",
      canReviewTopology: false,
      reason:
        "The storm-protection member is visible and explicit incident topology may exist, but two distinct restraint-end connection records have not been declared. A strap-looking member is not treated as a complete restraint path.",
      restraintMember: cloneComponent(restraintMember),
      incidentConnections: clonedIncidentConnections,
      selectedEndConnections: selectedConnections.map((connection) =>
        connection ? cloneConnection(connection) : null,
      ) as [SmallHouseConnectionInput | null, SmallHouseConnectionInput | null],
      otherEndpointComponents: [null, null],
    };
  }

  const otherEndpointIds = selectedConnections.map((connection) =>
    otherEndpointId(connection!, restraintMember.id),
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
        "A selected storm-protection connection references an endpoint component that is not active in the current stage snapshot. No substitute endpoint is inferred.",
      restraintMember: cloneComponent(restraintMember),
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

  if (otherEndpoints[0].id === otherEndpoints[1].id) {
    return {
      ...base,
      topology: {
        ...base.topology,
        distinctOtherEndpointComponents: false,
      },
      state: "blocked_same_other_endpoint_component",
      canReviewTopology: false,
      reason:
        "Two explicit connection records both terminate at the same opposite component. Without distinct endpoint components and physical attachment semantics, RPE does not treat duplicate relationships as a complete restraint path.",
      restraintMember: cloneComponent(restraintMember),
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

  return {
    ...base,
    topology: {
      ...base.topology,
      distinctOtherEndpointComponents: true,
    },
    state: "review_ready_topology",
    canReviewTopology: true,
    reason:
      "Two distinct active connection records explicitly reference the selected storm-protection member and two distinct active opposite endpoint components. This establishes reviewable two-ended topology only; attachment points, fasteners, tension/preload, stiffness, slack/elongation, wind/uplift demand, restraint force, load sharing, capacity, utilization, PASS/FAIL, and whole-house improvement remain unavailable.",
    restraintMember: cloneComponent(restraintMember),
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
