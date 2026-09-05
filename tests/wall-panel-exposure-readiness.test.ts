import test from "node:test";
import assert from "node:assert/strict";

import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import { assessWallPanelExposureReadiness } from "../src/lib/smallHouseWind/wallPanelExposureReadiness";
import {
  WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
  type WallPanelExposureReadinessInput,
} from "../src/types/wallPanelExposureReadiness";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindSpecimenInput,
} from "../src/types/smallHouseWind";

function specimen(): SmallHouseWindSpecimenInput {
  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    id: "wall-readiness-house-001",
    label: "Synthetic wall readiness fixture",
    envelope: {
      id: "wall-readiness-envelope-001",
      centerM: { x: 0, y: 1.5, z: 0 },
      sizeM: { x: 4, y: 3, z: 4 },
      sourceNote: "Synthetic envelope for software regression only",
      verificationState: "unverified",
    },
    components: [
      {
        id: "ring-001",
        kind: "floor_ring_frame_member",
        activationStage: "floor_ring_frame",
        centerM: { x: 0, y: 0.6, z: -1.5 },
        sizeM: { x: 3.2, y: 0.12, z: 0.12 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic ring geometry only",
        verificationState: "unverified",
      },
      {
        id: "wall-001",
        kind: "wall_panel",
        activationStage: "walls",
        centerM: { x: 0, y: 1.5, z: -1.8 },
        sizeM: { x: 3.4, y: 2.1, z: 0.08 },
        rotationRad: { x: 0, y: 0, z: 0.15 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic wall-panel geometry only",
        verificationState: "unverified",
      },
    ],
    connections: [],
    sourceNote: "Synthetic wall readiness fixture only",
    verificationState: "unverified",
  };
}

function readinessInput(): WallPanelExposureReadinessInput {
  return {
    schemaVersion: WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
    wallComponentId: "wall-001",
    panelNormalAxis: "local_z",
    exposedFace: "negative_normal",
    exposureClass: "exterior",
    normalAxisSourceNote: "Synthetic QA declaration of panel normal only",
    normalAxisVerificationState: "unverified",
    exposureSourceNote: "Synthetic QA declaration of exterior exposed face only",
    exposureVerificationState: "unverified",
    sourceNote: "Synthetic wall-panel exposure readiness idealization only",
    verificationState: "unverified",
  };
}

test("wall exposure readiness preserves wall geometry and leaves aerodynamic/mechanical quantities undefined", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "walls");
  const result = assessWallPanelExposureReadiness(snapshot, readinessInput());

  assert.equal(result.state, "review_ready");
  assert.equal(result.canReview, true);
  assert.equal(result.windActionCalculationAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.wall?.id, "wall-001");
  assert.deepEqual(result.wall?.centerM, { x: 0, y: 1.5, z: -1.8 });
  assert.deepEqual(result.wall?.sizeM, { x: 3.4, y: 2.1, z: 0.08 });
  assert.deepEqual(result.wall?.rotationRad, { x: 0, y: 0, z: 0.15 });
  assert.equal(result.wall?.materialId, null);
  assert.equal(result.wall?.massKg, null);
  assert.equal(result.panelNormalAxis, "local_z");
  assert.equal(result.exposedFace, "negative_normal");
  assert.equal(result.exposureClass, "exterior");
  assert.equal(result.geometricFaceAreaM2, 7.14);
  assert.equal(result.effectiveWindAreaM2, null);
  assert.deepEqual(result.aerodynamicInputs, {
    windVelocityMps: null,
    airDensityKgM3: null,
    externalPressureCoefficient: null,
    internalPressureCoefficient: null,
    netPressurePa: null,
  });
  assert.deepEqual(result.mechanicalProperties, {
    elasticModulusPa: null,
    panelStiffness: null,
    strengthData: null,
    fastenerCapacity: null,
  });
});

test("geometric face area follows the explicitly declared local normal axis and is not effective wind area", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "walls");

  const xNormal = readinessInput();
  xNormal.panelNormalAxis = "local_x";
  const xResult = assessWallPanelExposureReadiness(snapshot, xNormal);
  assert.equal(xResult.geometricFaceAreaM2, 2.1 * 0.08);
  assert.equal(xResult.effectiveWindAreaM2, null);

  const yNormal = readinessInput();
  yNormal.panelNormalAxis = "local_y";
  const yResult = assessWallPanelExposureReadiness(snapshot, yNormal);
  assert.equal(yResult.geometricFaceAreaM2, 3.4 * 0.08);
  assert.equal(yResult.effectiveWindAreaM2, null);
});

test("stages before wall activation block readiness", () => {
  for (const stage of ["empty_envelope", "primary_supports", "floor_ring_frame"] as const) {
    const snapshot = materializeSmallHouseWindStage(specimen(), stage);
    const result = assessWallPanelExposureReadiness(snapshot, readinessInput());
    assert.equal(result.state, "blocked_stage_before_walls");
    assert.equal(result.canReview, false);
    assert.equal(result.geometricFaceAreaM2, null);
  }
});

test("missing wall and wrong component kind are blocked rather than reinterpreted", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "walls");

  const missing = readinessInput();
  missing.wallComponentId = "missing-wall";
  assert.equal(
    assessWallPanelExposureReadiness(snapshot, missing).state,
    "blocked_wall_not_active",
  );

  const wrong = readinessInput();
  wrong.wallComponentId = "ring-001";
  const wrongResult = assessWallPanelExposureReadiness(snapshot, wrong);
  assert.equal(wrongResult.state, "blocked_not_wall_panel");
  assert.equal(wrongResult.wall?.kind, "floor_ring_frame_member");
  assert.equal(wrongResult.geometricFaceAreaM2, null);
});

test("normal axis, exposed face, and exposure class must be explicit supported values", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "walls");

  const axis = readinessInput();
  axis.panelNormalAxis = "largest_dimension" as never;
  assert.throws(
    () => assessWallPanelExposureReadiness(snapshot, axis),
    /panelNormalAxis must be local_x, local_y, or local_z/,
  );

  const face = readinessInput();
  face.exposedFace = "auto_outside" as never;
  assert.throws(
    () => assessWallPanelExposureReadiness(snapshot, face),
    /exposedFace must be positive_normal or negative_normal/,
  );

  const exposure = readinessInput();
  exposure.exposureClass = "windward" as never;
  assert.throws(
    () => assessWallPanelExposureReadiness(snapshot, exposure),
    /exposureClass must be exterior or interior/,
  );
});

test("provenance and supported verification states are mandatory", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "walls");

  const missingSource = readinessInput();
  missingSource.exposureSourceNote = "";
  assert.throws(
    () => assessWallPanelExposureReadiness(snapshot, missingSource),
    /exposureSourceNote must be non-empty/,
  );

  const badVerification = readinessInput();
  badVerification.normalAxisVerificationState = "assumed_verified" as never;
  assert.throws(
    () => assessWallPanelExposureReadiness(snapshot, badVerification),
    /supported verification state/,
  );
});

test("readiness result returns copied wall geometry rather than mutable aliases", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "walls");
  const result = assessWallPanelExposureReadiness(snapshot, readinessInput());

  result.wall!.centerM.x = 999;
  result.wall!.rotationRad.z = 999;
  const sourceWall = snapshot.components.find((item) => item.id === "wall-001")!;
  assert.notEqual(sourceWall.centerM.x, 999);
  assert.notEqual(sourceWall.rotationRad.z, 999);
});
