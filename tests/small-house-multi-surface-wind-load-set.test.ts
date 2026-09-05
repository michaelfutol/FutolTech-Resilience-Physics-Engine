import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { calculateSmallHouseMultiSurfaceWindLoadSet } from "../src/lib/smallHouseWind/multiSurfaceWindLoadSet";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
  type SmallHouseMultiSurfaceWindLoadSetInput,
} from "../src/types/smallHouseMultiSurfaceWindLoadSet";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceWindActionInput,
} from "../src/types/smallHouseSurfaceWindAction";

function northWallAction(): SmallHouseSurfaceWindActionInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    surfaceNormalAxis: "local_z",
    airDensityKgPerM3: 1.2,
    windSpeedMps: 20,
    effectiveWindAreaM2: 5,
    signedPressureCoefficient: -0.8,
    globalActionDirection: { x: 0, y: 0, z: 2 },
    airDensitySourceNote: "Synthetic QA density for north wall",
    airDensityVerificationState: "unverified",
    windSpeedSourceNote: "Synthetic QA wind speed for north wall",
    windSpeedVerificationState: "unverified",
    effectiveAreaSourceNote: "Synthetic QA effective area for north wall",
    effectiveAreaVerificationState: "unverified",
    coefficientSourceNote: "Synthetic QA signed coefficient for north wall",
    coefficientVerificationState: "unverified",
    directionSourceNote: "Synthetic QA explicit north-wall global action direction",
    directionVerificationState: "unverified",
    sourceNote: "Synthetic north-wall surface action for multi-surface regression",
    verificationState: "unverified",
  };
}

function eastWallAction(): SmallHouseSurfaceWindActionInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-east",
    surfaceNormalAxis: "local_x",
    airDensityKgPerM3: 1.2,
    windSpeedMps: 20,
    effectiveWindAreaM2: 4,
    signedPressureCoefficient: 0.5,
    globalActionDirection: { x: 5, y: 0, z: 0 },
    airDensitySourceNote: "Synthetic QA density for east wall",
    airDensityVerificationState: "unverified",
    windSpeedSourceNote: "Synthetic QA wind speed for east wall",
    windSpeedVerificationState: "unverified",
    effectiveAreaSourceNote: "Synthetic QA effective area for east wall",
    effectiveAreaVerificationState: "unverified",
    coefficientSourceNote: "Synthetic QA signed coefficient for east wall",
    coefficientVerificationState: "unverified",
    directionSourceNote: "Synthetic QA explicit east-wall global action direction",
    directionVerificationState: "unverified",
    sourceNote: "Synthetic east-wall surface action for multi-surface regression",
    verificationState: "unverified",
  };
}

function loadSet(actions = [northWallAction(), eastWallAction()]): SmallHouseMultiSurfaceWindLoadSetInput {
  return {
    schemaVersion: SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,
    surfaceActions: actions,
    sourceNote: "Synthetic two-wall vector aggregation regression only",
    verificationState: "unverified",
  };
}

function near(actual: number | null, expected: number, tolerance = 1e-12): void {
  assert.notEqual(actual, null);
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `${actual} != ${expected}`);
}

test("two explicit wall actions reproduce each hand-check and only algebraically sum their global vectors", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const result = calculateSmallHouseMultiSurfaceWindLoadSet(snapshot, loadSet());

  assert.equal(result.state, "analytical_ready");
  assert.equal(result.canCalculate, true);
  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.equal(result.structuralResult, "N/A");
  assert.deepEqual(
    result.surfaceResults.map((item) => item.surface?.id),
    ["synthetic-wall-east", "synthetic-wall-north"],
  );

  const east = result.surfaceResults[0];
  near(east.geometricFaceAreaM2, 9.03);
  near(east.dynamicPressurePa, 240);
  near(east.scalarSurfaceForceN, 480);
  assert.deepEqual(east.globalForceVectorN, { x: 480, y: 0, z: 0 });

  const north = result.surfaceResults[1];
  near(north.geometricFaceAreaM2, 7.14);
  near(north.dynamicPressurePa, 240);
  near(north.scalarSurfaceForceN, -960);
  assert.deepEqual(north.globalForceVectorN, { x: -0, y: -0, z: -960 });

  assert.deepEqual(result.globalForceVectorSumN, { x: 480, y: 0, z: -960 });
  near(result.resultantForceMagnitudeN, Math.hypot(480, 0, -960));
  assert.deepEqual(result.downstreamMechanics, {
    reactionN: null,
    baseShearN: null,
    upliftReactionN: null,
    slidingReactionN: null,
    rackingDemand: null,
    connectionDemandN: null,
    momentTorqueNm: null,
    loadPathDistribution: null,
    passFail: null,
  });
  assert.match(result.reason, /not a support reaction/i);
  assert.match(result.reason, /moment\/torque/i);
});

