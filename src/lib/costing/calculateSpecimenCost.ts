import type {
  Assembly,
  AssemblyQuantityOverride,
  CostRate,
  CostRateOverride,
  Product,
  Specimen,
  SpecimenCostResult,
} from "@/types/rpe";
import { calculateAssemblyCost } from "./calculateAssemblyCost";
import { roundMoney } from "./rounding";

interface CalculateSpecimenCostOptions {
  overrides?: CostRateOverride[];
  quantityOverrides?: AssemblyQuantityOverride[];
  currency?: string;
}

export function calculateSpecimenCost(
  specimen: Specimen,
  assemblies: Assembly[],
  products: Product[],
  rates: CostRate[],
  options: CalculateSpecimenCostOptions = {}
): SpecimenCostResult {
  const assembliesById = new Map(assemblies.map((assembly) => [assembly.id, assembly]));

  const selectedAssemblyIds = new Set(Object.values(specimen.assemblySelections));
  for (const override of options.quantityOverrides ?? []) {
    if (!selectedAssemblyIds.has(override.assemblyId)) {
      throw new Error(
        `Quantity override references assembly ${override.assemblyId} that is not selected by specimen ${specimen.id}`
      );
    }
  }

  const assemblyCosts = Object.entries(specimen.assemblySelections).map(([slot, assemblyId]) => {
    const assembly = assembliesById.get(assemblyId);
    if (!assembly) {
      throw new Error(`Specimen ${specimen.id} references missing assembly ${assemblyId} in slot ${slot}`);
    }

    if (assembly.category !== slot) {
      throw new Error(
        `Specimen ${specimen.id} assigns assembly ${assemblyId} category ${assembly.category} to incompatible slot ${slot}`
      );
    }

    return {
      slot,
      assembly: calculateAssemblyCost(assembly, products, rates, options),
    };
  });

  const materialSubtotal = roundMoney(
    assemblyCosts.reduce((sum, item) => sum + item.assembly.materialSubtotal, 0)
  );
  const laborSubtotal = roundMoney(
    assemblyCosts.reduce((sum, item) => sum + item.assembly.laborCost, 0)
  );
  const equipmentSubtotal = roundMoney(
    assemblyCosts.reduce((sum, item) => sum + item.assembly.equipmentCost, 0)
  );
  const installationSubtotal = roundMoney(
    assemblyCosts.reduce((sum, item) => sum + item.assembly.installationCost, 0)
  );
  const totalCost = roundMoney(
    materialSubtotal + laborSubtotal + equipmentSubtotal + installationSubtotal
  );

  return {
    specimenId: specimen.id,
    assemblyCosts,
    materialSubtotal,
    laborSubtotal,
    equipmentSubtotal,
    installationSubtotal,
    totalCost,
    currency: options.currency ?? "PHP",
  };
}
