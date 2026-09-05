import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { assessBracingTopologyReadiness } from "../src/lib/smallHouseWind/bracingTopologyReadiness";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION,
  type BracingTopologyReadinessInput,
} from "../src/types/bracingTopologyReadiness";
import type { SmallHouseWindSpecimenInput } from "../src/types/smallHouseWind";

function input(
  endConnectionIds: readonly [string | null, string | null] = [
    "synthetic-connection-brace-west",
    null,
  ],
): BracingTopologyReadinessInput {
  return {
    schemaVersion: BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION,
    braceId: "synthetic-brace-north-west",
    endConnectionIds,
    sourceNote: "Synthetic QA bracing topology review only",
    verificationState: "unverified",
  };
}

function fixtureWithExplicitSecondBraceEnd(): SmallHouseWindSpecimenInput {
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
        id: "synthetic-connection-brace-west-second-end",
        activationStage: "bracing",
        fromComponentId: "synthetic-brace-north-west",
        toComponentId: "synthetic-ring-north",
        capacityN: null,
        sourceNote:
          "Synthetic QA second brace-end topology only; no physical joint location or capacity adopted",
        verificationState: "unverified",
      },
    ],
  };
}

test("a visible diagonal brace with only one declared end remains an incomplete load path", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "bracing",
  );
  const result = assessBracingTopologyReadiness(snapshot, input());

  assert.equal(result.state, "load_path_incomplete");
  assert.equal(result.canReviewTopology, false);
  assert.equal(result.bracingMechanicsAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.brace?.id, "synthetic-brace-north-west");
  assert.equal(result.incidentConnections.length, 1);
  assert.equal(result.incidentConnections[0].id, "synthetic-connection-brace-west");
  assert.equal(result.selectedEndConnections[0]?.id, "synthetic-connection-brace-west");
  assert.equal(result.selectedEndConnections[1], null);
  assert.equal(result.topology.explicitSelectedEndCount, 1);
  assert.equal(result.topology.physicalJointLocationsKnown, false);
  assert.deepEqual(result.topology.inferredJointLocations, [null, null]);
  assert.deepEqual(result.mechanics, {
    axialForceN: null,
    tensionCompressionState: null,
    axialStiffnessNPerM: null,
    effectiveLengthM: null,
    slendernessRatio: null,
    bucklingModel: null,
    rackingContribution: null,
    demandN: null,
    capacityN: null,
    utilization: null,
    passFail: null,
    loadPathAdequacy: null,
  });
  assert.match(result.reason, /diagonal-looking member is not treated as a complete load path/);
});

test("brace geometry does not manufacture a second brace-end connection", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "bracing",
  );
  const result = assessBracingTopologyReadiness(snapshot, input([null, null]));

  assert.equal(result.state, "load_path_incomplete");
  assert.equal(result.incidentConnections.length, 1);
  assert.equal(result.topology.explicitSelectedEndCount, 0);
  assert.equal(result.topology.distinctSelectedConnections, false);
  assert.deepEqual(result.topology.inferredJointLocations, [null, null]);
});

test("stages before bracing block retained brace topology selections", () => {
  for (const stage of [
    "empty_envelope",
    "primary_supports",
    "floor_ring_frame",
    "walls",
    "roof",
    "connections",
  ] as const) {
    const snapshot = materializeSmallHouseWindStage(
      SYNTHETIC_PHASE4_HOUSE,
      stage,
    );
    const result = assessBracingTopologyReadiness(snapshot, input());
    assert.equal(result.state, "blocked_stage_before_bracing");
    assert.equal(result.brace, null);
    assert.equal(result.incidentConnections.length, 0);
  }
});

test("active non-brace geometry is never reinterpreted as bracing", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "bracing",
  );
  const value = input([null, null]);
  value.braceId = "synthetic-support-nw";

  const result = assessBracingTopologyReadiness(snapshot, value);
  assert.equal(result.state, "blocked_component_not_brace");
  assert.equal(result.canReviewTopology, false);
  assert.equal(result.brace?.kind, "primary_support");
});

test("missing, unrelated, and duplicated brace-end connections are blocked rather than substituted", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "bracing",
  );

  assert.equal(
    assessBracingTopologyReadiness(
      snapshot,
      input(["synthetic-connection-brace-west", "missing-connection"]),
    ).state,
    "blocked_connection_not_active",
  );

  assert.equal(
    assessBracingTopologyReadiness(
      snapshot,
      input([
        "synthetic-connection-brace-west",
        "synthetic-connection-support-ring-ne",
      ]),
    ).state,
    "blocked_connection_not_incident_to_brace",
  );

  assert.equal(
    assessBracingTopologyReadiness(
      snapshot,
      input([
        "synthetic-connection-brace-west",
        "synthetic-connection-brace-west",
      ]),
    ).state,
    "blocked_duplicate_connection",
  );
});

test("two distinct explicit incident connections establish reviewable topology only", () => {
  const specimen = fixtureWithExplicitSecondBraceEnd();
  const snapshot = materializeSmallHouseWindStage(specimen, "bracing");
  const result = assessBracingTopologyReadiness(
    snapshot,
    input([
      "synthetic-connection-brace-west",
      "synthetic-connection-brace-west-second-end",
    ]),
  );

  assert.equal(result.state, "review_ready_topology");
  assert.equal(result.canReviewTopology, true);
  assert.equal(result.bracingMechanicsAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.topology.explicitSelectedEndCount, 2);
  assert.equal(result.topology.distinctSelectedConnections, true);
  assert.equal(result.topology.physicalJointLocationsKnown, false);
  assert.deepEqual(result.topology.inferredJointLocations, [null, null]);
  assert.equal(result.selectedEndConnections[0]?.id, "synthetic-connection-brace-west");
  assert.equal(
    result.selectedEndConnections[1]?.id,
    "synthetic-connection-brace-west-second-end",
  );
  assert.equal(result.otherEndpointComponents[0]?.id, "synthetic-support-nw");
  assert.equal(result.otherEndpointComponents[1]?.id, "synthetic-ring-north");
  assert.equal(result.mechanics.axialForceN, null);
  assert.equal(result.mechanics.axialStiffnessNPerM, null);
  assert.equal(result.mechanics.bucklingModel, null);
  assert.equal(result.mechanics.rackingContribution, null);
  assert.equal(result.mechanics.capacityN, null);
  assert.equal(result.mechanics.passFail, null);
  assert.equal(result.mechanics.loadPathAdequacy, null);
});

test("returned brace topology records are copies rather than mutable aliases", () => {
  const specimen = fixtureWithExplicitSecondBraceEnd();
  const snapshot = materializeSmallHouseWindStage(specimen, "bracing");
  const result = assessBracingTopologyReadiness(
    snapshot,
    input([
      "synthetic-connection-brace-west",
      "synthetic-connection-brace-west-second-end",
    ]),
  );

  result.brace!.centerM.x = 999;
  result.incidentConnections[0].capacityN = 999;
  result.otherEndpointComponents[0]!.centerM.x = 999;

  assert.notEqual(
    snapshot.components.find((component) => component.id === "synthetic-brace-north-west")!.centerM.x,
    999,
  );
  assert.notEqual(
    snapshot.connections.find((connection) => connection.id === "synthetic-connection-brace-west")!.capacityN,
    999,
  );
  assert.notEqual(
    snapshot.components.find((component) => component.id === "synthetic-support-nw")!.centerM.x,
    999,
  );
});
