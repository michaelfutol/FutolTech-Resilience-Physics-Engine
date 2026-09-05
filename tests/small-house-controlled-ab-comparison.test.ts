import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { compareControlledSmallHouseVariants } from "../src/lib/smallHouseWind/controlledABComparison";
import {
  SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION,
  type SmallHouseControlledABComparisonInput,
} from "../src/types/smallHouseControlledAB";
import type { SmallHouseWindSpecimenInput } from "../src/types/smallHouseWind";

const DECLARED_CONNECTION_ID = "synthetic-connection-storm-west-second-end";

function cloneSpecimen(): SmallHouseWindSpecimenInput {
  return {
    ...SYNTHETIC_PHASE4_HOUSE,
    envelope: {
      ...SYNTHETIC_PHASE4_HOUSE.envelope,
      centerM: { ...SYNTHETIC_PHASE4_HOUSE.envelope.centerM },
      sizeM: { ...SYNTHETIC_PHASE4_HOUSE.envelope.sizeM },
    },
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

function addDeclaredSecondStormEnd(
  specimen: SmallHouseWindSpecimenInput,
): SmallHouseWindSpecimenInput {
  return {
    ...specimen,
    connections: [
      ...specimen.connections,
      {
        id: DECLARED_CONNECTION_ID,
        activationStage: "storm_protection",
        fromComponentId: "synthetic-storm-strap-west",
        toComponentId: "synthetic-anchor-nw",
        capacityN: null,
        sourceNote:
          "Synthetic QA A/B declared second storm-restraint endpoint only; no mechanics or capacity adopted",
        verificationState: "unverified",
      },
    ],
  };
}

function comparison(
  caseA: SmallHouseWindSpecimenInput = cloneSpecimen(),
  caseB: SmallHouseWindSpecimenInput = addDeclaredSecondStormEnd(cloneSpecimen()),
): SmallHouseControlledABComparisonInput {
  return {
    schemaVersion: SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION,
    caseA: {
      label: "A — canonical one-ended storm strap",
      specimen: caseA,
    },
    caseB: {
      label: "B — QA-only explicit second storm endpoint",
      specimen: caseB,
    },
    declaredChange: {
      kind: "connection_record_added",
      connectionId: DECLARED_CONNECTION_ID,
    },
    sourceNote:
      "Synthetic Phase 4 controlled-input A/B QA only; no structural-performance claim",
    verificationState: "unverified",
  };
}

test("controlled A/B accepts exactly one declared connection record addition and no other change", () => {
  const result = compareControlledSmallHouseVariants(comparison());

  assert.equal(result.state, "controlled_input_difference");
  assert.equal(result.canCompareControlledInputs, true);
  assert.equal(result.evidenceLayer, "rpe_input_review");
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.mechanicsAvailable, false);
  assert.equal(result.performanceComparisonAvailable, false);
  assert.equal(result.performanceConclusion, null);
  assert.deepEqual(result.invariants, {
    specimenMetadataUnchanged: true,
    envelopeUnchanged: true,
    componentRecordsUnchanged: true,
    componentGeometryUnchanged: true,
    existingConnectionRecordsUnchanged: true,
    onlyDeclaredConnectionAdded: true,
  });
  assert.equal(result.observedDifference.connection?.id, DECLARED_CONNECTION_ID);
  assert.equal(
    result.observedDifference.connection?.fromComponentId,
    "synthetic-storm-strap-west",
  );
  assert.equal(
    result.observedDifference.connection?.toComponentId,
    "synthetic-anchor-nw",
  );
  assert.match(result.reason, /controlled input difference only/i);
});

test("declared change must be absent from A and explicitly present in B", () => {
  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), cloneSpecimen()),
  );

  assert.equal(result.state, "blocked_declared_change_not_satisfied");
  assert.equal(result.canCompareControlledInputs, false);
  assert.equal(result.observedDifference.connection, null);
  assert.equal(result.performanceComparisonAvailable, false);
});

test("an unrelated geometry change blocks the A/B comparison", () => {
  const caseB = addDeclaredSecondStormEnd(cloneSpecimen());
  const roof = caseB.components.find(
    (component) => component.id === "synthetic-roof-west",
  )!;
  roof.rotationRad.z = 0.36;

  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), caseB),
  );

  assert.equal(result.state, "blocked_unrelated_input_difference");
  assert.equal(result.canCompareControlledInputs, false);
  assert.equal(result.invariants.componentRecordsUnchanged, false);
  assert.equal(result.invariants.componentGeometryUnchanged, false);
  assert.equal(result.invariants.onlyDeclaredConnectionAdded, true);
  assert.equal(result.performanceComparisonAvailable, false);
});

test("an unrelated existing-connection property change blocks the A/B comparison", () => {
  const caseB = addDeclaredSecondStormEnd(cloneSpecimen());
  const existing = caseB.connections.find(
    (connection) => connection.id === "synthetic-connection-anchor-nw",
  )!;
  existing.capacityN = 100;

  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), caseB),
  );

  assert.equal(result.state, "blocked_unrelated_input_difference");
  assert.equal(result.invariants.existingConnectionRecordsUnchanged, false);
  assert.equal(result.invariants.onlyDeclaredConnectionAdded, false);
  assert.equal(result.performanceComparisonAvailable, false);
});

test("a second undeclared added connection blocks the A/B comparison", () => {
  const caseB = addDeclaredSecondStormEnd(cloneSpecimen());
  caseB.connections.push({
    id: "synthetic-connection-storm-east-second-end",
    activationStage: "storm_protection",
    fromComponentId: "synthetic-storm-strap-east",
    toComponentId: "synthetic-anchor-ne",
    capacityN: null,
    sourceNote: "Synthetic unrelated second A/B change that must invalidate control",
    verificationState: "unverified",
  });

  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), caseB),
  );

  assert.equal(result.state, "blocked_unrelated_input_difference");
  assert.equal(result.invariants.existingConnectionRecordsUnchanged, false);
  assert.equal(result.invariants.onlyDeclaredConnectionAdded, false);
});

test("specimen metadata changes are not silently treated as harmless A/B differences", () => {
  const caseB = addDeclaredSecondStormEnd(cloneSpecimen());
  caseB.sourceNote = "Different specimen source note";

  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), caseB),
  );

  assert.equal(result.state, "blocked_unrelated_input_difference");
  assert.equal(result.invariants.specimenMetadataUnchanged, false);
  assert.equal(result.performanceConclusion, null);
});

test("array ordering alone is not treated as a structural variable change", () => {
  const caseB = addDeclaredSecondStormEnd(cloneSpecimen());
  caseB.components.reverse();
  caseB.connections.reverse();

  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), caseB),
  );

  assert.equal(result.state, "controlled_input_difference");
  assert.equal(result.invariants.componentRecordsUnchanged, true);
  assert.equal(result.invariants.existingConnectionRecordsUnchanged, true);
});

test("returned observed connection is a copy rather than an alias into Case B", () => {
  const caseB = addDeclaredSecondStormEnd(cloneSpecimen());
  const result = compareControlledSmallHouseVariants(
    comparison(cloneSpecimen(), caseB),
  );

  result.observedDifference.connection!.capacityN = 999;

  assert.equal(
    caseB.connections.find((connection) => connection.id === DECLARED_CONNECTION_ID)!
      .capacityN,
    null,
  );
});
