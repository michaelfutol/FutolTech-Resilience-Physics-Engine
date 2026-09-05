import test from "node:test";
import assert from "node:assert/strict";

import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import { assessRoofPanelExposureReadiness } from "../src/lib/smallHouseWind/roofPanelExposureReadiness";
import {
  ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
  type RoofPanelExposureReadinessInput,
} from "../src/types/roofPanelExposureReadiness";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindSpecimenInput,
} from "../src/types/smallHouseWind";

function specimen(): SmallHouseWindSpecimenInput {
  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    id: "roof-readiness-house-001",
    label: "Synthetic roof readiness fixture",
    envelope: {
      id: "roof-readiness-envelope-001",
      centerM: { x: 0, y: 1.7, z: 0 },
      sizeM: { x: 4, y: 3.4, z: 5 },
      sourceNote: "Synthetic envelope for software regression only",
      verificationState: "unverified",
    },
    components: [
      {
        id: "wall-001",
        kind: "wall_panel",
        activationStage: "walls",
        centerM: { x: -1.7, y: 1.65, z: 0 },
        sizeM: { x: 0.08, y: 2.1, z: 4.3 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic wall geometry only",
        verificationState: "unverified",
      },
      {
        id: "roof-001",
        kind: "roof_panel",
        activationStage: "roof",
        centerM: { x: -0.93, y: 2.98, z: 0 },
        sizeM: { x: 2.05, y: 0.08, z: 4.8 },
        rotationRad: { x: 0, y: 0, z: 0.35 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic rotated roof-panel geometry only",
        verificationState: "unverified",
      },
    ],
    connections: [],
    sourceNote: "Synthetic roof readiness fixture only",
    verificationState: "unverified",
  };
}

function readinessInput(): RoofPanelExposureReadinessInput {
  return {
    schemaVersion: ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
    roofComponentId: "roof-001",
    panelNormalAxis: "local_y",
    exposedFace: "positive_normal",
    exposureClass: "exterior",
    normalAxisSourceNote: "Synthetic QA declaration of roof panel normal only",
    normalAxisVerificationState: "unverified",
    exposureSourceNote: "Synthetic QA declaration of exterior exposed face only",
    exposureVerificationState: "unverified",
    sourceNote: "Synthetic roof-panel exposure readiness idealization only",
    verificationState: "unverified",
  };
}

test("roof exposure readiness preserves rotated geometry and leaves uplift/aerodynamic/mechanical quantities undefined", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "roof");
  const result = assessRoofPanelExposureReadiness(snapshot, readinessInput());

  assert.equal(result.state, "review_ready");
  assert.equal(result.canReview, true);
  assert.equal(result.upliftCalculationAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.roof?.id, "roof-001");
  assert.deepEqual(result.roof?.sizeM, { x: 2.05, y: 0.08, z: 4.8 });
  assert.deepEqual(result.roof?.rotationRad, { x: 0, y: 0, z: 0.35 });
  assert.equal(result.roof?.materialId, null);
  assert.equal(result.roof?.massKg, null);
  assert.equal(result.panelNormalAxis, "local_y");
  assert.equal(result.exposedFace, "positive_normal");
  assert.equal(result.exposureClass, "exterior");
  assert.ok(Math.abs(result.geometricFaceAreaM2! - 9.84) < 1e-12);
  assert.equal(result.effectiveWindAreaM2, null);
  assert.equal(result.roofZone, null);
  assert.deepEqual(result.aerodynamicInputs, {
    windVelocityMps: null,
    airDensityKgM3: null,
    externalPressureCoefficient: null,
    internalPressureCoefficient: null,
    netPressurePa: null,
    upliftForceN: null,
  });
  assert.deepEqual(result.mechanicalProperties, {
    panelStiffness: null,
    strengthData: null,
    connectionDemandN: null,
    connectionCapacityN: null,
  });
});

test("geometric face area follows explicit normal axis and does not infer an aerodynamic roof zone", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "roof");

  const xNormal = readinessInput();
  xNormal.panelNormalAxis = "local_x";
  const xResult = assessRoofPanelExposureReadiness(snapshot, xNormal);
  assert.equal(xResult.geometricFaceAreaM2, 0.08 * 4.8);
  assert.equal(xResult.roofZone, null);

  const zNormal = readinessInput();
  zNormal.panelNormalAxis = "local_z";
  const zResult = assessRoofPanelExposureReadiness(snapshot, zNormal);
  assert.equal(zResult.geometricFaceAreaM2, 2.05 * 0.08);
  assert.equal(zResult.effectiveWindAreaM2, null);
});

test("stages before roof activation block readiness", () => {
  for (const stage of ["empty_envelope", "primary_supports", "floor_ring_frame", "walls"] as const) {
    const snapshot = materializeSmallHouseWindStage(specimen(), stage);
    const result = assessRoofPanelExposureReadiness(snapshot, readinessInput());
    assert.equal(result.state, "blocked_stage_before_roof");
    assert.equal(result.canReview, false);
    assert.equal(result.geometricFaceAreaM2, null);
  }
});

test("missing roof and wrong component kind are blocked rather than reinterpreted", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "roof");

  const missing = readinessInput();
  missing.roofComponentId = "missing-roof";
  assert.equal(
    assessRoofPanelExposureReadiness(snapshot, missing).state,
    "blocked_roof_not_active",
  );

  const wrong = readinessInput();
  wrong.roofComponentId = "wall-001";
  const wrongResult = assessRoofPanelExposureReadiness(snapshot, wrong);
  assert.equal(wrongResult.state, "blocked_not_roof_panel");
  assert.equal(wrongResult.roof?.kind, "wall_panel");
  assert.equal(wrongResult.geometricFaceAreaM2, null);
});

test("normal axis, exposed face, exposure class, provenance and verification must be explicit", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "roof");

  const axis = readinessInput();
  axis.panelNormalAxis = "slope_normal" as never;
  assert.throws(
    () => assessRoofPanelExposureReadiness(snapshot, axis),
    /panelNormalAxis must be local_x, local_y, or local_z/,
  );

  const face = readinessInput();
  face.exposedFace = "auto_upper" as never;
  assert.throws(
    () => assessRoofPanelExposureReadiness(snapshot, face),
    /exposedFace must be positive_normal or negative_normal/,
  );

  const exposure = readinessInput();
  exposure.exposureClass = "windward_roof" as never;
  assert.throws(
    () => assessRoofPanelExposureReadiness(snapshot, exposure),
    /exposureClass must be exterior or interior/,
  );

  const missingSource = readinessInput();
  missingSource.normalAxisSourceNote = "";
  assert.throws(
    () => assessRoofPanelExposureReadiness(snapshot, missingSource),
    /normalAxisSourceNote must be non-empty/,
  );

  const badVerification = readinessInput();
  badVerification.verificationState = "assumed_verified" as never;
  assert.throws(
    () => assessRoofPanelExposureReadiness(snapshot, badVerification),
    /supported verification state/,
  );
});

test("readiness result returns copied roof geometry rather than mutable aliases", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "roof");
  const result = assessRoofPanelExposureReadiness(snapshot, readinessInput());

  result.roof!.centerM.x = 999;
  result.roof!.rotationRad.z = 999;
  const sourceRoof = snapshot.components.find((item) => item.id === "roof-001")!;
  assert.notEqual(sourceRoof.centerM.x, 999);
  assert.notEqual(sourceRoof.rotationRad.z, 999);
});
