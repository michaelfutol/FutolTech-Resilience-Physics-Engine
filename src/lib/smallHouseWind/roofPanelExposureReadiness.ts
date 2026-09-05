import type { GenesisVerificationState } from "../../types/genesis";
import {
  ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
  type RoofPanelExposedFace,
  type RoofPanelExposureClass,
  type RoofPanelExposureReadinessInput,
  type RoofPanelExposureReadinessResult,
  type RoofPanelNormalAxis,
} from "../../types/roofPanelExposureReadiness";
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
const NORMAL_AXES = new Set<RoofPanelNormalAxis>([
  "local_x",
  "local_y",
  "local_z",
]);
const EXPOSED_FACES = new Set<RoofPanelExposedFace>([
  "positive_normal",
  "negative_normal",
]);
const EXPOSURE_CLASSES = new Set<RoofPanelExposureClass>([
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

function cloneRoof(
  roof: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...roof,
    centerM: { ...roof.centerM },
    sizeM: { ...roof.sizeM },
    rotationRad: { ...roof.rotationRad },
  };
}

function geometricFaceAreaM2(
  roof: SmallHouseStructuralComponentInput,
  normalAxis: RoofPanelNormalAxis,
): number {
  if (normalAxis === "local_x") return roof.sizeM.y * roof.sizeM.z;
  if (normalAxis === "local_y") return roof.sizeM.x * roof.sizeM.z;
  return roof.sizeM.x * roof.sizeM.y;
}

function baseResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: RoofPanelExposureReadinessInput,
) {
  return {
    schemaVersion: ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
    evidenceLayer: "rpe_input_review" as const,
    stage: snapshot.stage,
    upliftCalculationAvailable: false as const,
    structuralResult: "N/A" as const,
    panelNormalAxis: input.panelNormalAxis,
    exposedFace: input.exposedFace,
    exposureClass: input.exposureClass,
    effectiveWindAreaM2: null,
    roofZone: null,
    aerodynamicInputs: {
      windVelocityMps: null,
      airDensityKgM3: null,
      externalPressureCoefficient: null,
      internalPressureCoefficient: null,
      netPressurePa: null,
      upliftForceN: null,
    } as const,
    mechanicalProperties: {
      panelStiffness: null,
      strengthData: null,
      connectionDemandN: null,
      connectionCapacityN: null,
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

export function assessRoofPanelExposureReadiness(
  snapshot: SmallHouseWindStageSnapshot,
  input: RoofPanelExposureReadinessInput,
): RoofPanelExposureReadinessResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported roof-panel exposure readiness schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.roofComponentId", input.roofComponentId);
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
  if (stageOrder.indexOf(snapshot.stage) < stageOrder.indexOf("roof")) {
    return {
      ...base,
      state: "blocked_stage_before_roof",
      canReview: false,
      reason:
        "The selected stage precedes roof activation. Roof exposure readiness is blocked rather than inferred from later specimen data.",
      roof: null,
      geometricFaceAreaM2: null,
    };
  }

  const selected = snapshot.components.find(
    (component) => component.id === input.roofComponentId,
  );
  if (!selected) {
    return {
      ...base,
      state: "blocked_roof_not_active",
      canReview: false,
      reason:
        "The requested roof panel is not active in the selected validated stage snapshot.",
      roof: null,
      geometricFaceAreaM2: null,
    };
  }

  if (selected.kind !== "roof_panel") {
    return {
      ...base,
      state: "blocked_not_roof_panel",
      canReview: false,
      reason:
        "The selected component exists but is not declared as a roof_panel, so this readiness contract cannot reinterpret it.",
      roof: cloneRoof(selected),
      geometricFaceAreaM2: null,
    };
  }

  return {
    ...base,
    state: "review_ready",
    canReview: true,
    reason:
      "Roof-panel identity, staged geometry/orientation, caller-declared panel-normal axis, exposed-face sign, and exposure class are reviewable. The reported face area is box geometry only. Roof zones, effective wind area, pressure coefficients, net pressure, uplift force, panel stiffness, connection demand/capacity, and whole-house response remain intentionally undefined.",
    roof: cloneRoof(selected),
    geometricFaceAreaM2: geometricFaceAreaM2(selected, input.panelNormalAxis),
  };
}
