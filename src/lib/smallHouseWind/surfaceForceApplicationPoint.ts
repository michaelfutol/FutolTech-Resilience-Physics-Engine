import type { GenesisVector3, GenesisVerificationState } from "../../types/genesis";
import {
  SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceApplicationPointInput,
  type SmallHouseSurfaceForceApplicationPointResult,
} from "../../types/smallHouseSurfaceForceApplicationPoint";
import type { SmallHouseSurfaceWindActionResult } from "../../types/smallHouseSurfaceWindAction";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);

function requireText(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${name} must be non-empty`);
  return trimmed;
}

function validateVerificationState(name: string, value: GenesisVerificationState): void {
  if (!VERIFICATION_STATES.has(value)) {
    throw new Error(`${name} must be a supported verification state`);
  }
}

function finitePoint(name: string, value: GenesisVector3): GenesisVector3 {
  for (const [axis, component] of Object.entries(value) as Array<
    [keyof GenesisVector3, number]
  >) {
    if (!Number.isFinite(component)) {
      throw new Error(`${name}.${axis} must be finite`);
    }
  }
  return { x: value.x, y: value.y, z: value.z };
}

function downstreamMechanics() {
  return {
    momentTorqueNm: null,
    reactionN: null,
    baseShearN: null,
    upliftReactionN: null,
    slidingReactionN: null,
    rackingDemand: null,
    connectionDemandN: null,
    loadPathDistribution: null,
    passFail: null,
  } as const;
}

function blockedResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: SmallHouseSurfaceForceApplicationPointInput,
  state: Exclude<SmallHouseSurfaceForceApplicationPointResult["state"], "mapping_ready">,
  reason: string,
  surfaceComponentId: string | null,
): SmallHouseSurfaceForceApplicationPointResult {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state,
    canMap: false,
    structuralResult: "N/A",
    reason,
    surfaceComponentId,
    sourceForceVectorN: null,
    applicationPointGlobalM: null,
    applicationPointBasis: null,
    inferredApplicationPointGlobalM: null,
    centerOfPressureGlobalM: null,
    solverNodeId: null,
    downstreamMechanics: downstreamMechanics(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function mapSmallHouseSurfaceForceApplicationPoint(
  snapshot: SmallHouseWindStageSnapshot,
  sourceAction: SmallHouseSurfaceWindActionResult,
  input: SmallHouseSurfaceForceApplicationPointInput,
): SmallHouseSurfaceForceApplicationPointResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(`Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`);
  }
  if (input.schemaVersion !== SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported surface force application-point schema version: ${String(input.schemaVersion)}`,
    );
  }

  const requestedSurfaceId = requireText("input.surfaceComponentId", input.surfaceComponentId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  const applicationPointGlobalM = finitePoint(
    "input.applicationPointGlobalM",
    input.applicationPointGlobalM,
  );

  if (
    sourceAction.state !== "analytical_ready" ||
    !sourceAction.canCalculate ||
    !sourceAction.surface ||
    !sourceAction.globalForceVectorN
  ) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_action",
      "Application-point mapping requires an already-ready single-surface analytical action. A blocked or incomplete aerodynamic action cannot be promoted by adding a point.",
      requestedSurfaceId,
    );
  }

  if (sourceAction.stage !== snapshot.stage) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_snapshot_mismatch",
      "The analytical source action was produced for a different staged snapshot. Stale higher-stage force evidence cannot be mapped into the current snapshot.",
      requestedSurfaceId,
    );
  }

  if (sourceAction.surface.id !== requestedSurfaceId) {
    return blockedResult(
      snapshot,
      input,
      "blocked_surface_mismatch",
      "The caller-declared application-point surface ID must exactly match the stable surface ID carried by the ready analytical action.",
      requestedSurfaceId,
    );
  }

  const activeSurface = snapshot.components.find(
    (component) => component.id === requestedSurfaceId,
  );
  if (!activeSurface || activeSurface.id !== sourceAction.surface.id) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_action",
      "The source surface is not active in the current staged snapshot. No application point is retained for stale or unavailable geometry.",
      requestedSurfaceId,
    );
  }

  const sourceForceVectorN: GenesisVector3 = {
    x: sourceAction.globalForceVectorN.x,
    y: sourceAction.globalForceVectorN.y,
    z: sourceAction.globalForceVectorN.z,
  };

  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state: "mapping_ready",
    canMap: true,
    structuralResult: "N/A",
    reason:
      "The result preserves one accepted analytical surface-force vector and attaches only a caller-declared global application point. The point is not a geometric centroid, center of pressure, joint, support, anchor, nearest member, solver node, or inferred load-path destination. Moment/torque remains unavailable until a separate explicit reference-point/axis contract exists.",
    surfaceComponentId: requestedSurfaceId,
    sourceForceVectorN,
    applicationPointGlobalM,
    applicationPointBasis: "caller_declared_global_point",
    inferredApplicationPointGlobalM: null,
    centerOfPressureGlobalM: null,
    solverNodeId: null,
    downstreamMechanics: downstreamMechanics(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}
