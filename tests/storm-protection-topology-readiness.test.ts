import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { assessStormProtectionTopologyReadiness } from "../src/lib/smallHouseWind/stormProtectionTopologyReadiness";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION,
  type StormProtectionTopologyReadinessInput,
} from "../src/types/stormProtectionTopologyReadiness";
import type { SmallHouseWindSpecimenInput } from "../src/types/smallHouseWind";

function input(
  endConnectionIds: readonly [string | null, string | null] = [
    "synthetic-connection-storm-west",
    null,
  ],
): StormProtectionTopologyReadinessInput {
  return {
    schemaVersion: STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION,
    restraintMemberId: "synthetic-storm-strap-west",
    endConnectionIds,
    sourceNote: "Synthetic QA storm-restraint topology review only",
    verificationState: "unverified",
  };
}

function cloneSpecimen(): SmallHouseWindSpecimenInput {
  return {
    ...SYNTHETIC_PHASE4_HOUSE,
    envelope: { ...SYNTHETIC_PHASE4_HOUSE.envelope },
    components: SYNTHETIC_PHASE4_HOUSE.components.map((component) => ({
      ...component,
      centerM: { ...component.centerM },
      sizeM: { ...component.sizeM },
      rotationRad: { ...component.rotationRad },
    })),
    connections: SYNTHETIC_PHASE4_HOUSE.connections.map((connection) => ({
      ...connection,
    })),
  };
}

function fixtureWithExplicitSecondRestraintEnd(): SmallHouseWindSpecimenInput {
  const specimen = cloneSpecimen();
  return {
    ...specimen,
    connections: [
      ...specimen.connections,
      {
        id: "synthetic-connection-storm-west-second-end",
        activationStage: "storm_protection",
        fromComponentId: "synthetic-storm-strap-west",
        toComponentId: "synthetic-anchor-nw",
        capacityN: null,
        sourceNote:
          "Synthetic QA second restraint-end topology only; no physical attachment point, restraint capacity, or anchorage mechanics adopted",
        verificationState: "unverified",
      },
    ],
  };
}

function fixtureWithDuplicateRoofEndpoint(): SmallHouseWindSpecimenInput {
  const specimen = cloneSpecimen();
  return {
    ...specimen,
    connections: [
      ...specimen.connections,
      {
        id: "synthetic-connection-storm-west-duplicate-roof-end",
        activationStage: "storm_protection",
        fromComponentId: "synthetic-storm-strap-west",
        toComponentId: "synthetic-roof-west",
        capacityN: null,
        sourceNote:
          "Synthetic QA duplicate roof-side relationship only; not a second restraint endpoint",
        verificationState: "unverified",
      },
    ],
  };
}

test("a visible storm strap with only one declared end remains an incomplete restraint path", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "storm_protection",
  );
  const result = assessStormProtectionTopologyReadiness(snapshot, input());

  assert.equal(result.state, "restraint_path_incomplete");
  assert.equal(result.canReviewTopology, false);
  assert.equal(result.stormProtectionMechanicsAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.restraintMember?.id, "synthetic-storm-strap-west");
  assert.equal(result.incidentConnections.length, 1);
  assert.equal(result.incidentConnections[0].id, "synthetic-connection-storm-west");
  assert.equal(result.selectedEndConnections[0]?.id, "synthetic-connection-storm-west");
  assert.equal(result.selectedEndConnections[1], null);
  assert.equal(result.topology.explicitSelectedEndCount, 1);
  assert.equal(result.topology.distinctSelectedConnections, false);
  assert.equal(result.topology.distinctOtherEndpointComponents, false);
  assert.equal(result.topology.physicalAttachmentPointsKnown, false);
  assert.deepEqual(result.topology.inferredAttachmentPoints, [null, null]);
  assert.deepEqual(result.mechanics, {
    tensionN: null,
    preloadN: null,
    axialStiffnessNPerM: null,
    slackM: null,
    elongationM: null,
    windUpliftDemandN: null,
    restraintForceN: null,
    loadSharing: null,
    memberCapacityN: null,
    connectionCapacityN: null,
    utilization: null,
    passFail: null,
    wholeHouseImprovement: null,
  });
  assert.match(result.reason, /strap-looking member is not treated as a complete restraint path/);
});

test("storm-strap geometry does not manufacture a second restraint-end connection", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "storm_protection",
  );
  const result = assessStormProtectionTopologyReadiness(
    snapshot,
    input([null, null]),
  );

  assert.equal(result.state, "restraint_path_incomplete");
  assert.equal(result.incidentConnections.length, 1);
  assert.equal(result.topology.explicitSelectedEndCount, 0);
  assert.deepEqual(result.topology.inferredAttachmentPoints, [null, null]);
});

test("every stage before storm protection blocks retained restraint selections", () => {
  for (const stage of [
    "empty_envelope",
    "primary_supports",
    "floor_ring_frame",
    "walls",
    "roof",
    "connections",
    "bracing",
    "anchorage",
  ] as const) {
    const snapshot = materializeSmallHouseWindStage(
      SYNTHETIC_PHASE4_HOUSE,
      stage,
    );
    const result = assessStormProtectionTopologyReadiness(snapshot, input());

    assert.equal(result.state, "blocked_stage_before_storm_protection");
    assert.equal(result.restraintMember, null);
    assert.equal(result.incidentConnections.length, 0);
  }
});

