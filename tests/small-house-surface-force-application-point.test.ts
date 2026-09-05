import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { mapSmallHouseSurfaceForceApplicationPoint } from "../src/lib/smallHouseWind/surfaceForceApplicationPoint";
import { calculateSmallHouseSurfaceWindAction } from "../src/lib/smallHouseWind/surfaceWindAction";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceApplicationPointInput,
} from "../src/types/smallHouseSurfaceForceApplicationPoint";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceWindActionInput,
} from "../src/types/smallHouseSurfaceWindAction";
import type { SmallHouseWindSpecimenInput } from "../src/types/smallHouseWind";

function northWallActionInput(): SmallHouseSurfaceWindActionInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    surfaceNormalAxis: "local_z",
    airDensityKgPerM3: 1.2,
    windSpeedMps: 20,
    effectiveWindAreaM2: 5,
    signedPressureCoefficient: -0.8,
    globalActionDirection: { x: 0, y: 0, z: 2 },
    airDensitySourceNote: "Synthetic QA density",
    airDensityVerificationState: "unverified",
    windSpeedSourceNote: "Synthetic QA speed",
    windSpeedVerificationState: "unverified",
    effectiveAreaSourceNote: "Synthetic QA effective area",
    effectiveAreaVerificationState: "unverified",
    coefficientSourceNote: "Synthetic QA signed coefficient",
    coefficientVerificationState: "unverified",
    directionSourceNote: "Synthetic QA explicit global direction",
    directionVerificationState: "unverified",
    sourceNote: "Synthetic north-wall analytical action",
    verificationState: "unverified",
  };
}

function mappingInput(): SmallHouseSurfaceForceApplicationPointInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    // Deliberately not the rendered wall center (0, 1.65, -2.25).
    applicationPointGlobalM: { x: 0.37, y: 1.23, z: -2.41 },
    sourceNote: "Synthetic caller-declared force application point for QA only",
    verificationState: "unverified",
  };
}

test("ready north-wall analytical force maps only to the explicit caller-declared global point", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());
  const result = mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, mappingInput());

  assert.equal(result.state, "mapping_ready");
  assert.equal(result.canMap, true);
  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.surfaceComponentId, "synthetic-wall-north");
  assert.deepEqual(result.sourceForceVectorN, { x: -0, y: -0, z: -960 });
  assert.deepEqual(result.applicationPointGlobalM, { x: 0.37, y: 1.23, z: -2.41 });
  assert.equal(result.applicationPointBasis, "caller_declared_global_point");
  assert.equal(result.inferredApplicationPointGlobalM, null);
  assert.equal(result.centerOfPressureGlobalM, null);
  assert.equal(result.solverNodeId, null);
  assert.deepEqual(result.downstreamMechanics, {
    momentTorqueNm: null,
    reactionN: null,
    baseShearN: null,
    upliftReactionN: null,
    slidingReactionN: null,
    rackingDemand: null,
    connectionDemandN: null,
    loadPathDistribution: null,
    passFail: null,
  });
  assert.match(result.reason, /not a geometric centroid/i);
  assert.match(result.reason, /moment\/torque remains unavailable/i);
});

test("mapping preserves force and point by value without aliasing caller/source objects", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());
  const input = mappingInput();
  const result = mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, input);

  assert.notEqual(result.sourceForceVectorN, action.globalForceVectorN);
  assert.notEqual(result.applicationPointGlobalM, input.applicationPointGlobalM);
  assert.deepEqual(result.sourceForceVectorN, action.globalForceVectorN);
  assert.deepEqual(result.applicationPointGlobalM, input.applicationPointGlobalM);

  input.applicationPointGlobalM.x = 999;
  if (action.globalForceVectorN) action.globalForceVectorN.z = 999;

  assert.deepEqual(result.applicationPointGlobalM, { x: 0.37, y: 1.23, z: -2.41 });
  assert.deepEqual(result.sourceForceVectorN, { x: -0, y: -0, z: -960 });
});

test("rendered wall-center drift cannot manufacture or move the explicit application point", () => {
  const altered: SmallHouseWindSpecimenInput = structuredClone(SYNTHETIC_PHASE4_HOUSE);
  const north = altered.components.find((component) => component.id === "synthetic-wall-north");
  assert.ok(north);
  north.centerM = { x: 1.11, y: 2.22, z: -3.33 };

  const originalSnapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const alteredSnapshot = materializeSmallHouseWindStage(altered, "walls");
  const originalAction = calculateSmallHouseSurfaceWindAction(originalSnapshot, northWallActionInput());
  const alteredAction = calculateSmallHouseSurfaceWindAction(alteredSnapshot, northWallActionInput());

  const originalMapping = mapSmallHouseSurfaceForceApplicationPoint(
    originalSnapshot,
    originalAction,
    mappingInput(),
  );
  const alteredMapping = mapSmallHouseSurfaceForceApplicationPoint(
    alteredSnapshot,
    alteredAction,
    mappingInput(),
  );

  assert.deepEqual(alteredMapping.applicationPointGlobalM, originalMapping.applicationPointGlobalM);
  assert.deepEqual(alteredMapping.sourceForceVectorN, originalMapping.sourceForceVectorN);
  assert.notDeepEqual(north.centerM, alteredMapping.applicationPointGlobalM);
});

test("surface ID mismatch is blocked rather than silently remapped", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());
  const input = mappingInput();
  input.surfaceComponentId = "synthetic-wall-east";
  const result = mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, input);

  assert.equal(result.state, "blocked_surface_mismatch");
  assert.equal(result.canMap, false);
  assert.equal(result.sourceForceVectorN, null);
  assert.equal(result.applicationPointGlobalM, null);
  assert.match(result.reason, /exactly match/i);
});

test("blocked source analytical action cannot be promoted by supplying a point", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "floor_ring_frame");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());
  const result = mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, mappingInput());

  assert.equal(action.state, "blocked_stage_before_walls");
  assert.equal(result.state, "blocked_source_action");
  assert.equal(result.canMap, false);
  assert.equal(result.applicationPointBasis, null);
});

test("ready force evidence from a different staged snapshot is blocked as stale", () => {
  const wallSnapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const roofSnapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "roof");
  const wallAction = calculateSmallHouseSurfaceWindAction(wallSnapshot, northWallActionInput());
  const result = mapSmallHouseSurfaceForceApplicationPoint(roofSnapshot, wallAction, mappingInput());

  assert.equal(result.state, "blocked_source_snapshot_mismatch");
  assert.equal(result.canMap, false);
  assert.equal(result.applicationPointGlobalM, null);
  assert.match(result.reason, /different staged snapshot/i);
});

test("missing/non-finite application coordinates and provenance are rejected", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());

  for (const [axis, value] of [
    ["x", Number.NaN],
    ["y", Number.POSITIVE_INFINITY],
    ["z", Number.NEGATIVE_INFINITY],
  ] as const) {
    const input = mappingInput();
    input.applicationPointGlobalM[axis] = value;
    assert.throws(
      () => mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, input),
      new RegExp(`applicationPointGlobalM\\.${axis} must be finite`),
    );
  }

  const missingSource = mappingInput();
  missingSource.sourceNote = "";
  assert.throws(
    () => mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, missingSource),
    /sourceNote must be non-empty/,
  );

  const badVerification = mappingInput();
  badVerification.verificationState = "assumed_verified" as never;
  assert.throws(
    () => mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, badVerification),
    /supported verification state/,
  );
});
