import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { calculateSmallHouseSurfaceWindAction } from "../src/lib/smallHouseWind/surfaceWindAction";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceWindActionInput,
} from "../src/types/smallHouseSurfaceWindAction";

function input(): SmallHouseSurfaceWindActionInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    surfaceNormalAxis: "local_z",
    airDensityKgPerM3: 1.2,
    windSpeedMps: 20,
    effectiveWindAreaM2: 5,
    signedPressureCoefficient: -0.8,
    globalActionDirection: { x: 0, y: 0, z: 2 },
    airDensitySourceNote: "Synthetic QA air-density input only",
    airDensityVerificationState: "unverified",
    windSpeedSourceNote: "Synthetic QA wind-speed input only",
    windSpeedVerificationState: "unverified",
    effectiveAreaSourceNote: "Synthetic QA effective-area input deliberately distinct from box-face area",
    effectiveAreaVerificationState: "unverified",
    coefficientSourceNote: "Synthetic QA signed coefficient only; not a code-derived pressure coefficient",
    coefficientVerificationState: "unverified",
    directionSourceNote: "Synthetic QA explicit global action direction only",
    directionVerificationState: "unverified",
    sourceNote: "Synthetic Phase 4 single-surface wind-action regression only",
    verificationState: "unverified",
  };
}

function near(actual: number | null, expected: number, tolerance = 1e-12): void {
  assert.notEqual(actual, null);
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `${actual} != ${expected}`);
}

test("single-wall analytical action reproduces the transparent hand-check and keeps geometry area separate", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const result = calculateSmallHouseSurfaceWindAction(snapshot, input());

  assert.equal(result.state, "analytical_ready");
  assert.equal(result.canCalculate, true);
  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.surface?.id, "synthetic-wall-north");
  assert.equal(result.surface?.kind, "wall_panel");
  near(result.geometricFaceAreaM2, 7.14);
  assert.equal(result.effectiveWindAreaM2, 5);
  assert.notEqual(result.geometricFaceAreaM2, result.effectiveWindAreaM2);
  assert.equal(result.airDensityKgPerM3, 1.2);
  assert.equal(result.windSpeedMps, 20);
  assert.equal(result.signedPressureCoefficient, -0.8);
  near(result.dynamicPressurePa, 240);
  near(result.signedSurfacePressurePa, -192);
  near(result.scalarSurfaceForceN, -960);
  assert.deepEqual(result.normalizedGlobalActionDirection, { x: 0, y: 0, z: 1 });
  assert.deepEqual(result.globalForceVectorN, { x: -0, y: -0, z: -960 });
  assert.deepEqual(result.downstreamMechanics, {
    connectionDemandN: null,
    connectionCapacityAssessment: null,
    supportReactionsN: null,
    upliftReactionN: null,
    slidingReactionN: null,
    rackingIndicator: null,
    passFail: null,
  });
  assert.match(result.reason, /geometry-only face area is reported separately/i);
  assert.match(result.reason, /No code coefficient, CFD pressure/i);
});

test("roof surface is accepted only once the roof is active", () => {
  const roofInput = input();
  roofInput.surfaceComponentId = "synthetic-roof-west";
  roofInput.surfaceNormalAxis = "local_y";
  roofInput.effectiveWindAreaM2 = 6;
  roofInput.signedPressureCoefficient = 0.5;
  roofInput.globalActionDirection = { x: 0, y: 3, z: 0 };

  const wallStage = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const blocked = calculateSmallHouseSurfaceWindAction(wallStage, roofInput);
  assert.equal(blocked.state, "blocked_surface_not_active");
  assert.equal(blocked.canCalculate, false);
  assert.equal(blocked.dynamicPressurePa, null);

  const roofStage = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "roof");
  const ready = calculateSmallHouseSurfaceWindAction(roofStage, roofInput);
  assert.equal(ready.state, "analytical_ready");
  near(ready.geometricFaceAreaM2, 9.84);
  assert.equal(ready.effectiveWindAreaM2, 6);
  near(ready.dynamicPressurePa, 240);
  near(ready.scalarSurfaceForceN, 720);
  assert.deepEqual(ready.normalizedGlobalActionDirection, { x: 0, y: 1, z: 0 });
  assert.deepEqual(ready.globalForceVectorN, { x: 0, y: 720, z: 0 });
});

test("stages before wall activation block surface action rather than reading future geometry", () => {
  for (const stage of ["empty_envelope", "primary_supports", "floor_ring_frame"] as const) {
    const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, stage);
    const result = calculateSmallHouseSurfaceWindAction(snapshot, input());
    assert.equal(result.state, "blocked_stage_before_walls");
    assert.equal(result.canCalculate, false);
    assert.equal(result.surface, null);
    assert.equal(result.geometricFaceAreaM2, null);
    assert.equal(result.dynamicPressurePa, null);
    assert.equal(result.globalForceVectorN, null);
  }
});

test("missing surface and wrong component kind are blocked without reinterpretation", () => {
  const stormStage = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "storm_protection");

  const missingInput = input();
  missingInput.surfaceComponentId = "missing-panel";
  const missing = calculateSmallHouseSurfaceWindAction(stormStage, missingInput);
  assert.equal(missing.state, "blocked_surface_not_active");
  assert.equal(missing.surface, null);

  const wrongInput = input();
  wrongInput.surfaceComponentId = "synthetic-support-nw";
  wrongInput.surfaceNormalAxis = "local_x";
  const wrong = calculateSmallHouseSurfaceWindAction(stormStage, wrongInput);
  assert.equal(wrong.state, "blocked_not_wall_or_roof_panel");
  assert.equal(wrong.surface?.kind, "primary_support");
  assert.equal(wrong.dynamicPressurePa, null);
  assert.equal(wrong.globalForceVectorN, null);
});

