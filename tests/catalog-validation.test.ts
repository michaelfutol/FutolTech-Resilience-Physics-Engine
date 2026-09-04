import test from "node:test";
import assert from "node:assert/strict";

import productsData from "../data/products.sample.json";
import assembliesData from "../data/assemblies.sample.json";
import ratesData from "../data/cost-rates.sample.json";
import specimensData from "../data/specimens.sample.json";
import { validateCatalog } from "../src/lib/catalog/validateReferences";
import type { Assembly, CostRate, Product, Specimen } from "../src/types/rpe";

const products = productsData as Product[];
const assemblies = assembliesData as Assembly[];
const rates = ratesData as CostRate[];
const specimens = specimensData as Specimen[];

test("curated Phase 2A catalog is internally valid", () => {
  const result = validateCatalog(products, assemblies, rates, specimens);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
});

test("validator rejects duplicate IDs and missing references", () => {
  const duplicateProducts = [...products, { ...products[0] }];
  const badAssemblies: Assembly[] = [
    ...assemblies,
    {
      ...assemblies[0],
      id: "asm-bad-missing-product",
      components: [
        {
          productId: "prod-does-not-exist",
          quantity: 1,
          unit: "piece",
          wastePercent: 0,
          role: "test",
        },
      ],
    },
  ];

  const result = validateCatalog(duplicateProducts, badAssemblies, rates, specimens);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("Duplicate Product ID")));
  assert.ok(result.errors.some((error) => error.includes("references missing Product ID")));
});

test("validator rejects invalid parent specimen and incompatible assembly slot", () => {
  const badSpecimen: Specimen = {
    ...specimens[0],
    id: "specimen-invalid-child",
    parentSpecimenId: "specimen-missing-parent",
    assemblySelections: {
      ...specimens[0].assemblySelections,
      roof: "asm-frame-25",
    },
  };

  const result = validateCatalog(products, assemblies, rates, [...specimens, badSpecimen]);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("references missing parent specimen")));
  assert.ok(result.errors.some((error) => error.includes("incompatible slot roof")));
});

test("validator rejects negative rates, malformed dates, and invalid waste", () => {
  const badRates: CostRate[] = [
    ...rates,
    {
      ...rates[0],
      id: "rate-invalid",
      unitRate: -1,
      effectiveDate: "2026-02-31",
    },
  ];

  const badAssemblies: Assembly[] = assemblies.map((assembly, index) =>
    index === 0
      ? {
          ...assembly,
          components: assembly.components.map((component, componentIndex) =>
            componentIndex === 0 ? { ...component, wastePercent: 1.1 } : component
          ),
        }
      : assembly
  );

  const result = validateCatalog(products, badAssemblies, badRates, specimens);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("negative unit rate")));
  assert.ok(result.errors.some((error) => error.includes("invalid effective date")));
  assert.ok(result.errors.some((error) => error.includes("invalid wastePercent")));
});
