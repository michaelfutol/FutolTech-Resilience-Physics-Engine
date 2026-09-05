import type { GenesisVerificationState } from "../../types/genesis";
import {
  WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
  type WallPanelExposedFace,
  type WallPanelExposureClass,
  type WallPanelExposureReadinessInput,
  type WallPanelExposureReadinessResult,
  type WallPanelNormalAxis,
} from "../../types/wallPanelExposureReadiness";
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
const NORMAL_AXES = new Set<WallPanelNormalAxis>([
  "local_x",
  "local_y",
  "local_z",
]);
const EXPOSED_FACES = new Set<WallPanelExposedFace>([
  "positive_normal",
  "negative_normal",
]);
const EXPOSURE_CLASSES = new Set<WallPanelExposureClass>([
  "exterior",
  "interior",
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

function cloneWall(
  wall: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...wall,
    centerM: { ...wall.centerM },
    sizeM: { ...wall.sizeM },
    rotationRad: { ...wall.rotationRad },
  };
}

function geometricFaceAreaM2(
  wall: SmallHouseStructuralComponentInput,
  normalAxis: WallPanelNormalAxis,
): number {
  if (normalAxis === "local_x") return wall.sizeM.y * wall.sizeM.z;
  if (normalAxis === "local_y") return wall.sizeM.x * wall.sizeM.z;
  return wall.sizeM.x * wall.sizeM.y;
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: WallPanelExposureReadinessInput,
) {
  return {
    schemaVersion: WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    windActionCalculationAvailable: false as const,
    structuralResult: "N/A" as const,
    panelNormalAxis: input.panelNormalAxis,
    exposedFace: input.exposedFace,
    exposureClass: input.exposureClass,
    effectiveWindAreaM2: null,
    aerodynamicInputs: {
      windVelocityMps: null,
      airDensityKgM3: null,
      externalPressureCoefficient: null,
      internalPressureCoefficient: null,
      netPressurePa: null,
    } as const,
    mechanicalProperties: {
      elasticModulusPa: null,
      panelStiffness: null,
      strengthData: null,
      fastenerCapacity: null,
    } as const,
    provenance: {
      normalAxisSourceNote: input.normalAxisSourceNote,
      normalAxisVerificationState: input.normalAxisVerificationState,
      exposureSourceNote: input.exposureSourceNote,
      exposureVerificationState: input.exposureVerificationState,
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function assessWallPanelExposureReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: WallPanelExposureReadinessInput,
): WallPanelExposureReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported wall-panel exposure readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.wallComponentId", input.wallComponentId);
  if (!NORMAL_AXES.has(input.panelNormalAxis)) {
    throw new Error("input.panelNormalAxis must be local_x, local_y, or local_z");
  }
  if (!EXPOSED_FACES.has(input.exposedFace)) {
    throw new Error("input.exposedFace must be positive_normal or negative_normal");
  }
  if (!EXPOSURE_CLASSES.has(input.exposureClass)) {
    throw new Error("input.exposureClass must be exterior or interior");
  }

  requireText("input.normalAxisSourceNote", input.normalAxisSourceNote);
  validateVerificationState(
    "input.normalAxisVerificationState",
    input.normalAxisVerificationState,
  );
  requireText("input.exposureSourceNote", input.exposureSourceNote);
  validateVerificationState(
    "input.exposureVerificationState",
    input.exposureVerificationState,
  );
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);

  const base = baseResult(snapshot, input);
  const stageOrder = [
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
  if (stageOrder.indexOf(snapshot.stage) < stageOrder.indexOf("walls")) {
    return {
      ...base,
      state: "blocked_stage_before_walls",
      canReview: false,
      reason:
        "The selected stage precedes wall activation. Wall exposure readiness is blocked rather than inferred from later specimen data.",
      wall: null,
      geometricFaceAreaM2: null,
    };
  }

  const selected = snapshot.components.find(
    (component) => component.id === input.wallComponentId,
  );
  if (!selected) {
    return {
      ...base,
      state: "blocked_wall_not_active",
      canReview: false,
      reason:
        "The requested wall panel is not active in the selected validated stage snapshot.",
      wall: null,
      geometricFaceAreaM2: null,
    };
  }

  if (selected.kind !== "wall_panel") {
    return {
      ...base,
      state: "blocked_not_wall_panel",
      canReview: false,
      reason:
        "The selected component exists but is not declared as a wall_panel, so this readiness contract cannot reinterpret it.",
      wall: cloneWall(selected),
      geometricFaceAreaM2: null,
    };
  }

  return {
    ...base,
    state: "review_ready",
    canReview: true,
    reason:
      "Wall-panel identity, staged geometry/orientation, caller-declared panel-normal axis, exposed-face sign, and exposure class are reviewable. The reported face area is box geometry only, not effective wind area. Wind velocity, pressure coefficients, net pressure, stiffness, fastener behavior, capacity, and whole-house response remain intentionally undefined.",
    wall: cloneWall(selected),
    geometricFaceAreaM2: geometricFaceAreaM2(selected, input.panelNormalAxis),
  };
}