test("density, wind speed, effective area, coefficient, and direction are explicit finite inputs", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");

  for (const [key, value, message] of [
    ["airDensityKgPerM3", 0, /airDensityKgPerM3 must be greater than zero/],
    ["airDensityKgPerM3", Number.NaN, /airDensityKgPerM3 must be a finite number/],
    ["windSpeedMps", 0, /windSpeedMps must be greater than zero/],
    ["windSpeedMps", Number.POSITIVE_INFINITY, /windSpeedMps must be a finite number/],
    ["effectiveWindAreaM2", -1, /effectiveWindAreaM2 must be greater than zero/],
    ["effectiveWindAreaM2", Number.NaN, /effectiveWindAreaM2 must be a finite number/],
    ["signedPressureCoefficient", Number.NaN, /signedPressureCoefficient must be a finite number/],
  ] as const) {
    const candidate = input();
    (candidate as unknown as Record<string, number>)[key] = value;
    assert.throws(() => calculateSmallHouseSurfaceWindAction(snapshot, candidate), message);
  }

  const zeroDirection = input();
  zeroDirection.globalActionDirection = { x: 0, y: 0, z: 0 };
  assert.throws(
    () => calculateSmallHouseSurfaceWindAction(snapshot, zeroDirection),
    /globalActionDirection must be a non-zero finite vector/,
  );

  const nonFiniteDirection = input();
  nonFiniteDirection.globalActionDirection = { x: Number.NaN, y: 0, z: 1 };
  assert.throws(
    () => calculateSmallHouseSurfaceWindAction(snapshot, nonFiniteDirection),
    /globalActionDirection.x must be a finite number/,
  );
});

test("global action direction is normalized deterministically and negative coefficient reverses force", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const candidate = input();
  candidate.globalActionDirection = { x: 3, y: 4, z: 0 };
  candidate.signedPressureCoefficient = -1;
  candidate.effectiveWindAreaM2 = 2;

  const result = calculateSmallHouseSurfaceWindAction(snapshot, candidate);
  near(result.dynamicPressurePa, 240);
  near(result.scalarSurfaceForceN, -480);
  near(result.normalizedGlobalActionDirection?.x ?? null, 0.6);
  near(result.normalizedGlobalActionDirection?.y ?? null, 0.8);
  near(result.normalizedGlobalActionDirection?.z ?? null, 0);
  near(result.globalForceVectorN?.x ?? null, -288);
  near(result.globalForceVectorN?.y ?? null, -384);
  near(result.globalForceVectorN?.z ?? null, 0);
});

test("rendered panel rotation does not manufacture or rotate the explicitly supplied global force direction", () => {
  const roofSnapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "roof");
  const candidate = input();
  candidate.surfaceComponentId = "synthetic-roof-west";
  candidate.surfaceNormalAxis = "local_y";
  candidate.globalActionDirection = { x: 1, y: 0, z: 0 };
  candidate.signedPressureCoefficient = 1;
  candidate.effectiveWindAreaM2 = 1;

  const result = calculateSmallHouseSurfaceWindAction(roofSnapshot, candidate);
  assert.equal(result.surface?.rotationRad.z, 0.35);
  assert.deepEqual(result.normalizedGlobalActionDirection, { x: 1, y: 0, z: 0 });
  assert.deepEqual(result.globalForceVectorN, { x: 240, y: 0, z: 0 });
});

test("signed coefficient may be zero but no downstream structural mechanics become available", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const candidate = input();
  candidate.signedPressureCoefficient = 0;

  const result = calculateSmallHouseSurfaceWindAction(snapshot, candidate);
  assert.equal(result.state, "analytical_ready");
  assert.equal(result.signedSurfacePressurePa, 0);
  assert.equal(result.scalarSurfaceForceN, 0);
  assert.deepEqual(result.globalForceVectorN, { x: 0, y: 0, z: 0 });
  assert.equal(result.downstreamMechanics.connectionDemandN, null);
  assert.equal(result.downstreamMechanics.supportReactionsN, null);
  assert.equal(result.downstreamMechanics.passFail, null);
});

test("provenance and verification states are mandatory", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");

  const missing = input();
  missing.coefficientSourceNote = "";
  assert.throws(
    () => calculateSmallHouseSurfaceWindAction(snapshot, missing),
    /coefficientSourceNote must be non-empty/,
  );

  const badVerification = input();
  badVerification.directionVerificationState = "assumed_verified" as never;
  assert.throws(
    () => calculateSmallHouseSurfaceWindAction(snapshot, badVerification),
    /supported verification state/,
  );
});

test("returned surface geometry is copied rather than aliased into the stage snapshot", () => {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const result = calculateSmallHouseSurfaceWindAction(snapshot, input());

  result.surface!.centerM.x = 999;
  result.surface!.rotationRad.z = 999;
  const source = snapshot.components.find((component) => component.id === "synthetic-wall-north")!;
  assert.notEqual(source.centerM.x, 999);
  assert.notEqual(source.rotationRad.z, 999);
});
