import test from "node:test";
import assert from "node:assert/strict";

import specimensData from "../data/specimens.sample.json";
import upgradesData from "../data/upgrade-definitions.sample.json";
import type { Specimen, UpgradeDefinition } from "../src/types/rpe";
import {
  applyUpgradeDefinition,
  createCandidateFromDraft,
  createSpecimenDraft,
  diffSpecimenDraft,
  setDraftAssembly,
  setDraftNotes,
  setDraftUpgrades,
} from "../src/lib/prototypes/specimenDraft";

const baseline = specimensData[0] as Specimen;
const upgrades = upgradesData as UpgradeDefinition[];

function getUpgrade(id: string): UpgradeDefinition {
  const upgrade = upgrades.find((item) => item.id === id);
  assert.ok(upgrade, `Missing upgrade definition ${id}`);
  return upgrade;
}

test("editing a draft never mutates A0", () => {
  const baselineSnapshot = structuredClone(baseline);
  const draft = createSpecimenDraft(baseline);
  const edited = setDraftAssembly(draft, "frame", "asm-frame-38");

  assert.equal(draft.assemblySelections.frame, "asm-frame-25");
  assert.equal(edited.assemblySelections.frame, "asm-frame-38");
  assert.deepEqual(baseline, baselineSnapshot);
});

test("draft diff reports only changed assemblies and upgrades", () => {
  let draft = createSpecimenDraft(baseline);
  draft = setDraftAssembly(draft, "frame", "asm-frame-38");
  draft = setDraftAssembly(draft, "bracing", "asm-brace-steel");
  draft = setDraftUpgrades(draft, ["upgrade-frame-38", "upgrade-diagonal-brace"]);

  const diff = diffSpecimenDraft(baseline, draft);

  assert.deepEqual(diff.assemblyChanges, [
    {
      slot: "bracing",
      fromAssemblyId: "asm-brace-none",
      toAssemblyId: "asm-brace-steel",
    },
    {
      slot: "frame",
      fromAssemblyId: "asm-frame-25",
      toAssemblyId: "asm-frame-38",
    },
  ]);
  assert.deepEqual(diff.addedUpgradeIds, ["upgrade-diagonal-brace", "upgrade-frame-38"]);
  assert.deepEqual(diff.removedUpgradeIds, []);
});

test("ready upgrade applies assembly changes and records ancestry without mutating A0", () => {
  const baselineSnapshot = structuredClone(baseline);
  const draft = createSpecimenDraft(baseline);
  const result = applyUpgradeDefinition(
    baseline,
    draft,
    getUpgrade("add-diagonal-bracing"),
    upgrades
  );

  assert.equal(result.draft.assemblySelections.bracing, "asm-brace-steel");
  assert.deepEqual(result.draft.appliedUpgradeIds, ["add-diagonal-bracing"]);
  assert.deepEqual(result.replacedUpgradeIds, []);
  assert.deepEqual(baseline, baselineSnapshot);
});

test("applying an upgrade is idempotent", () => {
  const upgrade = getUpgrade("roof-tie-down-straps");
  const first = applyUpgradeDefinition(
    baseline,
    createSpecimenDraft(baseline),
    upgrade,
    upgrades
  );
  const second = applyUpgradeDefinition(baseline, first.draft, upgrade, upgrades);

  assert.equal(second.draft.assemblySelections.restraint, "asm-restraint-strap");
  assert.deepEqual(second.draft.appliedUpgradeIds, ["roof-tie-down-straps"]);
  assert.deepEqual(second.replacedUpgradeIds, []);
});

test("conflicting upgrade replacement removes stale ancestry and restores unrelated effects", () => {
  const firstUpgrade: UpgradeDefinition = {
    id: "test-frame-and-brace",
    name: "Test frame and brace",
    targetFailureTypes: ["test"],
    expectedBenefit: "test",
    priority: "low",
    status: "ready",
    assemblyChanges: [
      { slot: "frame", assemblyId: "asm-frame-38" },
      { slot: "bracing", assemblyId: "asm-brace-steel" },
    ],
    notes: [],
  };
  const secondUpgrade: UpgradeDefinition = {
    id: "test-frame-only",
    name: "Test frame only",
    targetFailureTypes: ["test"],
    expectedBenefit: "test",
    priority: "low",
    status: "ready",
    assemblyChanges: [{ slot: "frame", assemblyId: "asm-frame-bamboo-hybrid" }],
    notes: [],
  };
  const catalog = [...upgrades, firstUpgrade, secondUpgrade];

  const first = applyUpgradeDefinition(
    baseline,
    createSpecimenDraft(baseline),
    firstUpgrade,
    catalog
  );
  const second = applyUpgradeDefinition(baseline, first.draft, secondUpgrade, catalog);

  assert.equal(second.draft.assemblySelections.frame, "asm-frame-bamboo-hybrid");
  assert.equal(second.draft.assemblySelections.bracing, baseline.assemblySelections.bracing);
  assert.deepEqual(second.draft.appliedUpgradeIds, ["test-frame-only"]);
  assert.deepEqual(second.replacedUpgradeIds, ["test-frame-and-brace"]);
});

test("needs-definition upgrades cannot be applied", () => {
  assert.throws(
    () =>
      applyUpgradeDefinition(
        baseline,
        createSpecimenDraft(baseline),
        getUpgrade("base-anchor-upgrade"),
        upgrades
      ),
    /is not ready for application/
  );
});

test("Create Candidate produces A1 ancestry without altering A0", () => {
  const baselineSnapshot = structuredClone(baseline);
  let draft = createSpecimenDraft(baseline);
  draft = setDraftAssembly(draft, "frame", "asm-frame-38");
  draft = setDraftUpgrades(draft, ["upgrade-frame-38"]);
  draft = setDraftNotes(draft, "A1 test candidate with larger frame assembly.");

  const result = createCandidateFromDraft(baseline, draft, {
    candidateId: "specimen-a1-dignity-3x3",
    candidateName: "Dignity Native Homes (A1 Candidate)",
  });

  assert.equal(result.candidate.id, "specimen-a1-dignity-3x3");
  assert.equal(result.candidate.parentSpecimenId, baseline.id);
  assert.equal(result.candidate.createdFromDraft, true);
  assert.equal(result.candidate.assemblySelections.frame, "asm-frame-38");
  assert.deepEqual(result.candidate.appliedUpgradeIds, ["upgrade-frame-38"]);
  assert.deepEqual(baseline, baselineSnapshot);
});

test("reset is deterministic by recreating the draft from unchanged A0", () => {
  const originalDraft = createSpecimenDraft(baseline);
  const editedDraft = setDraftAssembly(originalDraft, "roof", "asm-roof-upvc");
  const resetDraft = createSpecimenDraft(baseline);

  assert.notDeepEqual(editedDraft, originalDraft);
  assert.deepEqual(resetDraft, originalDraft);
});

test("candidate derivation rejects a draft from a different baseline", () => {
  const draft = {
    ...createSpecimenDraft(baseline),
    baselineSpecimenId: "different-baseline",
  };

  assert.throws(
    () =>
      createCandidateFromDraft(baseline, draft, {
        candidateId: "specimen-a1-dignity-3x3",
      }),
    /does not match specimen/
  );
});
