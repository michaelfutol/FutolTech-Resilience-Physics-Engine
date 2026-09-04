import type {
  Assembly,
  AssemblyCostResult,
  AssemblyQuantityOverride,
  CostRate,
  CostRateOverride,
  Product,
} from "@/types/rpe";
import { roundMoney, roundQuantity } from "./rounding";

interface CalculateAssemblyCostOptions {
  overrides?: CostRateOverride[];
  quantityOverrides?: AssemblyQuantityOverride[];
  currency?: string;
}

function selectRate(
  referenceId: string,
  rates: CostRate[],
  currency: string
): CostRate | undefined {
  return rates
    .filter(
      (rate) =>
        rate.referenceId === referenceId &&
        rate.rateType !== "user_override" &&
        rate.currency === currency
    )
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

  const relevantQuantityOverrides = (options.quantityOverrides ?? []).filter(
    (override) => override.assemblyId === assembly.id
  );
  const quantityOverridesByComponent = new Map<number, AssemblyQuantityOverride>();

  for (const override of relevantQuantityOverrides) {
    if (
      !Number.isInteger(override.componentIndex) ||
      override.componentIndex < 0 ||
      override.componentIndex >= assembly.components.length
    ) {
      throw new Error(
        `Quantity override for assembly ${assembly.id} has invalid component index ${override.componentIndex}`
      );
    }
    if (!Number.isFinite(override.quantity) || override.quantity < 0) {
      throw new Error(
        `Quantity override for assembly ${assembly.id} component ${override.componentIndex} must be a finite non-negative number`
      );
    }
    if (quantityOverridesByComponent.has(override.componentIndex)) {
      throw new Error(
        `Duplicate quantity override for assembly ${assembly.id} component ${override.componentIndex}`
      );
    }
    quantityOverridesByComponent.set(override.componentIndex, override);
  }

  const currency = options.currency ?? "PHP";
  if (!currency.trim()) throw new Error("Costing currency cannot be empty");

  const components = assembly.components.map((component, componentIndex) => {
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
    const quantityOverride = quantityOverridesByComponent.get(componentIndex);
    const selectedRate = selectRate(component.productId, rates, currency);

    if (!override && !selectedRate) {
      throw new Error(
        `No cost rate found for product ${component.productId} in currency ${currency}`
      );
    }

    if (override && (!Number.isFinite(override.unitRate) || override.unitRate < 0)) {
      throw new Error(
        `User override for ${component.productId} must be a finite non-negative number`
      );
    }

    if (
      selectedRate &&
      (!Number.isFinite(selectedRate.unitRate) || selectedRate.unitRate < 0)
    ) {
      throw new Error(`Selected cost rate ${selectedRate.id} has invalid unit rate`);
    }

    const unitRate = override?.unitRate ?? selectedRate!.unitRate;
    const libraryQuantity = component.quantity;
    const baseQuantity = quantityOverride?.quantity ?? libraryQuantity;
    const quantityWithWaste = roundQuantity(
      baseQuantity * (1 + component.wastePercent)
    );
    const materialCost = roundMoney(quantityWithWaste * unitRate);

    return {
      componentIndex,
      productId: product.id,
      productName: product.name,
      role: component.role,
      unit: component.unit,
      libraryQuantity,
      baseQuantity,
      quantityOverrideApplied: Boolean(quantityOverride),
      quantityOverrideSourceNote: quantityOverride
        ? quantityOverride.sourceNote?.trim() || "User quantity override"
        : null,
      wastePercent: component.wastePercent,
      quantityWithWaste,
      unitRate,
      currency,
      materialCost,
      rateType: override ? ("user_override" as const) : selectedRate!.rateType,
      rateId: override ? null : selectedRate!.id,
      sourceNote: override
        ? override.sourceNote?.trim() || "User override"
        : selectedRate!.sourceNote,
    };
  });

  const materialSubtotal = roundMoney(
    components.reduce((sum, component) => sum + component.materialCost, 0)
  );
  const laborCost = roundMoney(assembly.allowances.labor);
  const equipmentCost = roundMoney(assembly.allowances.equipment);
  const installationCost = roundMoney(assembly.allowances.installation);
  const totalCost = roundMoney(
    materialSubtotal + laborCost + equipmentCost + installationCost
  );

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
