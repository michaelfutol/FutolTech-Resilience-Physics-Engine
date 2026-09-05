import test from "node:test";
import assert from "node:assert/strict";

import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import { assessFloorRingFrameMemberReadiness } from "../src/lib/smallHouseWind/floorRingFrameReadiness";
import {
  FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION,
  type FloorRingFrameMemberReadinessInput,
} from "../src/types/floorRingFrameReadiness";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindSpecimenInput,
} from "../src/types/smallHouseWind";

function specimen(): SmallHouseWindSpecimenInput {
  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    id: "ring-readiness-house-001",
    label: "Synthetic ring readiness fixture",
    envelope: {
      id: "ring-readiness-envelope-001",
      centerM: { x: 0, y: 1.5, z: 0 },
      sizeM: { x: 4, y: 3, z: 4 },
      sourceNote: "Synthetic envelope for software regression only",
      verificationState: "unverified",
    },
    components: [
      {
        id: "support-001",
        kind: "primary_support",
        activationStage: "primary_supports",
        centerM: { x: -1.5, y: 1.5, z: -1.5 },
        sizeM: { x: 0.2, y: 3, z: 0.2 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic support geometry only",
        verificationState: "unverified",
      },
      {
        id: "ring-001",
        kind: "floor_ring_frame_member",
        activationStage: "floor_ring_frame",
        centerM: { x: 0, y: 0.6, z: -1.5 },
        sizeM: { x: 3.1, y: 0.12, z: 0.12 },
        rotationRad: { x: 0, y: 0, z: 0.1 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic ring member geometry only",
        verificationState: "unverified",
      },
      {
        id: "wall-001",
        kind: "wall_panel",
        activationStage: "walls",
        centerM: { x: 0, y: 1.5, z: -1.8 },
        sizeM: { x: 3.2, y: 2, z: 0.08 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic wall geometry only",
        verificationState: "unverified",
      },
    ],
    connections: [],
    sourceNote: "Synthetic floor-ring readiness fixture only",
    verificationState: "unverified",
  };
}

function readinessInput(): FloorRingFrameMemberReadinessInput {
  return {
    schemaVersion: FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION,
    memberComponentId: "ring-001",
    longitudinalAxis: "local_x",
    endA: {
      roleLabel: "west end role",
      jointCoordinateM: null,
      sourceNote: "Synthetic endpoint role only; coordinate intentionally unknown",
      verificationState: "unverified",
    },
    endB: {
      roleLabel: "east end role",
      jointCoordinateM: null,
      sourceNote: "Synthetic endpoint role only; coordinate intentionally unknown",
      verificationState: "unverified",
    },
    sourceNote: "Synthetic floor-ring readiness idealization only",
    verificationState: "unverified",
  };
}

test("floor-ring readiness preserves staged member geometry and keeps joint/mechanics data unknown", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const result = assessFloorRingFrameMemberReadiness(snapshot, readinessInput());

  assert.equal(result.state, "review_ready");
  assert.equal(result.canReview, true);
  assert.equal(result.globalFrameCalculationAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.member?.id, "ring-001");
  assert.deepEqual(result.member?.centerM, { x: 0, y: 0.6, z: -1.5 });
  assert.deepEqual(result.member?.sizeM, { x: 3.1, y: 0.12, z: 0.12 });
  assert.deepEqual(result.member?.rotationRad, { x: 0, y: 0, z: 0.1 });
  assert.equal(result.member?.materialId, null);
  assert.equal(result.member?.massKg, null);
  assert.deepEqual(result.jointCoordinates, { endA: null, endB: null });
  assert.deepEqual(result.mechanicalProperties, {
    elasticModulusPa: null,
    sectionAreaM2: null,
    principalSecondMoment1M4: null,
    principalSecondMoment2M4: null,
    strengthData: null,
  });
  assert.equal(result.loadTransferModel, null);
});

test("member axis remains explicitly caller-declared rather than inferred from largest box dimension", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const input = readinessInput();
  input.longitudinalAxis = "local_z";
  const result = assessFloorRingFrameMemberReadiness(snapshot, input);

  assert.equal(result.longitudinalAxis, "local_z");
  assert.equal(result.member?.sizeM.x, 3.1);
});

test("stages before floor-ring activation block readiness", () => {
  const empty = materializeSmallHouseWindStage(specimen(), "empty_envelope");
  const supports = materializeSmallHouseWindStage(specimen(), "primary_supports");

  assert.equal(
    assessFloorRingFrameMemberReadiness(empty, readinessInput()).state,
    "blocked_stage_before_floor_ring_frame",
  );
  assert.equal(
    assessFloorRingFrameMemberReadiness(supports, readinessInput()).state,
    "blocked_stage_before_floor_ring_frame",
  );
});

test("missing member and wrong component kind are blocked rather than reinterpreted", () => {
  const ringStage = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const missing = readinessInput();
  missing.memberComponentId = "missing-ring";
  assert.equal(
    assessFloorRingFrameMemberReadiness(ringStage, missing).state,
    "blocked_member_not_active",
  );

  const wallStage = materializeSmallHouseWindStage(specimen(), "walls");
  const wrong = readinessInput();
  wrong.memberComponentId = "wall-001";
  const result = assessFloorRingFrameMemberReadiness(wallStage, wrong);
  assert.equal(result.state, "blocked_not_floor_ring_frame_member");
  assert.equal(result.member?.kind, "wall_panel");
});

test("endpoint roles require distinct labels and provenance", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const duplicate = readinessInput();
  duplicate.endB.roleLabel = duplicate.endA.roleLabel;
  assert.throws(
    () => assessFloorRingFrameMemberReadiness(snapshot, duplicate),
    /distinct endpoint role labels/,
  );

  const missingSource = readinessInput();
  missingSource.endA.sourceNote = "";
  assert.throws(
    () => assessFloorRingFrameMemberReadiness(snapshot, missingSource),
    /endA.sourceNote must be non-empty/,
  );
});

test("schema v0.1.0 rejects fabricated joint coordinates", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const input = readinessInput();
  input.endA.jointCoordinateM = { x: -1.55, y: 0.6, z: -1.5 } as never;

  assert.throws(
    () => assessFloorRingFrameMemberReadiness(snapshot, input),
    /jointCoordinateM must remain null/,
  );
});

test("unsupported runtime axis and verification state are rejected", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const axis = readinessInput();
  axis.longitudinalAxis = "largest_dimension" as never;
  assert.throws(
    () => assessFloorRingFrameMemberReadiness(snapshot, axis),
    /must be local_x, local_y, or local_z/,
  );

  const verification = readinessInput();
  verification.verificationState = "assumed_verified" as never;
  assert.throws(
    () => assessFloorRingFrameMemberReadiness(snapshot, verification),
    /supported verification state/,
  );
});

test("readiness result returns copied member geometry rather than mutable aliases", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "floor_ring_frame");
  const result = assessFloorRingFrameMemberReadiness(snapshot, readinessInput());

  result.member!.centerM.x = 999;
  result.member!.rotationRad.z = 999;
  assert.notEqual(snapshot.components.find((item) => item.id === "ring-001")!.centerM.x, 999);
  assert.notEqual(snapshot.components.find((item) => item.id === "ring-001")!.rotationRad.z, 999);
});
