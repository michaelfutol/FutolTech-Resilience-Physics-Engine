import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { mapSmallHouseSurfaceForceApplicationPoint } from "../src/lib/smallHouseWind/surfaceForceApplicationPoint";
import { calculateSmallHouseSurfaceForceMoment } from "../src/lib/smallHouseWind/surfaceForceMoment";
import { calculateSmallHouseSurfaceWindAction } from "../src/lib/smallHouseWind/surfaceWindAction";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceApplicationPointInput,
} from "../src/types/smallHouseSurfaceForceApplicationPoint";
import {
  SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceMomentInput,
} from "../src/types/smallHouseSurfaceForceMoment";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceWindActionInput,
} from "../src/types/smallHouseSurfaceWindAction";

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
    coefficientSourceNote: "Synthetic QA coefficient",
    coefficientVerificationState: "unverified",
    directionSourceNote: "Synthetic QA direction",
    directionVerificationState: "unverified",
    sourceNote: "Synthetic north-wall analytical action",
    verificationState: "unverified",
  };
}

function applicationInput(
  point = { x: 0.37, y: 1.23, z: -2.41 },
): SmallHouseSurfaceForceApplicationPointInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    applicationPointGlobalM: { ...point },
    sourceNote: "Synthetic caller-declared force application point",
    verificationState: "unverified",
  };
}

function momentInput(
  referencePoint = { x: 0.1, y: 0.2, z: -2.0 },
): SmallHouseSurfaceForceMomentInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    referencePointGlobalM: { ...referencePoint },
    sourceNote: "Synthetic caller-declared moment reference point",
    verificationState: "unverified",
  };
}

function readyFixture(
  applicationPoint = { x: 0.37, y: 1.23, z: -2.41 },
) {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());
  const mapping = mapSmallHouseSurfaceForceApplicationPoint(
    snapshot,
    action,
    applicationInput(applicationPoint),
  );
  return { snapshot, action, mapping };
}

function near(actual: number | null, expected: number, tolerance = 1e-9): void {
  assert.notEqual(actual, null);
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `${actual} != ${expected}`);
}

test("explicit nonzero reference point yields the hand-checkable ordinary force moment r cross F", () => {
  const { snapshot, mapping } = readyFixture();
  const result = calculateSmallHouseSurfaceForceMoment(snapshot, mapping, momentInput());

  assert.equal(result.state, "analytical_ready");
  assert.equal(result.canCalculate, true);
  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.surfaceComponentId, "synthetic-wall-north");
  assert.deepEqual(result.sourceForceVectorN, { x: -0, y: -0, z: -960 });
  assert.deepEqual(result.applicationPointGlobalM, { x: 0.37, y: 1.23, z: -2.41 });
  assert.deepEqual(result.referencePointGlobalM, { x: 0.1, y: 0.2, z: -2.0 });
  assert.deepEqual(result.leverArmGlobalM, {
    x: 0.27,
    y: 1.03,
    z: -0.41000000000000014,
  });
  near(result.forceMomentVectorNm?.x ?? null, -988.8);
  near(result.forceMomentVectorNm?.y ?? null, 259.2);
  near(result.forceMomentVectorNm?.z ?? null, 0);
  near(result.forceMomentMagnitudeNm, 1022.2084327572337);
  assert.equal(
    result.momentBasis,
    "force_moment_about_caller_declared_global_reference_point",
  );
  assert.equal(result.aerodynamicTorqueNm, null);
  assert.deepEqual(result.downstreamMechanics, {
    reactionN: null,
    baseShearN: null,
    upliftReactionN: null,
    slidingReactionN: null,
    rackingDemand: null,
    connectionDemandN: null,
    loadPathDistribution: null,
    passFail: null,
  });
  assert.match(result.reason, /ordinary statics moment r×F/i);
  assert.match(result.reason, /not an aerodynamic torque/i);
});

test("translating both application and reference points equally preserves lever arm and moment", () => {
  const base = readyFixture({ x: 0.37, y: 1.23, z: -2.41 });
  const baseResult = calculateSmallHouseSurfaceForceMoment(
    base.snapshot,
    base.mapping,
    momentInput({ x: 0.1, y: 0.2, z: -2.0 }),
  );

  const shifted = readyFixture({ x: 10.37, y: -2.77, z: 4.59 });
  const shiftedResult = calculateSmallHouseSurfaceForceMoment(
    shifted.snapshot,
    shifted.mapping,
    momentInput({ x: 10.1, y: -3.8, z: 5.0 }),
  );

  near(shiftedResult.leverArmGlobalM?.x ?? null, baseResult.leverArmGlobalM?.x ?? 0);
  near(shiftedResult.leverArmGlobalM?.y ?? null, baseResult.leverArmGlobalM?.y ?? 0);
  near(shiftedResult.leverArmGlobalM?.z ?? null, baseResult.leverArmGlobalM?.z ?? 0);
  near(shiftedResult.forceMomentVectorNm?.x ?? null, baseResult.forceMomentVectorNm?.x ?? 0);
  near(shiftedResult.forceMomentVectorNm?.y ?? null, baseResult.forceMomentVectorNm?.y ?? 0);
  near(shiftedResult.forceMomentVectorNm?.z ?? null, baseResult.forceMomentVectorNm?.z ?? 0);
  near(shiftedResult.forceMomentMagnitudeNm, baseResult.forceMomentMagnitudeNm ?? 0);
});

