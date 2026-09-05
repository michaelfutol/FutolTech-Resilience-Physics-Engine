import type { GenesisVector3, GenesisVerificationState } from "../../types/genesis";
import type { SmallHouseSurfaceForceApplicationPointResult } from "../../types/smallHouseSurfaceForceApplicationPoint";
import {
  SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceMomentInput,
  type SmallHouseSurfaceForceMomentResult,
} from "../../types/smallHouseSurfaceForceMoment";
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
  input: SmallHouseSurfaceForceMomentInput,
  state: Exclude<SmallHouseSurfaceForceMomentResult["state"], "analytical_ready">,
  reason: string,
): SmallHouseSurfaceForceMomentResult {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state,
    canCalculate: false,
    structuralResult: "N/A",
    reason,
    surfaceComponentId: input.surfaceComponentId || null,
    sourceForceVectorN: null,
    applicationPointGlobalM: null,
    referencePointGlobalM: null,
    leverArmGlobalM: null,
    forceMomentVectorNm: null,
    forceMomentMagnitudeNm: null,
    momentBasis: null,
    aerodynamicTorqueNm: null,
    downstreamMechanics: downstreamMechanics(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function calculateSmallHouseSurfaceForceMoment(
  snapshot: SmallHouseWindStageSnapshot,
  sourceMapping: SmallHouseSurfaceForceApplicationPointResult,
  input: SmallHouseSurfaceForceMomentInput,
): SmallHouseSurfaceForceMomentResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(`Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`);
  }
  if (input.schemaVersion !== SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported surface force moment schema version: ${String(input.schemaVersion)}`,
    );
  }

  const requestedSurfaceId = requireText("input.surfaceComponentId", input.surfaceComponentId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  const referencePointGlobalM = finitePoint(
    "input.referencePointGlobalM",
    input.referencePointGlobalM,
  );

  if (
    sourceMapping.state !== "mapping_ready" ||
    !sourceMapping.canMap ||
    !sourceMapping.surfaceComponentId ||
    !sourceMapping.sourceForceVectorN ||
    !sourceMapping.applicationPointGlobalM
  ) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_mapping",
      "Force-moment calculation requires an already-ready explicit force application-point mapping. A blocked or incomplete mapping cannot be promoted by declaring a reference point.",
    );
  }

  if (sourceMapping.stage !== snapshot.stage) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_snapshot_mismatch",
      "The application-point mapping belongs to a different staged snapshot. Stale higher-stage force/location evidence cannot be used for a current-snapshot moment calculation.",
    );
  }

  if (sourceMapping.surfaceComponentId !== requestedSurfaceId) {
    return blockedResult(
      snapshot,
      input,
      "blocked_surface_mismatch",
      "The caller-declared moment surface ID must exactly match the stable surface ID carried by the ready force application-point mapping.",
    );
  }

  const activeSurface = snapshot.components.find(
    (component) => component.id === requestedSurfaceId,
  );
  if (!activeSurface) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_mapping",
      "The mapped surface is not active in the current staged snapshot. No force moment is retained for stale or unavailable geometry.",
    );
  }

  const sourceForceVectorN: GenesisVector3 = {
    x: sourceMapping.sourceForceVectorN.x,
    y: sourceMapping.sourceForceVectorN.y,
    z: sourceMapping.sourceForceVectorN.z,
  };
  const applicationPointGlobalM: GenesisVector3 = {
    x: sourceMapping.applicationPointGlobalM.x,
    y: sourceMapping.applicationPointGlobalM.y,
    z: sourceMapping.applicationPointGlobalM.z,
  };
  const leverArmGlobalM: GenesisVector3 = {
    x: applicationPointGlobalM.x - referencePointGlobalM.x,
    y: applicationPointGlobalM.y - referencePointGlobalM.y,
    z: applicationPointGlobalM.z - referencePointGlobalM.z,
  };
  const forceMomentVectorNm: GenesisVector3 = {
    x:
      leverArmGlobalM.y * sourceForceVectorN.z -
      leverArmGlobalM.z * sourceForceVectorN.y,
    y:
      leverArmGlobalM.z * sourceForceVectorN.x -
      leverArmGlobalM.x * sourceForceVectorN.z,
    z:
      leverArmGlobalM.x * sourceForceVectorN.y -
      leverArmGlobalM.y * sourceForceVectorN.x,
  };
  const forceMomentMagnitudeNm = Math.hypot(
    forceMomentVectorNm.x,
    forceMomentVectorNm.y,
    forceMomentVectorNm.z,
  );

  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state: "analytical_ready",
    canCalculate: true,
    structuralResult: "N/A",
    reason:
      "The reported vector is only the ordinary statics moment r×F of one accepted mapped surface force about one caller-declared global reference point. It is not an aerodynamic torque/free couple, support reaction, structural solver response, connection demand, racking result, or adequacy verdict.",
    surfaceComponentId: requestedSurfaceId,
    sourceForceVectorN,
    applicationPointGlobalM,
    referencePointGlobalM,
    leverArmGlobalM,
    forceMomentVectorNm,
    forceMomentMagnitudeNm,
    momentBasis: "force_moment_about_caller_declared_global_reference_point",
    aerodynamicTorqueNm: null,
    downstreamMechanics: downstreamMechanics(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}
