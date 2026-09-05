import type {
  GenesisVector3,
  GenesisVerificationState,
} from "../../types/genesis";
import {
  CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION,
  type ConnectionJointLocationReadinessInput,
  type ConnectionJointLocationReadinessResult,
} from "../../types/connectionJointLocationReadiness";
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

function validateFiniteVector(name: string, value: GenesisVector3): void {
  for (const axis of ["x", "y", "z"] as const) {
    if (!Number.isFinite(value[axis])) {
      throw new Error(`${name}.${axis} must be finite`);
    }
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

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: ConnectionJointLocationReadinessInput,
) {
  return {
    schemaVersion: CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    connectionMechanicsAvailable: false as const,
    structuralResult: "N/A" as const,
    inferredJointPointM: null,
    connectorGeometry: {
      path: null,
      axis: null,
      shape: null,
      bearingAreaM2: null,
    } as const,
    mechanics: {
      stiffness: null,
      slip: null,
      fastenerType: null,
      fastenerCount: null,
      weldSize: null,
      weldLengthM: null,
      demandN: null,
      capacityAssessmentN: null,
      utilization: null,
      passFail: null,
      loadTransferModel: null,
    } as const,
    provenance: {
      jointPointSourceNote: input.jointPointSourceNote,
      jointPointVerificationState: input.jointPointVerificationState,
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessConnectionJointLocationReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: ConnectionJointLocationReadinessInput,
): ConnectionJointLocationReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (
    input.schemaVersion !==
    CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION
  ) {
    throw new Error(
      `Unsupported connection joint-location readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.connectionId", input.connectionId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);

  if (input.jointPointM === null) {
    if (
      input.jointPointSourceNote !== null ||
      input.jointPointVerificationState !== null
    ) {
      throw new Error(
        "joint-point provenance must remain null while input.jointPointM is unknown",
      );
    }
  } else {
    validateFiniteVector("input.jointPointM", input.jointPointM);
    if (input.jointPointSourceNote === null) {
      throw new Error(
        "input.jointPointSourceNote must be non-empty when jointPointM is supplied",
      );
    }
    requireText("input.jointPointSourceNote", input.jointPointSourceNote);
    if (input.jointPointVerificationState === null) {
      throw new Error(
        "input.jointPointVerificationState is required when jointPointM is supplied",
      );
    }
    validateVerificationState(
      "input.jointPointVerificationState",
      input.jointPointVerificationState,
    );
  }

  const base = baseResult(snapshot, input);

  if (
    STAGE_ORDER.indexOf(snapshot.stage) < STAGE_ORDER.indexOf("connections")
  ) {
    return {
      ...base,
      state: "blocked_stage_before_connections",
      canReviewLocation: false,
      reason:
        "The selected stage precedes connection activation. No joint location is inferred from component geometry or later specimen data.",
      connection: null,
      fromComponent: null,
      toComponent: null,
      jointPointM: null,
      coordinateBasis: "unknown",
    };
  }

  const selected = snapshot.connections.find(
    (connection) => connection.id === input.connectionId,
  );
  if (!selected) {
    return {
      ...base,
      state: "blocked_connection_not_active",
      canReviewLocation: false,
      reason:
        "The requested connection is not active in the selected validated stage snapshot.",
      connection: null,
      fromComponent: null,
      toComponent: null,
      jointPointM: null,
      coordinateBasis: "unknown",
    };
  }

  const fromComponent = snapshot.components.find(
    (component) => component.id === selected.fromComponentId,
  );
  const toComponent = snapshot.components.find(
    (component) => component.id === selected.toComponentId,
  );
  if (!fromComponent || !toComponent) {
    return {
      ...base,
      state: "blocked_endpoint_not_active",
      canReviewLocation: false,
      reason:
        "One or both declared connection endpoint components are not active in the selected stage snapshot. No replacement endpoint or joint point is inferred.",
      connection: cloneConnection(selected),
      fromComponent: fromComponent ? cloneComponent(fromComponent) : null,
      toComponent: toComponent ? cloneComponent(toComponent) : null,
      jointPointM: null,
      coordinateBasis: "unknown",
    };
  }

  if (input.jointPointM === null) {
    return {
      ...base,
      state: "location_unknown",
      canReviewLocation: false,
      reason:
        "Connection topology and endpoint identities are known, but the physical global joint point is UNKNOWN. RPE does not infer a midpoint, box intersection, nearest face, touching point, or center-to-center location.",
      connection: cloneConnection(selected),
      fromComponent: cloneComponent(fromComponent),
      toComponent: cloneComponent(toComponent),
      jointPointM: null,
      coordinateBasis: "unknown",
    };
  }

  return {
    ...base,
    state: "review_ready",
    canReviewLocation: true,
    reason:
      "The connection identity, staged endpoint identities, and caller-declared finite global joint point are reviewable. No connector path/shape, stiffness, slip, fastener/weld data, demand/capacity assessment, utilization, PASS/FAIL, load transfer, or whole-house response is calculated.",
    connection: cloneConnection(selected),
    fromComponent: cloneComponent(fromComponent),
    toComponent: cloneComponent(toComponent),
    jointPointM: { ...input.jointPointM },
    coordinateBasis: "caller_declared_global_point",
  };
}