test("active non-storm-protection geometry is never reinterpreted as a restraint", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "storm_protection",
  );
  const value = input([null, null]);
  value.restraintMemberId = "synthetic-roof-west";

  const result = assessStormProtectionTopologyReadiness(snapshot, value);
  assert.equal(result.state, "blocked_component_not_storm_protection_member");
  assert.equal(result.canReviewTopology, false);
  assert.equal(result.restraintMember?.kind, "roof_panel");
});

test("missing, unrelated, and duplicated restraint-end connections are blocked rather than substituted", () => {
  const snapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "storm_protection",
  );

  assert.equal(
    assessStormProtectionTopologyReadiness(
      snapshot,
      input(["synthetic-connection-storm-west", "missing-connection"]),
    ).state,
    "blocked_connection_not_active",
  );

  assert.equal(
    assessStormProtectionTopologyReadiness(
      snapshot,
      input([
        "synthetic-connection-storm-west",
        "synthetic-connection-anchor-nw",
      ]),
    ).state,
    "blocked_connection_not_incident_to_restraint",
  );

  assert.equal(
    assessStormProtectionTopologyReadiness(
      snapshot,
      input([
        "synthetic-connection-storm-west",
        "synthetic-connection-storm-west",
      ]),
    ).state,
    "blocked_duplicate_connection",
  );
});

test("two separate records to the same opposite component do not create a two-ended restraint path", () => {
  const specimen = fixtureWithDuplicateRoofEndpoint();
  const snapshot = materializeSmallHouseWindStage(specimen, "storm_protection");
  const result = assessStormProtectionTopologyReadiness(
    snapshot,
    input([
      "synthetic-connection-storm-west",
      "synthetic-connection-storm-west-duplicate-roof-end",
    ]),
  );

  assert.equal(result.state, "blocked_same_other_endpoint_component");
  assert.equal(result.canReviewTopology, false);
  assert.equal(result.topology.distinctSelectedConnections, true);
  assert.equal(result.topology.distinctOtherEndpointComponents, false);
  assert.equal(result.otherEndpointComponents[0]?.id, "synthetic-roof-west");
  assert.equal(result.otherEndpointComponents[1]?.id, "synthetic-roof-west");
});

test("two distinct explicit ends to distinct active components establish reviewable topology only", () => {
  const specimen = fixtureWithExplicitSecondRestraintEnd();
  const snapshot = materializeSmallHouseWindStage(specimen, "storm_protection");
  const result = assessStormProtectionTopologyReadiness(
    snapshot,
    input([
      "synthetic-connection-storm-west",
      "synthetic-connection-storm-west-second-end",
    ]),
  );

  assert.equal(result.state, "review_ready_topology");
  assert.equal(result.canReviewTopology, true);
  assert.equal(result.stormProtectionMechanicsAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.topology.explicitSelectedEndCount, 2);
  assert.equal(result.topology.distinctSelectedConnections, true);
  assert.equal(result.topology.distinctOtherEndpointComponents, true);
  assert.equal(result.topology.physicalAttachmentPointsKnown, false);
  assert.deepEqual(result.topology.inferredAttachmentPoints, [null, null]);
  assert.equal(result.selectedEndConnections[0]?.id, "synthetic-connection-storm-west");
  assert.equal(
    result.selectedEndConnections[1]?.id,
    "synthetic-connection-storm-west-second-end",
  );
  assert.equal(result.otherEndpointComponents[0]?.id, "synthetic-roof-west");
  assert.equal(result.otherEndpointComponents[1]?.id, "synthetic-anchor-nw");
  assert.equal(result.mechanics.tensionN, null);
  assert.equal(result.mechanics.preloadN, null);
  assert.equal(result.mechanics.axialStiffnessNPerM, null);
  assert.equal(result.mechanics.slackM, null);
  assert.equal(result.mechanics.windUpliftDemandN, null);
  assert.equal(result.mechanics.restraintForceN, null);
  assert.equal(result.mechanics.memberCapacityN, null);
  assert.equal(result.mechanics.connectionCapacityN, null);
  assert.equal(result.mechanics.passFail, null);
  assert.equal(result.mechanics.wholeHouseImprovement, null);
});

test("returned storm-protection topology records are copies rather than mutable aliases", () => {
  const specimen = fixtureWithExplicitSecondRestraintEnd();
  const snapshot = materializeSmallHouseWindStage(specimen, "storm_protection");
  const result = assessStormProtectionTopologyReadiness(
    snapshot,
    input([
      "synthetic-connection-storm-west",
      "synthetic-connection-storm-west-second-end",
    ]),
  );

  result.restraintMember!.centerM.x = 999;
  result.incidentConnections[0].capacityN = 999;
  result.otherEndpointComponents[0]!.centerM.x = 999;

  assert.notEqual(
    snapshot.components.find(
      (component) => component.id === "synthetic-storm-strap-west",
    )!.centerM.x,
    999,
  );
  assert.notEqual(
    snapshot.connections.find(
      (connection) => connection.id === "synthetic-connection-storm-west",
    )!.capacityN,
    999,
  );
  assert.notEqual(
    snapshot.components.find(
      (component) => component.id === "synthetic-roof-west",
    )!.centerM.x,
    999,
  );
});
