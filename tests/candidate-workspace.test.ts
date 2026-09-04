import test from "node:test";
import assert from "node:assert/strict";

import specimensData from "../data/specimens.sample.json";
import type { Specimen } from "../src/types/rpe";
import {
  nextCandidateSequence,
  parseCandidateWorkspace,
  serializeCandidateWorkspace,
} from "../src/lib/prototypes/candidateWorkspace";
import {
  createCandidateFromDraft,
  createSpecimenDraft,
  setDraftAssembly,
} from "../src/lib/prototypes/specimenDraft";

const baseline = specimensData[0] as Specimen;

function makeCandidate(sequence: number): Specimen {
  const draft = setDraftAssembly(
    createSpecimenDraft(baseline),
    "frame",
    sequence % 2 === 0 ? "asm-frame-bamboo-hybrid" : "asm-frame-38"
  );
  return createCandidateFromDraft(baseline, draft, {
    candidateId: `specimen-a${sequence}-dignity-3x3`,
    candidateName: `Candidate A${sequence}`,
  }).candidate;
}

test("candidate workspace round-trips valid derived specimens", () => {
  const candidates = [makeCandidate(1), makeCandidate(2)];
  const raw = serializeCandidateWorkspace(baseline.id, candidates);
  const parsed = parseCandidateWorkspace(raw, baseline.id);

  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.candidates, candidates);
});

test("candidate workspace rejects another baseline", () => {
  const raw = serializeCandidateWorkspace(baseline.id, [makeCandidate(1)]);
  const parsed = parseCandidateWorkspace(raw, "different-baseline");

  assert.deepEqual(parsed.candidates, []);
  assert.ok(parsed.errors.some((error) => error.includes("does not match")));
});

test("candidate workspace rejects malformed and duplicate records", () => {
  const candidate = makeCandidate(1);
  const raw = JSON.stringify({
    schemaVersion: 1,
    baselineSpecimenId: baseline.id,
    candidates: [candidate, candidate, { broken: true }],
  });
  const parsed = parseCandidateWorkspace(raw, baseline.id);

  assert.equal(parsed.candidates.length, 1);
  assert.ok(parsed.errors.some((error) => error.includes("duplicate candidate ID")));
  assert.ok(parsed.errors.some((error) => error.includes("item 2 is invalid")));
});

test("candidate sequence continues after highest saved A-number", () => {
  assert.equal(nextCandidateSequence([]), 1);
  assert.equal(nextCandidateSequence([makeCandidate(1), makeCandidate(3)]), 4);
});
