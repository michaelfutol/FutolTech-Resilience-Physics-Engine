import type { GenesisVerificationState } from "../../types/genesis";
import type { PrimarySupportLongitudinalAxis } from "../../types/primarySupportMechanics";
import {
  FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION,
  type FloorRingFrameEndpointRoleInput,
  type FloorRingFrameMemberReadinessInput,
  type FloorRingFrameMemberReadinessResult,
} from "../../types/floorRingFrameReadiness";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseStructuralComponentInput,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);
const LONGITUDINAL_AXES = new Set<PrimarySupportLongitudinalAxis>([
  "local_x",
  "local_y",
  "local_z",
]);

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

function validateEndpoint(
  name: string,
  endpoint: FloorRingFrameEndpointRoleInput,
): void {
  requireText(`${name}.roleLabel`, endpoint.roleLabel);
  requireText(`${name}.sourceNote`, endpoint.sourceNote);
  validateVerificationState(`${name}.verificationState`, endpoint.verificationState);
  if (endpoint.jointCoordinateM !== null) {
    throw new Error(
      `${name}.jointCoordinateM must remain null in floor-ring readiness schema v0.1.0; joint coordinates require a later explicit connection-location contract`,
    );
  }
}

function cloneEndpoint(
  endpoint: FloorRingFrameEndpointRoleInput,
): FloorRingFrameEndpointRoleInput {
  return { ...endpoint, jointCoordinateM: null };
}

function cloneMember(
  member: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...member,
    centerM: { ...member.centerM },
    sizeM: { ...member.sizeM },
    rotationRad: { ...member.rotationRad },
  };
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: FloorRingFrameMemberReadinessInput,
) {
  return {
    schemaVersion: FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    globalFrameCalculationAvailable: false as const,
    structuralResult: "N/A" as const,
    longitudinalAxis: input.longitudinalAxis,
    endA: cloneEndpoint(input.endA),
    endB: cloneEndpoint(input.endB),
    jointCoordinates: {
      endA: null,
      endB: null,
    } as const,
    mechanicalProperties: {
      elasticModulusPa: null,
      sectionAreaM2: null,
      principalSecondMoment1M4: null,
      principalSecondMoment2M4: null,
      strengthData: null,
    } as const,
    loadTransferModel: null,
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessFloorRingFrameMemberReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: FloorRingFrameMemberReadinessInput,
): FloorRingFrameMemberReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported floor-ring readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.memberComponentId", input.memberComponentId);
  if (!LONGITUDINAL_AXES.has(input.longitudinalAxis)) {
    throw new Error("input.longitudinalAxis must be local_x, local_y, or local_z");
  }
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  validateEndpoint("input.endA", input.endA);
  validateEndpoint("input.endB", input.endB);

  if (input.endA.roleLabel.trim() === input.endB.roleLabel.trim()) {
    throw new Error("input.endA and input.endB must use distinct endpoint role labels");
  }

  const base = baseResult(snapshot, input);

  if (snapshot.stage === "empty_envelope" || snapshot.stage === "primary_supports") {
    return {
      ...base,
      state: "blocked_stage_before_floor_ring_frame",
      canReview: false,
      reason:
        "The selected stage precedes floor/ring-frame activation. Member readiness is blocked rather than inferred from later specimen data.",
      member: null,
    };
  }

  const selected = snapshot.components.find(
    (component) => component.id === input.memberComponentId,
  );

  if (!selected) {
    return {
      ...base,
      state: "blocked_member_not_active",
      canReview: false,
      reason:
        "The requested floor/ring-frame member is not active in the selected validated stage snapshot.",
      member: null,
    };
  }

  if (selected.kind !== "floor_ring_frame_member") {
    return {
      ...base,
      state: "blocked_not_floor_ring_frame_member",
      canReview: false,
      reason:
        "The selected component exists but is not declared as a floor_ring_frame_member, so this readiness contract cannot reinterpret it.",
      member: cloneMember(selected),
    };
  }

  return {
    ...base,
    state: "review_ready",
    canReview: true,
    reason:
      "Floor/ring-frame member identity, staged geometry/orientation, explicit longitudinal axis, and endpoint-role semantics are reviewable. Physical joint coordinates, material/mechanical properties, load-transfer behavior, global frame stiffness, reactions, racking, and capacity remain intentionally undefined.",
    member: cloneMember(selected),
  };
}
