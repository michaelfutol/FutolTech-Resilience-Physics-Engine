import type { GenesisVerificationState } from "../../types/genesis";
import {
  SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
  type SmallHouseMultiSurfaceWindLoadSetInput,
  type SmallHouseMultiSurfaceWindLoadSetResult,
} from "../../types/smallHouseMultiSurfaceWindLoadSet";
import type { SmallHouseSurfaceWindActionResult } from "../../types/smallHouseSurfaceWindAction";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";
import { calculateSmallHouseSurfaceWindAction } from "./surfaceWindAction";

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

function downstreamMechanics() {
  return {
    reactionN: null,
    baseShearN: null,
    upliftReactionN: null,
    slidingReactionN: null,
    rackingDemand: null,
    connectionDemandN: null,
    momentTorqueNm: null,
    loadPathDistribution: null,
    passFail: null,
  } as const;
}

function blockedResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: SmallHouseMultiSurfaceWindLoadSetInput,
  state: Exclude<SmallHouseMultiSurfaceWindLoadSetResult["state"], "analytical_ready">,
  reason: string,
  surfaceResults: SmallHouseSurfaceWindActionResult[],
  failedSurfaceComponentId: string | null,
  failureMessage: string | null,
): SmallHouseMultiSurfaceWindLoadSetResult {
  return {
    schemaVersion: SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state,
    canCalculate: false,
    structuralResult: "N/A",
    reason,
    surfaceResults,
    failedSurfaceComponentId,
    failureMessage,
    globalForceVectorSumN: null,
    resultantForceMagnitudeN: null,
    downstreamMechanics: downstreamMechanics(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function calculateSmallHouseMultiSurfaceWindLoadSet(
  snapshot: SmallHouseWindStageSnapshot,
  input: SmallHouseMultiSurfaceWindLoadSetInput,
): SmallHouseMultiSurfaceWindLoadSetResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`,
    );
  }
  if (input.schemaVersion !== SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported multi-surface wind load-set schema version: ${String(input.schemaVersion)}`,
    );
  }

  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);

  if (input.surfaceActions.length < 2) {
    return blockedResult(
      snapshot,
      input,
      "blocked_insufficient_surfaces",
      "At least two explicit surface-action records are required. A single action remains a single-surface calculation rather than a multi-surface load set.",
      [],
      null,
      null,
    );
  }

  const sortedActions = [...input.surfaceActions].sort((a, b) =>
    a.surfaceComponentId.localeCompare(b.surfaceComponentId),
  );
  const seenSurfaceIds = new Set<string>();
  for (const action of sortedActions) {
    const stableId = action.surfaceComponentId.trim();
    if (seenSurfaceIds.has(stableId)) {
      return blockedResult(
        snapshot,
        input,
        "blocked_duplicate_surface",
        "Duplicate surface component IDs are prohibited in schema v0.1.0. Multiple load patches on one surface must use a future explicit patch contract rather than being silently combined.",
        [],
        stableId || null,
        stableId ? `Duplicate surfaceComponentId: ${stableId}` : "Duplicate blank surfaceComponentId",
      );
    }
    seenSurfaceIds.add(stableId);
  }

  const surfaceResults: SmallHouseSurfaceWindActionResult[] = [];
  for (const action of sortedActions) {
    let result: SmallHouseSurfaceWindActionResult;
    try {
      result = calculateSmallHouseSurfaceWindAction(snapshot, action);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return blockedResult(
        snapshot,
        input,
        "blocked_surface_action",
        "One explicit surface-action record is invalid. The load set is blocked and no partial vector sum is produced.",
        surfaceResults,
        action.surfaceComponentId || null,
        message,
      );
    }

    surfaceResults.push(result);
    if (result.state !== "analytical_ready" || !result.globalForceVectorN) {
      return blockedResult(
        snapshot,
        input,
        "blocked_surface_action",
        "One explicit surface action is not analytically ready. The load set is blocked and no partial vector sum is produced.",
        surfaceResults,
        action.surfaceComponentId,
        result.reason,
      );
    }
  }

  const globalForceVectorSumN = surfaceResults.reduce(
    (sum, result) => ({
      x: sum.x + result.globalForceVectorN!.x,
      y: sum.y + result.globalForceVectorN!.y,
      z: sum.z + result.globalForceVectorN!.z,
    }),
    { x: 0, y: 0, z: 0 },
  );
  const resultantForceMagnitudeN = Math.hypot(
    globalForceVectorSumN.x,
    globalForceVectorSumN.y,
    globalForceVectorSumN.z,
  );

  return {
    schemaVersion: SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    stage: snapshot.stage,
    state: "analytical_ready",
    canCalculate: true,
    structuralResult: "N/A",
    reason:
      "The result is only the deterministic algebraic sum of explicit single-surface RPE analytical force vectors. It is not a support reaction, base shear from a structural model, connection demand, uplift/sliding demand, racking demand, moment/torque, load-path distribution, CFD integration, code-compliance result, or adequacy verdict.",
    surfaceResults,
    failedSurfaceComponentId: null,
    failureMessage: null,
    globalForceVectorSumN,
    resultantForceMagnitudeN,
    downstreamMechanics: downstreamMechanics(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}
