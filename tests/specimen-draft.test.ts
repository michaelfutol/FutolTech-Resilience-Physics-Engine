import test from "node:test";
import assert from "node:assert/strict";

import specimensData from "../data/specimens.sample.json";
import type { Specimen } from "../src/types/rpe";
import {
  createCandidateFromDraft,
  createSpecimenDraft,
  diffSpecimenDraft,
  setDraftAssembly,
  setDraftNotes,
  setDraftUpgrades,
} from "../src/lib/prototypes/specimenDraft";

const baseline = specimensData[0] as Specimen;

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
