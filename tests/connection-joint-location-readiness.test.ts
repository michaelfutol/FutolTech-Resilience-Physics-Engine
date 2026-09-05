import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { assessConnectionJointLocationReadiness } from "../src/lib/smallHouseWind/connectionJointLocationReadiness";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION,
  type ConnectionJointLocationReadinessInput,
} from "../src/types/connectionJointLocationReadiness";

function unknownLocationInput(): ConnectionJointLocationReadinessInput {
  return {
    schemaVersion: CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION,
    connectionId: "synthetic-connection-support-ring-nw",
    jointPointM: null,
    jointPointSourceNote: null,
    jointPointVerificationState: null,
    sourceNote: "Synthetic QA connection-location readiness review only",
    verificationState: "unverified",
  };
}

function explicitLocationInput(): ConnectionJointLocationReadinessInput {
  return {
    ...unknownLocationInput(),
    jointPointM: { x: -1.7, y: 0.6, z: -2.2 },
    jointPointSourceNote: "Synthetic QA explicitly declared global joint point only",
    jointPointVerificationState: "unverified",
  };
}

test("connection topology remains reviewable while an absent physical joint point stays unknown and uninferred", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );
  const result = assessConnectionJointLocationReadiness(
    snapshot,
    unknownLocationInput(),
  );

  assert.equal(result.state, "location_unknown");
  assert.equal(result.canReviewLocation, false);
  assert.equal(result.connectionMechanicsAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.connection?.id, "synthetic-connection-support-ring-nw");
  assert.equal(result.connection?.fromComponentId, "synthetic-support-nw");
  assert.equal(result.connection?.toComponentId, "synthetic-ring-north");
  assert.equal(result.connection?.capacityN, null);
  assert.equal(result.fromComponent?.id, "synthetic-support-nw");
  assert.equal(result.toComponent?.id, "synthetic-ring-north");
  assert.equal(result.jointPointM, null);
  assert.equal(result.inferredJointPointM, null);
  assert.equal(result.coordinateBasis, "unknown");
  assert.deepEqual(result.connectorGeometry, {
    path: null,
    axis: null,
    shape: null,
    bearingAreaM2: null,
  });
  assert.deepEqual(result.mechanics, {
    stiffness: null,
    slip: null,
    fastenerType: null,
    fastenerCount: null,
    weldSize: null,
    weldLengthM: null,
    demandN: null,
    capacityAssessmentN: null,
    utilization: null,
    passFail: null,
    loadTransferModel: null,
  });
});

test("component centers and their midpoint never become an inferred joint point", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );
  const result = assessConnectionJointLocationReadiness(
    snapshot,
    unknownLocationInput(),
  );

  const from = result.fromComponent!;
  const to = result.toComponent!;
  const visibleCenterMidpoint = {
    x: (from.centerM.x + to.centerM.x) / 2,
    y: (from.centerM.y + to.centerM.y) / 2,
    z: (from.centerM.z + to.centerM.z) / 2,
  };

  assert.ok(Number.isFinite(visibleCenterMidpoint.x));
  assert.ok(Number.isFinite(visibleCenterMidpoint.y));
  assert.ok(Number.isFinite(visibleCenterMidpoint.z));
  assert.equal(result.jointPointM, null);
  assert.equal(result.inferredJointPointM, null);
  assert.match(result.reason, /does not infer a midpoint, box intersection, nearest face, touching point, or center-to-center location/);
});

test("an explicit finite caller-declared global joint point becomes reviewable without enabling connection mechanics", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );
  const result = assessConnectionJointLocationReadiness(
    snapshot,
    explicitLocationInput(),
  );

  assert.equal(result.state, "review_ready");
  assert.equal(result.canReviewLocation, true);
  assert.equal(result.coordinateBasis, "caller_declared_global_point");
  assert.deepEqual(result.jointPointM, { x: -1.7, y: 0.6, z: -2.2 });
  assert.equal(result.inferredJointPointM, null);
  assert.equal(result.connectionMechanicsAvailable, false);
  assert.equal(result.connection?.capacityN, null);
  assert.equal(result.mechanics.demandN, null);
  assert.equal(result.mechanics.capacityAssessmentN, null);
  assert.equal(result.mechanics.passFail, null);
});

test("stages before connections block location readiness even if an explicit point was retained", () => {
  for (const stage of [
    "empty_envelope",
    "primary_supports",
    "floor_ring_frame",
    "walls",
    "roof",
  ] as const) {
    const snapshot = materializeSmallHouseWindStage(
      SYNTHETIC_PHASE4_HOUSE,
      stage,
    );
    const result = assessConnectionJointLocationReadiness(
      snapshot,
      explicitLocationInput(),
    );
    assert.equal(result.state, "blocked_stage_before_connections");
    assert.equal(result.canReviewLocation, false);
    assert.equal(result.jointPointM, null);
    assert.equal(result.inferredJointPointM, null);
  }
});

test("missing or later-stage connection identities are blocked rather than substituted", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );

  const missing = explicitLocationInput();
  missing.connectionId = "missing-connection";
  assert.equal(
    assessConnectionJointLocationReadiness(snapshot, missing).state,
    "blocked_connection_not_active",
  );

  const later = explicitLocationInput();
  later.connectionId = "synthetic-connection-brace-west";
  assert.equal(
    assessConnectionJointLocationReadiness(snapshot, later).state,
    "blocked_connection_not_active",
  );
});

test("non-finite explicit joint coordinates and incomplete point provenance are rejected", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );

  const nonFinite = explicitLocationInput();
  nonFinite.jointPointM = { x: Number.NaN, y: 0.6, z: -2.2 };
  assert.throws(
    () => assessConnectionJointLocationReadiness(snapshot, nonFinite),
    /jointPointM.x must be finite/,
  );

  const missingSource = explicitLocationInput();
  missingSource.jointPointSourceNote = "";
  assert.throws(
    () => assessConnectionJointLocationReadiness(snapshot, missingSource),
    /jointPointSourceNote must be non-empty/,
  );

  const missingVerification = explicitLocationInput();
  missingVerification.jointPointVerificationState = null;
  assert.throws(
    () => assessConnectionJointLocationReadiness(snapshot, missingVerification),
    /jointPointVerificationState is required/,
  );
});

test("unknown joint point cannot carry fake coordinate provenance", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );
  const input = unknownLocationInput();
  input.jointPointSourceNote = "Looks like the boxes touch here";

  assert.throws(
    () => assessConnectionJointLocationReadiness(snapshot, input),
    /joint-point provenance must remain null while input.jointPointM is unknown/,
  );
});

test("returned connection, endpoints, and joint point are copied rather than mutable aliases", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "connections",
  );
  const input = explicitLocationInput();
  const result = assessConnectionJointLocationReadiness(snapshot, input);

  result.jointPointM!.x = 999;
  result.fromComponent!.centerM.x = 999;
  result.connection!.capacityN = 999;

  assert.notEqual(input.jointPointM!.x, 999);
  const sourceFrom = snapshot.components.find(
    (component) => component.id === "synthetic-support-nw",
  )!;
  const sourceConnection = snapshot.connections.find(
    (connection) => connection.id === "synthetic-connection-support-ring-nw",
  )!;
  assert.notEqual(sourceFrom.centerM.x, 999);
  assert.notEqual(sourceConnection.capacityN, 999);
});
