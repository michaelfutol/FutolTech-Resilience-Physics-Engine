import test from "node:test";
import assert from "node:assert/strict";

import { validateGenesisCollisionTargetInput } from "../src/lib/genesis/collisionTarget";
import type { GenesisCollisionTargetInput } from "../src/types/genesisCollisionTarget";

const explicitBox: GenesisCollisionTargetInput = {
  schemaVersion: "0.1.0",
  id: "target-fixture",
  shape: "box",
  centerM: { x: 1, y: 2, z: 3 },
  sizeM: { x: 0.5, y: 1.5, z: 2.5 },
  sourceNote: "synthetic collision-target fixture",
  verificationState: "unverified",
};

test("collision-target contract preserves only explicit identity, geometry, and provenance", () => {
  const contract = validateGenesisCollisionTargetInput(explicitBox);

  assert.equal(contract.evidenceLayer, "rpe_simulation");
  assert.equal(contract.objectId, "target-fixture");
  assert.deepEqual(contract.centerM, { x: 1, y: 2, z: 3 });
  assert.deepEqual(contract.sizeM, { x: 0.5, y: 1.5, z: 2.5 });
  assert.equal(contract.provenance.sourceNote, "synthetic collision-target fixture");
  assert.equal("friction" in contract, false);
  assert.equal("restitution" in contract, false);
  assert.equal("massKg" in contract, false);
  assert.equal("capacityN" in contract, false);
});

test("collision-target contract rejects missing identity or provenance", () => {
  assert.throws(
    () => validateGenesisCollisionTargetInput({ ...explicitBox, id: "   " }),
    /id must be non-empty/,
  );
  assert.throws(
    () => validateGenesisCollisionTargetInput({ ...explicitBox, sourceNote: "   " }),
    /sourceNote must be non-empty/,
  );
});

test("collision-target contract rejects non-finite center coordinates and non-positive dimensions", () => {
  assert.throws(
    () =>
      validateGenesisCollisionTargetInput({
        ...explicitBox,
        centerM: { x: Number.NaN, y: 2, z: 3 },
      }),
    /centerM.x must be finite/,
  );
  assert.throws(
    () =>
      validateGenesisCollisionTargetInput({
        ...explicitBox,
        sizeM: { x: 0, y: 1.5, z: 2.5 },
      }),
    /sizeM.x must be greater than zero/,
  );
});

test("collision-target contract rejects unsupported runtime schema/shape values", () => {
  assert.throws(
    () =>
      validateGenesisCollisionTargetInput({
        ...explicitBox,
        schemaVersion: "0.2.0" as "0.1.0",
      }),
    /Unsupported Genesis collision-target schema version/,
  );
  assert.throws(
    () =>
      validateGenesisCollisionTargetInput({
        ...explicitBox,
        shape: "sphere" as "box",
      }),
    /Unsupported collision target shape/,
  );
});
