import test from "node:test";
import assert from "node:assert/strict";

import productsData from "../data/products.sample.json";
import assembliesData from "../data/assemblies.sample.json";
import ratesData from "../data/cost-rates.sample.json";
import specimensData from "../data/specimens.sample.json";
import { calculateAssemblyCost } from "../src/lib/costing/calculateAssemblyCost";
import { calculateSpecimenCost } from "../src/lib/costing/calculateSpecimenCost";
import type { Assembly, CostRate, Product, Specimen } from "../src/types/rpe";

const products = productsData as Product[];
const assemblies = assembliesData as Assembly[];
const rates = ratesData as CostRate[];
const specimens = specimensData as Specimen[];

function getAssembly(id: string): Assembly {
  const assembly = assemblies.find((item) => item.id === id);
  assert.ok(assembly, `Missing test assembly ${id}`);
  return assembly;
}

test("assembly costing applies waste exactly once", () => {
  const result = calculateAssemblyCost(getAssembly("asm-frame-25"), products, rates);
  const component = result.components[0];

  assert.equal(component.baseQuantity, 36);
  assert.equal(component.wastePercent, 0.05);
  assert.equal(component.quantityWithWaste, 37.8);
  assert.equal(component.unitRate, 150);
  assert.equal(component.materialCost, 5670);
  assert.equal(result.materialSubtotal, 5670);
  assert.equal(result.laborCost, 1500);
  assert.equal(result.equipmentCost, 500);
  assert.equal(result.installationCost, 200);
  assert.equal(result.totalCost, 7870);
});

test("user rate override is non-destructive and traceable", () => {
  const originalRate = rates.find((rate) => rate.referenceId === "prod-tube-25");
  assert.ok(originalRate);

  const result = calculateAssemblyCost(getAssembly("asm-frame-25"), products, rates, {
    overrides: [
      {
        referenceId: "prod-tube-25",
        unitRate: 100,
        sourceNote: "Local test override",
      },
    ],
  });

  const component = result.components[0];
  assert.equal(component.unitRate, 100);
  assert.equal(component.materialCost, 3780);
  assert.equal(component.rateType, "user_override");
  assert.equal(component.rateId, null);
  assert.equal(component.sourceNote, "Local test override");
  assert.equal(originalRate.unitRate, 150);
});

test("A0 keeps wall backing and outer cladding as separate costed layers", () => {
  const specimen = specimens[0];
  assert.equal(specimen.assemblySelections.wall, "asm-wall-fcb-6mm");
  assert.equal(specimen.assemblySelections.cladding, "asm-clad-sawali");

  const result = calculateSpecimenCost(specimen, assemblies, products, rates);
  const slots = result.assemblyCosts.map((item) => item.slot);
  assert.ok(slots.includes("wall"));
  assert.ok(slots.includes("cladding"));
});

test("curated A0 specimen total equals the sum of its traceable subtotals", () => {
  const specimen = specimens[0];
  const result = calculateSpecimenCost(specimen, assemblies, products, rates);

  assert.equal(result.specimenId, "specimen-a0-dignity-3x3");
  assert.equal(result.materialSubtotal, 17410);
  assert.equal(result.laborSubtotal, 4100);
  assert.equal(result.equipmentSubtotal, 850);
  assert.equal(result.installationSubtotal, 450);
  assert.equal(result.totalCost, 22810);

  const itemizedTotal = result.assemblyCosts.reduce(
    (sum, item) => sum + item.assembly.totalCost,
    0
  );
  assert.equal(result.totalCost, itemizedTotal);
});

test("specimen costing is deterministic", () => {
  const first = calculateSpecimenCost(specimens[0], assemblies, products, rates);
  const second = calculateSpecimenCost(specimens[0], assemblies, products, rates);
  assert.deepEqual(second, first);
});

test("missing cost rates fail loudly instead of silently producing a partial total", () => {
  const ratesWithoutFrame = rates.filter((rate) => rate.referenceId !== "prod-tube-25");

  assert.throws(
    () => calculateAssemblyCost(getAssembly("asm-frame-25"), products, ratesWithoutFrame),
    /No cost rate found for product prod-tube-25/
  );
});
