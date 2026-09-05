import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import {
  materializeSmallHouseWindStage,
  validateSmallHouseWindSpecimen,
} from "../src/lib/smallHouseWind/systemContract";

test("synthetic Phase 4 browser fixture validates without adopting hidden engineering properties", () => {
  const specimen = validateSmallHouseWindSpecimen(SYNTHETIC_PHASE4_HOUSE);

  assert.equal(specimen.verificationState, "unverified");
  assert.equal(specimen.components.every((item) => item.materialId === null), true);
  assert.equal(specimen.components.every((item) => item.massKg === null), true);
  assert.equal(specimen.connections.every((item) => item.capacityN === null), true);
});

test("synthetic Phase 4 browser fixture progresses deterministically through every roadmap stage", () => {
  const empty = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "empty_envelope");
  const supports = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "primary_supports");
  const ring = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "floor_ring_frame");
  const walls = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const roof = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "roof");
  const connections = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "connections");
  const bracing = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "bracing");
  const anchorage = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "anchorage");
  const storm = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "storm_protection");

  assert.equal(empty.structuralResult, "N/A");
  assert.equal(empty.components.length, 0);
  assert.equal(supports.components.length, 4);
  assert.equal(ring.components.length, 8);
  assert.equal(walls.components.length, 12);
  assert.equal(roof.components.length, 14);
  assert.equal(connections.connections.length, 10);
  assert.equal(bracing.components.length, 16);
  assert.equal(bracing.connections.length, 12);
  assert.equal(anchorage.components.length, 20);
  assert.equal(anchorage.connections.length, 16);
  assert.equal(storm.components.length, 22);
  assert.equal(storm.connections.length, 18);
  assert.equal(storm.structuralResult, "DECLARED_COMPONENTS_ONLY");
});

test("synthetic Phase 4 fixture contains explicit non-zero orientation where visual semantics require it", () => {
  const roofWest = SYNTHETIC_PHASE4_HOUSE.components.find((item) => item.id === "synthetic-roof-west");
  const braceWest = SYNTHETIC_PHASE4_HOUSE.components.find((item) => item.id === "synthetic-brace-north-west");

  assert.notEqual(roofWest?.rotationRad.z, 0);
  assert.notEqual(braceWest?.rotationRad.z, 0);
});