test("reversing caller array order produces the same stable-ID canonical load-set result", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const forward = calculateSmallHouseMultiSurfaceWindLoadSet(snapshot, loadSet());
  const reversed = calculateSmallHouseMultiSurfaceWindLoadSet(
    snapshot,
    loadSet([eastWallAction(), northWallAction()]),
  );

  assert.deepEqual(reversed, forward);
});

test("fewer than two surfaces is blocked rather than promoted to a multi-surface result", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const result = calculateSmallHouseMultiSurfaceWindLoadSet(
    snapshot,
    loadSet([northWallAction()]),
  );

  assert.equal(result.state, "blocked_insufficient_surfaces");
  assert.equal(result.canCalculate, false);
  assert.equal(result.surfaceResults.length, 0);
  assert.equal(result.globalForceVectorSumN, null);
  assert.equal(result.resultantForceMagnitudeN, null);
});

test("duplicate stable surface IDs are blocked and never silently combined", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const duplicate = northWallAction();
  duplicate.signedPressureCoefficient = 0.2;
  const result = calculateSmallHouseMultiSurfaceWindLoadSet(
    snapshot,
    loadSet([northWallAction(), duplicate]),
  );

  assert.equal(result.state, "blocked_duplicate_surface");
  assert.equal(result.failedSurfaceComponentId, "synthetic-wall-north");
  assert.equal(result.globalForceVectorSumN, null);
  assert.match(result.reason, /silently combined/i);
});

test("one blocked future-stage surface blocks the entire set and produces no partial sum", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const roof = eastWallAction();
  roof.surfaceComponentId = "synthetic-roof-west";
  roof.surfaceNormalAxis = "local_y";
  const result = calculateSmallHouseMultiSurfaceWindLoadSet(
    snapshot,
    loadSet([northWallAction(), roof]),
  );

  assert.equal(result.state, "blocked_surface_action");
  assert.equal(result.failedSurfaceComponentId, "synthetic-roof-west");
  assert.equal(result.globalForceVectorSumN, null);
  assert.equal(result.resultantForceMagnitudeN, null);
  assert.equal(result.surfaceResults.at(-1)?.state, "blocked_surface_not_active");
});

test("an invalid individual aerodynamic/action input blocks the set instead of throwing a partial engineering result", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const invalidNorth = northWallAction();
  invalidNorth.effectiveWindAreaM2 = 0;
  const result = calculateSmallHouseMultiSurfaceWindLoadSet(
    snapshot,
    loadSet([eastWallAction(), invalidNorth]),
  );

  assert.equal(result.state, "blocked_surface_action");
  assert.equal(result.failedSurfaceComponentId, "synthetic-wall-north");
  assert.match(result.failureMessage ?? "", /effectiveWindAreaM2 must be greater than zero/);
  assert.equal(result.globalForceVectorSumN, null);
  assert.equal(result.resultantForceMagnitudeN, null);
});

test("lowering below wall activation blocks the load set through the same single-surface stage contract", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "floor_ring_frame");
  const result = calculateSmallHouseMultiSurfaceWindLoadSet(snapshot, loadSet());

  assert.equal(result.state, "blocked_surface_action");
  assert.equal(result.canCalculate, false);
  assert.equal(result.surfaceResults[0]?.state, "blocked_stage_before_walls");
  assert.equal(result.globalForceVectorSumN, null);
  assert.equal(result.downstreamMechanics.reactionN, null);
  assert.equal(result.downstreamMechanics.momentTorqueNm, null);
  assert.equal(result.downstreamMechanics.passFail, null);
});

test("load-set provenance and verification remain mandatory", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");

  const missingSource = loadSet();
  missingSource.sourceNote = "";
  assert.throws(
    () => calculateSmallHouseMultiSurfaceWindLoadSet(snapshot, missingSource),
    /sourceNote must be non-empty/,
  );

  const badVerification = loadSet();
  badVerification.verificationState = "assumed_verified" as never;
  assert.throws(
    () => calculateSmallHouseMultiSurfaceWindLoadSet(snapshot, badVerification),
    /supported verification state/,
  );
});
