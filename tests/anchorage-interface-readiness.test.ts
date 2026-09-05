import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { assessAnchorageInterfaceReadiness } from "../src/lib/smallHouseWind/anchorageInterfaceReadiness";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION,
  type AnchorageInterfaceReadinessInput,
} from "../src/types/anchorageInterfaceReadiness";
import type { SmallHouseWindSpecimenInput } from "../src/types/smallHouseWind";

function input(
  attachmentConnectionId: string | null = "synthetic-connection-anchor-nw",
): AnchorageInterfaceReadinessInput {
  return {
    schemaVersion: ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION,
    anchorId: "synthetic-anchor-nw",
    attachmentConnectionId,
    sourceNote: "Synthetic QA anchorage interface review only",
    verificationState: "unverified",
  };
}

function fixtureWithAnchorToWallConnection(): SmallHouseWindSpecimenInput {
  return {
    ...SYNTHETIC_PHASE4_HOUSE,
    envelope: { ...SYNTHETIC_PHASE4_HOUSE.envelope },
    components: SYNTHETIC_PHASE4_HOUSE.components.map((component) => ({
      ...component,
      centerM: { ...component.centerM },
      sizeM: { ...component.sizeM },
      rotationRad: { ...component.rotationRad },
    })),
    connections: [
      ...SYNTHETIC_PHASE4_HOUSE.connections.map((connection) => ({
        ...connection,
      })),
      {
        id: "synthetic-connection-anchor-nw-to-wall",
        activationStage: "anchorage",
        fromComponentId: "synthetic-anchor-nw",
        toComponentId: "synthetic-wall-north",
        capacityN: null,
        sourceNote: "Synthetic QA unrelated anchorage endpoint only",
        verificationState: "unverified",
      },
    ],
  };
}

test("stages before anchorage block retained anchor interface selections", () => {
  for (const stage of [
    "empty_envelope",
    "primary_supports",
    "floor_ring_frame",
    "walls",
    "roof",
    "connections",
    "bracing",
  ] as const) {
    const snapshot = materializeSmallHouseWindStage(
      SYNTHETIC_PHASE4_HOUSE,
      stage,
    );
    const result = assessAnchorageInterfaceReadiness(snapshot, input());
    assert.equal(result.state, "blocked_stage_before_anchorage");
    assert.equal(result.anchor, null);
    assert.equal(result.attachmentConnection, null);
    assert.equal(result.support, null);
    assert.equal(result.anchorageMechanicsAvailable, false);
  }
});

test("an active anchor marker without an explicit attachment relationship remains incomplete", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "anchorage",
  );
  const result = assessAnchorageInterfaceReadiness(snapshot, input(null));

  assert.equal(result.state, "interface_incomplete");
  assert.equal(result.canReviewInterface, false);
  assert.equal(result.anchor?.id, "synthetic-anchor-nw");
  assert.equal(result.attachmentConnection, null);
  assert.equal(result.support, null);
  assert.equal(result.topology.explicitAttachmentConnection, false);
  assert.equal(result.topology.physicalAttachmentPointKnown, false);
  assert.equal(result.topology.inferredAttachmentPointM, null);
  assert.match(result.reason, /Proximity or apparent contact does not establish an attachment interface/);
});

test("explicit canonical anchor-to-support topology reaches interface review only", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "anchorage",
  );
  const result = assessAnchorageInterfaceReadiness(snapshot, input());

  assert.equal(result.state, "review_ready_interface");
  assert.equal(result.canReviewInterface, true);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.anchorageMechanicsAvailable, false);
  assert.equal(result.anchor?.id, "synthetic-anchor-nw");
  assert.equal(result.anchor?.kind, "anchor");
  assert.equal(result.attachmentConnection?.id, "synthetic-connection-anchor-nw");
  assert.equal(result.support?.id, "synthetic-support-nw");
  assert.equal(result.support?.kind, "primary_support");
  assert.equal(result.declaredUnknowns.materialId, null);
  assert.equal(result.declaredUnknowns.massKg, null);
  assert.equal(result.declaredUnknowns.topologyCapacityN, null);
  assert.equal(result.topology.explicitAttachmentConnection, true);
  assert.equal(result.topology.physicalAttachmentPointKnown, false);
  assert.equal(result.topology.inferredAttachmentPointM, null);
  assert.deepEqual(result.mechanics, {
    boltOrRodType: null,
    boltDiameterM: null,
    embedmentLengthM: null,
    basePlateGeometry: null,
    weldOrFastenerDetails: null,
    pedestalGeometry: null,
    footingGeometry: null,
    concreteStrengthPa: null,
    soilModel: null,
    soilBearingPa: null,
    interfaceFrictionCoefficient: null,
    pulloutModel: null,
    breakoutModel: null,
    upliftReactionN: null,
    shearReactionN: null,
    slidingResistanceN: null,
    overturningResistanceNm: null,
    demandN: null,
    capacityN: null,
    utilization: null,
    passFail: null,
  });
});

test("missing or unrelated attachment topology is blocked rather than substituted", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "anchorage",
  );

  assert.equal(
    assessAnchorageInterfaceReadiness(snapshot, input("missing-connection")).state,
    "blocked_connection_not_active",
  );

  assert.equal(
    assessAnchorageInterfaceReadiness(
      snapshot,
      input("synthetic-connection-anchor-ne"),
    ).state,
    "blocked_connection_not_incident_to_anchor",
  );
});

test("an active non-anchor component is never reinterpreted as an anchor", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "anchorage",
  );
  const value = input(null);
  value.anchorId = "synthetic-support-nw";

  const result = assessAnchorageInterfaceReadiness(snapshot, value);
  assert.equal(result.state, "blocked_component_not_anchor");
  assert.equal(result.canReviewInterface, false);
  assert.equal(result.anchor?.kind, "primary_support");
});

test("an anchor connection to a non-support endpoint cannot become an anchorage interface", () => {
  const specimen = fixtureWithAnchorToWallConnection();
  const snapshot = materializeSmallHouseWindStage(specimen, "anchorage");
  const result = assessAnchorageInterfaceReadiness(
    snapshot,
    input("synthetic-connection-anchor-nw-to-wall"),
  );

  assert.equal(result.state, "blocked_other_endpoint_not_support");
  assert.equal(result.canReviewInterface, false);
  assert.equal(result.attachmentConnection?.id, "synthetic-connection-anchor-nw-to-wall");
  assert.equal(result.support?.id, "synthetic-wall-north");
  assert.equal(result.support?.kind, "wall_panel");
  assert.equal(result.anchorageMechanicsAvailable, false);
});

test("returned anchor, connection, and support are copies rather than mutable aliases", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "anchorage",
  );
  const result = assessAnchorageInterfaceReadiness(snapshot, input());

  result.anchor!.centerM.x = 999;
  result.attachmentConnection!.capacityN = 999;
  result.support!.centerM.x = 999;

  assert.notEqual(
    snapshot.components.find((component) => component.id === "synthetic-anchor-nw")!.centerM.x,
    999,
  );
  assert.notEqual(
    snapshot.connections.find((connection) => connection.id === "synthetic-connection-anchor-nw")!.capacityN,
    999,
  );
  assert.notEqual(
    snapshot.components.find((component) => component.id === "synthetic-support-nw")!.centerM.x,
    999,
  );
});