test("reference point exactly at the application point produces zero force moment without creating torque", () => {
  const { snapshot, mapping } = readyFixture();
  const result = calculateSmallHouseSurfaceForceMoment(
    snapshot,
    mapping,
    momentInput({ x: 0.37, y: 1.23, z: -2.41 }),
  );

  assert.deepEqual(result.leverArmGlobalM, { x: 0, y: 0, z: 0 });
  assert.deepEqual(result.forceMomentVectorNm, { x: 0, y: 0, z: 0 });
  assert.equal(result.forceMomentMagnitudeNm, 0);
  assert.equal(result.aerodynamicTorqueNm, null);
});

test("surface ID mismatch blocks the moment calculation", () => {
  const { snapshot, mapping } = readyFixture();
  const input = momentInput();
  input.surfaceComponentId = "synthetic-wall-east";
  const result = calculateSmallHouseSurfaceForceMoment(snapshot, mapping, input);

  assert.equal(result.state, "blocked_surface_mismatch");
  assert.equal(result.canCalculate, false);
  assert.equal(result.forceMomentVectorNm, null);
  assert.equal(result.referencePointGlobalM, null);
});

test("blocked application-point mapping cannot be promoted by declaring a moment reference", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "floor_ring_frame");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, northWallActionInput());
  const mapping = mapSmallHouseSurfaceForceApplicationPoint(
    snapshot,
    action,
    applicationInput(),
  );
  const result = calculateSmallHouseSurfaceForceMoment(snapshot, mapping, momentInput());

  assert.equal(mapping.state, "blocked_source_action");
  assert.equal(result.state, "blocked_source_mapping");
  assert.equal(result.forceMomentVectorNm, null);
  assert.equal(result.aerodynamicTorqueNm, null);
});

test("ready mapping from a different stage is rejected as stale", () => {
  const { snapshot: wallSnapshot, mapping } = readyFixture();
  const roofSnapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "roof");
  assert.equal(mapping.stage, wallSnapshot.stage);
  const result = calculateSmallHouseSurfaceForceMoment(roofSnapshot, mapping, momentInput());

  assert.equal(result.state, "blocked_source_snapshot_mismatch");
  assert.equal(result.canCalculate, false);
  assert.equal(result.forceMomentVectorNm, null);
});

test("reference coordinates, provenance, and verification must be explicit and valid", () => {
  const { snapshot, mapping } = readyFixture();

  for (const [axis, value] of [
    ["x", Number.NaN],
    ["y", Number.POSITIVE_INFINITY],
    ["z", Number.NEGATIVE_INFINITY],
  ] as const) {
    const input = momentInput();
    input.referencePointGlobalM[axis] = value;
    assert.throws(
      () => calculateSmallHouseSurfaceForceMoment(snapshot, mapping, input),
      new RegExp(`referencePointGlobalM\\.${axis} must be finite`),
    );
  }

  const missingSource = momentInput();
  missingSource.sourceNote = "";
  assert.throws(
    () => calculateSmallHouseSurfaceForceMoment(snapshot, mapping, missingSource),
    /sourceNote must be non-empty/,
  );

  const badVerification = momentInput();
  badVerification.verificationState = "assumed_verified" as never;
  assert.throws(
    () => calculateSmallHouseSurfaceForceMoment(snapshot, mapping, badVerification),
    /supported verification state/,
  );
});

test("moment result copies source force, application point, and reference point by value", () => {
  const { snapshot, mapping } = readyFixture();
  const input = momentInput();
  const result = calculateSmallHouseSurfaceForceMoment(snapshot, mapping, input);

  assert.notEqual(result.sourceForceVectorN, mapping.sourceForceVectorN);
  assert.notEqual(result.applicationPointGlobalM, mapping.applicationPointGlobalM);
  assert.notEqual(result.referencePointGlobalM, input.referencePointGlobalM);

  input.referencePointGlobalM.x = 999;
  if (mapping.sourceForceVectorN) mapping.sourceForceVectorN.z = 999;
  if (mapping.applicationPointGlobalM) mapping.applicationPointGlobalM.y = 999;

  assert.deepEqual(result.referencePointGlobalM, { x: 0.1, y: 0.2, z: -2.0 });
  assert.deepEqual(result.applicationPointGlobalM, { x: 0.37, y: 1.23, z: -2.41 });
  assert.deepEqual(result.sourceForceVectorN, { x: -0, y: -0, z: -960 });
});
