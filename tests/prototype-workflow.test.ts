import test from "node:test";
import assert from "node:assert/strict";

import productsData from "../data/products.sample.json";
import assembliesData from "../data/assemblies.sample.json";
import ratesData from "../data/cost-rates.sample.json";
import specimensData from "../data/specimens.sample.json";
import upgradesData from "../data/upgrade-definitions.sample.json";
import type {
  Assembly,
  CostRate,
  Product,
  Specimen,
  UpgradeDefinition,
} from "../src/types/rpe";
import { validateCatalog } from "../src/lib/catalog/validateReferences";
import { calculateSpecimenCost } from "../src/lib/costing/calculateSpecimenCost";
import {
  parseCandidateWorkspace,
  serializeCandidateWorkspace,
} from "../src/lib/prototypes/candidateWorkspace";
import {
  applyUpgradeDefinition,
  createCandidateFromDraft,
  createSpecimenDraft,
} from "../src/lib/prototypes/specimenDraft";

const products = productsData as Product[];
const assemblies = assembliesData as Assembly[];
const rates = ratesData as CostRate[];
const baseline = specimensData[0] as Specimen;
const upgrades = upgradesData as UpgradeDefinition[];

function getUpgrade(id: string): UpgradeDefinition {
  const upgrade = upgrades.find((item) => item.id === id);
  assert.ok(upgrade, `Missing upgrade ${id}`);
  return upgrade;
}

test("Phase 2 workflow preserves A0 while producing a costed persistent A1", () => {
  const baselineSnapshot = structuredClone(baseline);
  const catalog = validateCatalog(products, assemblies, rates, [baseline], upgrades);
  assert.equal(catalog.valid, true, catalog.errors.join("\n"));

  const baselineCost = calculateSpecimenCost(baseline, assemblies, products, rates);
  assert.equal(baselineCost.totalCost, 22810);

  let draft = createSpecimenDraft(baseline);
  draft = applyUpgradeDefinition(
    baseline,
    draft,
    getUpgrade("add-diagonal-bracing"),
    upgrades
  ).draft;
  draft = applyUpgradeDefinition(
    baseline,
    draft,
    getUpgrade("roof-tie-down-straps"),
    upgrades
  ).draft;

  assert.equal(draft.assemblySelections.bracing, "asm-brace-steel");
  assert.equal(draft.assemblySelections.restraint, "asm-restraint-strap");
  assert.deepEqual(draft.appliedUpgradeIds, [
    "add-diagonal-bracing",
    "roof-tie-down-straps",
  ]);

  const draftSpecimen: Specimen = {
    ...baseline,
    assemblySelections: { ...draft.assemblySelections },
    appliedUpgradeIds: [...draft.appliedUpgradeIds],
    notes: draft.notes,
  };
  const upgradedCost = calculateSpecimenCost(
    draftSpecimen,
    assemblies,
    products,
    rates
  );
  assert.notEqual(upgradedCost.totalCost, baselineCost.totalCost);
  assert.equal(
    upgradedCost.totalCost,
    upgradedCost.assemblyCosts.reduce((sum, item) => sum + item.assembly.totalCost, 0)
  );

  const candidate = createCandidateFromDraft(baseline, draft, {
    candidateId: "specimen-a1-dignity-3x3",
    candidateName: "Dignity Native Homes (A1 Candidate)",
  }).candidate;

  assert.equal(candidate.parentSpecimenId, baseline.id);
  assert.equal(candidate.createdFromDraft, true);
  assert.deepEqual(baseline, baselineSnapshot);

  const stored = serializeCandidateWorkspace(baseline.id, [candidate]);
  const reloaded = parseCandidateWorkspace(stored, baseline.id);
  assert.deepEqual(reloaded.errors, []);
  assert.deepEqual(reloaded.candidates, [candidate]);

  const revalidated = validateCatalog(
    products,
    assemblies,
    rates,
    [baseline, reloaded.candidates[0]],
    upgrades
  );
  assert.equal(revalidated.valid, true, revalidated.errors.join("\n"));
});
