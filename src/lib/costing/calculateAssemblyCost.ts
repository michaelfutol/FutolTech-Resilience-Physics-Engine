import type {
  Assembly,
  AssemblyCostResult,
  CostRate,
  CostRateOverride,
  Product,
} from "@/types/rpe";

interface CalculateAssemblyCostOptions {
  overrides?: CostRateOverride[];
  currency?: string;
}

function selectRate(referenceId: string, rates: CostRate[]): CostRate | undefined {
  return rates
    .filter((rate) => rate.referenceId === referenceId && rate.rateType !== "user_override")
    .sort((a, b) => {
      const dateCompare = b.effectiveDate.localeCompare(a.effectiveDate);
      if (dateCompare !== 0) return dateCompare;

      const priority: Record<CostRate["rateType"], number> = {
        supplier_quote: 2,
        library: 1,
        user_override: 0,
      };
      return priority[b.rateType] - priority[a.rateType];
    })[0];
}

export function calculateAssemblyCost(
  assembly: Assembly,
  products: Product[],
  rates: CostRate[],
  options: CalculateAssemblyCostOptions = {}
): AssemblyCostResult {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const overridesByReference = new Map(
    (options.overrides ?? []).map((override) => [override.referenceId, override])
  );

  const currency = options.currency ?? "PHP";

  const components = assembly.components.map((component) => {
    const product = productsById.get(component.productId);
    if (!product) {
      throw new Error(`Assembly ${assembly.id} references missing product ${component.productId}`);
    }

    if (product.unit !== component.unit) {
      throw new Error(
        `Assembly ${assembly.id} component ${component.productId} unit ${component.unit} does not match product unit ${product.unit}`
      );
    }

    const override = overridesByReference.get(component.productId);
    const selectedRate = selectRate(component.productId, rates);

    if (!override && !selectedRate) {
      throw new Error(`No cost rate found for product ${component.productId}`);
    }

    if (override && override.unitRate < 0) {
      throw new Error(`User override for ${component.productId} cannot be negative`);
    }

    const unitRate = override?.unitRate ?? selectedRate!.unitRate;
    const quantityWithWaste = component.quantity * (1 + component.wastePercent);
    const materialCost = quantityWithWaste * unitRate;

    return {
      productId: product.id,
      productName: product.name,
      role: component.role,
      unit: component.unit,
      baseQuantity: component.quantity,
      wastePercent: component.wastePercent,
      quantityWithWaste,
      unitRate,
      currency,
      materialCost,
      rateType: override ? ("user_override" as const) : selectedRate!.rateType,
      rateId: override ? null : selectedRate!.id,
      sourceNote: override?.sourceNote ?? selectedRate!.sourceNote,
    };
  });

  const materialSubtotal = components.reduce((sum, component) => sum + component.materialCost, 0);
  const laborCost = assembly.allowances.labor;
  const equipmentCost = assembly.allowances.equipment;
  const installationCost = assembly.allowances.installation;
  const totalCost = materialSubtotal + laborCost + equipmentCost + installationCost;

  return {
    assemblyId: assembly.id,
    assemblyName: assembly.name,
    components,
    materialSubtotal,
    laborCost,
    equipmentCost,
    installationCost,
    totalCost,
    currency,
  };
}
