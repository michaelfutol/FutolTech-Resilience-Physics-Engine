import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeSmallHouseWindStage,
  validateSmallHouseWindSpecimen,
} from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindSpecimenInput,
} from "../src/types/smallHouseWind";

function syntheticHouse(): SmallHouseWindSpecimenInput {
  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    id: "synthetic-phase4-house-001",
    label: "Synthetic Phase 4 staging fixture only",
    envelope: {
      id: "synthetic-envelope-001",
      centerM: { x: 0, y: 1.5, z: 0 },
      sizeM: { x: 4, y: 3, z: 5 },
      sourceNote: "Synthetic envelope geometry for software regression only",
      verificationState: "unverified",
    },
    components: [
      {
        id: "synthetic-support-001",
        kind: "primary_support",
        activationStage: "primary_supports",
        centerM: { x: -1.5, y: 1, z: -2 },
        sizeM: { x: 0.2, y: 2, z: 0.2 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic primary-support geometry only",
        verificationState: "unverified",
      },
      {
        id: "synthetic-ring-001",
        kind: "floor_ring_frame_member",
        activationStage: "floor_ring_frame",
        centerM: { x: 0, y: 0.6, z: -2 },
        sizeM: { x: 3.2, y: 0.15, z: 0.15 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic ring-frame geometry only",
        verificationState: "unverified",
      },
      {
        id: "synthetic-wall-001",
        kind: "wall_panel",
        activationStage: "walls",
        centerM: { x: 0, y: 1.6, z: -2.4 },
        sizeM: { x: 3.6, y: 2, z: 0.08 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic wall geometry only",
        verificationState: "unverified",
      },
      {
        id: "synthetic-roof-001",
        kind: "roof_panel",
        activationStage: "roof",
        centerM: { x: 0, y: 2.9, z: 0 },
        sizeM: { x: 3.8, y: 0.08, z: 4.8 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic roof geometry only",
        verificationState: "unverified",
      },
      {
        id: "synthetic-brace-001",
        kind: "brace",
        activationStage: "bracing",
        centerM: { x: 0, y: 1.5, z: -2.2 },
        sizeM: { x: 0.1, y: 2.2, z: 0.1 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic brace placeholder geometry only",
        verificationState: "unverified",
      },
      {
        id: "synthetic-anchor-001",
        kind: "anchor",
        activationStage: "anchorage",
        centerM: { x: -1.5, y: 0.05, z: -2 },
        sizeM: { x: 0.1, y: 0.1, z: 0.1 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic anchor placeholder geometry only",
        verificationState: "unverified",
      },
      {
        id: "synthetic-storm-member-001",
        kind: "storm_protection_member",
        activationStage: "storm_protection",
        centerM: { x: 0, y: 3.1, z: 0 },
        sizeM: { x: 0.08, y: 0.08, z: 5 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic storm-protection placeholder geometry only",
        verificationState: "unverified",
      },
    ],
    connections: [
      {
        id: "synthetic-connection-001",
        activationStage: "connections",
        fromComponentId: "synthetic-support-001",
        toComponentId: "synthetic-ring-001",
        capacityN: null,
        sourceNote: "Synthetic topology relationship only; capacity deliberately unknown",
        verificationState: "unverified",
      },
      {
        id: "synthetic-brace-connection-001",
        activationStage: "bracing",
        fromComponentId: "synthetic-brace-001",
        toComponentId: "synthetic-support-001",
        capacityN: null,
        sourceNote: "Synthetic brace relationship only; capacity deliberately unknown",
        verificationState: "unverified",
      },
    ],
    sourceNote: "Synthetic Phase 4 system-contract regression fixture only",
    verificationState: "unverified",
  };
}

test("empty-envelope stage preserves Null-House semantics with no physical performance claim", () => {
  const snapshot = materializeSmallHouseWindStage(syntheticHouse(), "empty_envelope");

  assert.equal(snapshot.components.length, 0);
  assert.equal(snapshot.connections.length, 0);
  assert.equal(snapshot.structuralResult, "N/A");
  assert.equal(snapshot.reason, "no_physical_specimen");
});

test("progressive staging activates only explicitly declared component classes", () => {
  const supports = materializeSmallHouseWindStage(syntheticHouse(), "primary_supports");
  assert.deepEqual(supports.components.map((item) => item.id), ["synthetic-support-001"]);
  assert.equal(supports.connections.length, 0);
  assert.equal(supports.structuralResult, "DECLARED_COMPONENTS_ONLY");

  const roof = materializeSmallHouseWindStage(syntheticHouse(), "roof");
  assert.deepEqual(roof.components.map((item) => item.kind), [
    "primary_support",
    "floor_ring_frame_member",
    "wall_panel",
    "roof_panel",
  ]);
  assert.equal(roof.connections.length, 0);

  const connected = materializeSmallHouseWindStage(syntheticHouse(), "connections");
  assert.equal(connected.connections.length, 1);
  assert.equal(connected.connections[0]?.id, "synthetic-connection-001");
});

test("unknown material, mass, and connection capacity remain explicitly null", () => {
  const specimen = validateSmallHouseWindSpecimen(syntheticHouse());

  assert.equal(specimen.components[0]?.materialId, null);
  assert.equal(specimen.components[0]?.massKg, null);
  assert.equal(specimen.connections[0]?.capacityN, null);
});

test("contract rejects duplicate identity and missing connection endpoints", () => {
  const duplicate = syntheticHouse();
  duplicate.components[0] = {
    ...duplicate.components[0]!,
    id: duplicate.envelope.id,
  };
  assert.throws(
    () => validateSmallHouseWindSpecimen(duplicate),
    /Duplicate small-house object ID/,
  );

  const missingEndpoint = syntheticHouse();
  missingEndpoint.connections[0] = {
    ...missingEndpoint.connections[0]!,
    toComponentId: "missing-component",
  };
  assert.throws(
    () => validateSmallHouseWindSpecimen(missingEndpoint),
    /references a missing component/,
  );
});

test("component kind cannot be silently activated in the wrong construction stage", () => {
  const wrongStage = syntheticHouse();
  wrongStage.components[0] = {
    ...wrongStage.components[0]!,
    activationStage: "walls",
  };

  assert.throws(
    () => validateSmallHouseWindSpecimen(wrongStage),
    /activation stage walls does not match kind primary_support/,
  );
});

test("connections cannot activate before both declared endpoints exist", () => {
  const early = syntheticHouse();
  early.connections.push({
    id: "synthetic-early-storm-connection",
    activationStage: "connections",
    fromComponentId: "synthetic-support-001",
    toComponentId: "synthetic-storm-member-001",
    capacityN: null,
    sourceNote: "Synthetic invalid timing fixture only",
    verificationState: "unverified",
  });

  assert.throws(
    () => validateSmallHouseWindSpecimen(early),
    /cannot activate before both endpoint components exist/,
  );
});

test("stage materialization is deterministic and returns copies rather than mutating the source", () => {
  const source = syntheticHouse();
  const first = materializeSmallHouseWindStage(source, "bracing");
  const second = materializeSmallHouseWindStage(source, "bracing");

  assert.deepEqual(first, second);
  first.components[0]!.centerM.x = 999;
  assert.notEqual(source.components[0]!.centerM.x, 999);
});
