import type {
  GenesisVector3,
  GenesisVerificationState,
} from "../../types/genesis";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceNormalAxis,
  type SmallHouseSurfaceWindActionInput,
  type SmallHouseSurfaceWindActionResult,
} from "../../types/smallHouseSurfaceWindAction";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseStructuralComponentInput,
  type SmallHouseWindStage,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";
import {
  calculateDynamicPressurePa,
  calculatePanelWindForceN,
} from "../genesis/wind";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);
const NORMAL_AXES = new Set<SmallHouseSurfaceNormalAxis>([
  "local_x",
  "local_y",
  "local_z",
]);
const STAGE_ORDER: readonly SmallHouseWindStage[] = [
  "empty_envelope",
  "primary_supports",
  "floor_ring_frame",
  "walls",
  "roof",
  "connections",
  "bracing",
  "anchorage",
  "storm_protection",
];

function requireText(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${name} must be non-empty`);
  return trimmed;
}

function requireFinite(name: string, value: number): number {
  if (!Number.isFinite(value)) throw new Error(`${name} must be a finite number`);
  return value;
}

function requirePositive(name: string, value: number): number {
  const finite = requireFinite(name, value);
  if (finite <= 0) throw new Error(`${name} must be greater than zero`);
  return finite;
}

function validateVerificationState(
  name: string,
  value: GenesisVerificationState,
): void {
  if (!VERIFICATION_STATES.has(value)) {
    throw new Error(`${name} must be a supported verification state`);
  }
}

function cloneSurface(
  surface: SmallHouseStructuralComponentInput,
): SmallHouseStructuralComponentInput {
  return {
    ...surface,
    centerM: { ...surface.centerM },
    sizeM: { ...surface.sizeM },
    rotationRad: { ...surface.rotationRad },
  };
}

function geometricFaceAreaM2(
  surface: SmallHouseStructuralComponentInput,
  normalAxis: SmallHouseSurfaceNormalAxis,
): number {
  if (normalAxis === "local_x") return surface.sizeM.y * surface.sizeM.z;
  if (normalAxis === "local_y") return surface.sizeM.x * surface.sizeM.z;
  return surface.sizeM.x * surface.sizeM.y;
}

function normalizeDirection(direction: GenesisVector3): GenesisVector3 {
  const x = requireFinite("input.globalActionDirection.x", direction.x);
  const y = requireFinite("input.globalActionDirection.y", direction.y);
  const z = requireFinite("input.globalActionDirection.z", direction.z);
  const magnitude = Math.hypot(x, y, z);
  if (!(magnitude > 0)) {
    throw new Error("input.globalActionDirection must be a non-zero finite vector");
  }
  return {
    x: x / magnitude,
    y: y / magnitude,
    z: z / magnitude,
  };
}

function provenance(input: SmallHouseSurfaceWindActionInput) {
  return {
    airDensitySourceNote: input.airDensitySourceNote,
    airDensityVerificationState: input.airDensityVerificationState,
    windSpeedSourceNote: input.windSpeedSourceNote,
    windSpeedVerificationState: input.windSpeedVerificationState,
    effectiveAreaSourceNote: input.effectiveAreaSourceNote,
    effectiveAreaVerificationState: input.effectiveAreaVerificationState,
    coefficientSourceNote: input.coefficientSourceNote,
    coefficientVerificationState: input.coefficientVerificationState,
    directionSourceNote: input.directionSourceNote,
    directionVerificationState: input.directionVerificationState,
    sourceNote: input.sourceNote,
    verificationState: input.verificationState,
  };
}

function blockedResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: SmallHouseSurfaceWindActionInput,
  state: Exclude<SmallHouseSurfaceWindActionResult["state"], "analytical_ready">,
  reason: string,
  surface: SmallHouseStructuralComponentInput | null,
): SmallHouseSurfaceWindActionResult {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state,
    canCalculate: false,
    structuralResult: "N/A",
    reason,
    surface: surface ? cloneSurface(surface) : null,
    surfaceNormalAxis: input.surfaceNormalAxis,
    geometricFaceAreaM2: null,
    effectiveWindAreaM2: null,
    airDensityKgPerM3: null,
    windSpeedMps: null,
    signedPressureCoefficient: null,
    dynamicPressurePa: null,
    signedSurfacePressurePa: null,
    scalarSurfaceForceN: null,
    normalizedGlobalActionDirection: null,
    globalForceVectorN: null,
    downstreamMechanics: {
      connectionDemandN: null,
      connectionCapacityAssessment: null,
      supportReactionsN: null,
      upliftReactionN: null,
      slidingReactionN: null,
      rackingIndicator: null,
      passFail: null,
    },
    provenance: provenance(input),
  };
}

export function calculateSmallHouseSurfaceWindAction(
  snapshot: SmallHouseWindStageSnapshot,
  input: SmallHouseSurfaceWindActionInput,
): SmallHouseSurfaceWindActionResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported surface wind-action schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.surfaceComponentId", input.surfaceComponentId);
  if (!NORMAL_AXES.has(input.surfaceNormalAxis)) {
    throw new Error("input.surfaceNormalAxis must be local_x, local_y, or local_z");
  }

  const airDensityKgPerM3 = requirePositive(
    "input.airDensityKgPerM3",
    input.airDensityKgPerM3,
  );
  const windSpeedMps = requirePositive("input.windSpeedMps", input.windSpeedMps);
  const effectiveWindAreaM2 = requirePositive(
    "input.effectiveWindAreaM2",
    input.effectiveWindAreaM2,
  );
  const signedPressureCoefficient = requireFinite(
    "input.signedPressureCoefficient",
    input.signedPressureCoefficient,
  );
  const normalizedDirection = normalizeDirection(input.globalActionDirection);

  requireText("input.airDensitySourceNote", input.airDensitySourceNote);
  validateVerificationState(
    "input.airDensityVerificationState",
    input.airDensityVerificationState,
  );
  requireText("input.windSpeedSourceNote", input.windSpeedSourceNote);
  validateVerificationState(
    "input.windSpeedVerificationState",
    input.windSpeedVerificationState,
  );
  requireText("input.effectiveAreaSourceNote", input.effectiveAreaSourceNote);
  validateVerificationState(
    "input.effectiveAreaVerificationState",
    input.effectiveAreaVerificationState,
  );
  requireText("input.coefficientSourceNote", input.coefficientSourceNote);
  validateVerificationState(
    "input.coefficientVerificationState",
    input.coefficientVerificationState,
  );
  requireText("input.directionSourceNote", input.directionSourceNote);
  validateVerificationState(
    "input.directionVerificationState",
    input.directionVerificationState,
  );
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);

  if (STAGE_ORDER.indexOf(snapshot.stage) < STAGE_ORDER.indexOf("walls")) {
    return blockedResult(
      snapshot,
      input,
      "blocked_stage_before_walls",
      "The selected stage precedes wall activation. Surface wind action is blocked rather than evaluated from future specimen data.",
      null,
    );
  }

  const selected = snapshot.components.find(
    (component) => component.id === input.surfaceComponentId,
  );
  if (!selected) {
    return blockedResult(
      snapshot,
      input,
      "blocked_surface_not_active",
      "The requested surface component is not active in this validated stage snapshot.",
      null,
    );
  }

  if (selected.kind !== "wall_panel" && selected.kind !== "roof_panel") {
    return blockedResult(
      snapshot,
      input,
      "blocked_not_wall_or_roof_panel",
      "The selected component exists but is not explicitly declared as a wall_panel or roof_panel. This analytical surface contract will not reinterpret other geometry as an aerodynamic surface.",
      selected,
    );
  }

  const dynamicPressurePa = calculateDynamicPressurePa(
    windSpeedMps,
    airDensityKgPerM3,
  );
  const scalarSurfaceForceN = calculatePanelWindForceN(
    dynamicPressurePa,
    effectiveWindAreaM2,
    signedPressureCoefficient,
  );
  const signedSurfacePressurePa = dynamicPressurePa * signedPressureCoefficient;
  const globalForceVectorN = {
    x: scalarSurfaceForceN * normalizedDirection.x,
    y: scalarSurfaceForceN * normalizedDirection.y,
    z: scalarSurfaceForceN * normalizedDirection.z,
  };

  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state: "analytical_ready",
    canCalculate: true,
    structuralResult: "N/A",
    reason:
      "A transparent single-surface analytical wind action was calculated from explicit caller-supplied density, speed, effective area, signed coefficient, and global action direction. The geometry-only face area is reported separately and is not substituted for effective area. No code coefficient, CFD pressure, tributary load path, connection demand, reaction, resistance, or structural adequacy is inferred.",
    surface: cloneSurface(selected),
    surfaceNormalAxis: input.surfaceNormalAxis,
    geometricFaceAreaM2: geometricFaceAreaM2(selected, input.surfaceNormalAxis),
    effectiveWindAreaM2,
    airDensityKgPerM3,
    windSpeedMps,
    signedPressureCoefficient,
    dynamicPressurePa,
    signedSurfacePressurePa,
    scalarSurfaceForceN,
    normalizedGlobalActionDirection: normalizedDirection,
    globalForceVectorN,
    downstreamMechanics: {
      connectionDemandN: null,
      connectionCapacityAssessment: null,
      supportReactionsN: null,
      upliftReactionN: null,
      slidingReactionN: null,
      rackingIndicator: null,
      passFail: null,
    },
    provenance: provenance(input),
  };
}
