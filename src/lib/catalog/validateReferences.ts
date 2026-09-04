import type {
  Product,
  Assembly,
  CostRate,
  Specimen,
  UpgradeDefinition,
} from "../../types/rpe";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ALLOWED_UNITS = new Set([
  "length_m",
  "area_m2",
  "volume_m3",
  "mass_kg",
  "piece",
  "set",
  "lot",
]);

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateCatalog(
  products: Product[],
  assemblies: Assembly[],
  rates: CostRate[],
  specimens: Specimen[],
  upgrades: UpgradeDefinition[] = []
): ValidationResult {
  const errors: string[] = [];

  const productIds = new Set<string>();
  const assemblyIds = new Set<string>();
  const specimenIds = new Set<string>();
  const rateIds = new Set<string>();
  const upgradeIds = new Set<string>();

  // Collect IDs first so reference checks are not order-dependent.
  for (const product of products) {
    if (!product.id) errors.push(`Product missing ID: ${JSON.stringify(product)}`);
    else if (productIds.has(product.id)) errors.push(`Duplicate Product ID: ${product.id}`);
    else productIds.add(product.id);
  }

  for (const assembly of assemblies) {
    if (!assembly.id) errors.push(`Assembly missing ID: ${JSON.stringify(assembly)}`);
    else if (assemblyIds.has(assembly.id)) errors.push(`Duplicate Assembly ID: ${assembly.id}`);
    else assemblyIds.add(assembly.id);
  }

  for (const rate of rates) {
    if (!rate.id) errors.push(`CostRate missing ID: ${JSON.stringify(rate)}`);
    else if (rateIds.has(rate.id)) errors.push(`Duplicate CostRate ID: ${rate.id}`);
    else rateIds.add(rate.id);
  }

  for (const specimen of specimens) {
    if (!specimen.id) errors.push(`Specimen missing ID: ${JSON.stringify(specimen)}`);
    else if (specimenIds.has(specimen.id)) errors.push(`Duplicate Specimen ID: ${specimen.id}`);
    else specimenIds.add(specimen.id);
  }

  for (const upgrade of upgrades) {
    if (!upgrade.id) errors.push(`UpgradeDefinition missing ID: ${JSON.stringify(upgrade)}`);
    else if (upgradeIds.has(upgrade.id)) {
      errors.push(`Duplicate UpgradeDefinition ID: ${upgrade.id}`);
    } else {
      upgradeIds.add(upgrade.id);
    }
  }

  const productsById = new Map(products.filter((p) => p.id).map((p) => [p.id, p] as const));
  const assembliesById = new Map(assemblies.filter((a) => a.id).map((a) => [a.id, a] as const));

  for (const product of products) {
    if (!product.name?.trim()) errors.push(`Product ${product.id || "<missing>"} missing name`);
    if (!product.category?.trim()) errors.push(`Product ${product.id || "<missing>"} missing category`);
    if (!ALLOWED_UNITS.has(product.unit)) {
      errors.push(`Product ${product.id} uses unsupported unit: ${product.unit}`);
    }

    for (const [propertyName, value] of Object.entries(product.engineeringProperties ?? {})) {
      if (value !== null && value < 0) {
        errors.push(`Product ${product.id} has negative engineering property ${propertyName}: ${value}`);
      }
    }
  }

  for (const assembly of assemblies) {
    if (!assembly.name?.trim()) errors.push(`Assembly ${assembly.id || "<missing>"} missing name`);

    const allowances = assembly.allowances;
    if (allowances) {
      if (allowances.labor < 0) errors.push(`Assembly ${assembly.id} has negative labor allowance`);
      if (allowances.equipment < 0) errors.push(`Assembly ${assembly.id} has negative equipment allowance`);
      if (allowances.installation < 0) errors.push(`Assembly ${assembly.id} has negative installation allowance`);
    }

    assembly.components.forEach((component, index) => {
      const product = productsById.get(component.productId);
      if (!product) {
        errors.push(`Assembly ${assembly.id} references missing Product ID: ${component.productId}`);
      }

      if (component.quantity < 0) {
        errors.push(`Assembly ${assembly.id} has negative quantity for component ${index}`);
      }
      if (component.wastePercent < 0 || component.wastePercent > 1) {
        errors.push(`Assembly ${assembly.id} has invalid wastePercent ${component.wastePercent}`);
      }
      if (!ALLOWED_UNITS.has(component.unit)) {
        errors.push(`Assembly ${assembly.id} component ${index} uses unsupported unit: ${component.unit}`);
      }
      if (product && product.unit !== component.unit) {
        errors.push(
          `Assembly ${assembly.id} component ${index} unit ${component.unit} does not match Product ${product.id} unit ${product.unit}`
        );
      }
    });
  }

  for (const rate of rates) {
    if (rate.unitRate < 0) errors.push(`CostRate ${rate.id} has negative unit rate`);
    if (!productsById.has(rate.referenceId)) {
      errors.push(`CostRate ${rate.id} references missing Product ID: ${rate.referenceId}`);
    }
    if (!rate.currency?.trim()) errors.push(`CostRate ${rate.id} missing currency`);
    if (!rate.geographicArea?.trim()) errors.push(`CostRate ${rate.id} missing geographic area`);
    if (!rate.sourceNote?.trim()) errors.push(`CostRate ${rate.id} missing source note`);
    if (!isValidIsoDate(rate.effectiveDate)) {
      errors.push(`CostRate ${rate.id} has invalid effective date: ${rate.effectiveDate}`);
    }
  }

  for (const specimen of specimens) {
    if (!specimen.name?.trim()) errors.push(`Specimen ${specimen.id || "<missing>"} missing name`);

    if (specimen.parentSpecimenId) {
      if (specimen.parentSpecimenId === specimen.id) {
        errors.push(`Specimen ${specimen.id} cannot reference itself as parent`);
      } else if (!specimenIds.has(specimen.parentSpecimenId)) {
        errors.push(`Specimen ${specimen.id} references missing parent specimen: ${specimen.parentSpecimenId}`);
      }
    }

    Object.entries(specimen.assemblySelections).forEach(([category, assemblyId]) => {
      const assembly = assembliesById.get(assemblyId);
      if (!assembly) {
        errors.push(`Specimen ${specimen.id} references missing Assembly ID: ${assemblyId} in category ${category}`);
        return;
      }
      if (assembly.category !== category) {
        errors.push(
          `Specimen ${specimen.id} assigns Assembly ${assemblyId} category ${assembly.category} to incompatible slot ${category}`
        );
      }
    });
  }

  for (const upgrade of upgrades) {
    if (!upgrade.name?.trim()) {
      errors.push(`UpgradeDefinition ${upgrade.id || "<missing>"} missing name`);
    }
    if (upgrade.targetFailureTypes.length === 0) {
      errors.push(`UpgradeDefinition ${upgrade.id} has no target failure types`);
    }
    if (upgrade.status === "ready" && upgrade.assemblyChanges.length === 0) {
      errors.push(`Ready UpgradeDefinition ${upgrade.id} has no assembly changes`);
    }

    const seenSlots = new Set<string>();
    for (const change of upgrade.assemblyChanges) {
      if (seenSlots.has(change.slot)) {
        errors.push(`UpgradeDefinition ${upgrade.id} changes slot ${change.slot} more than once`);
      }
      seenSlots.add(change.slot);

      const assembly = assembliesById.get(change.assemblyId);
      if (!assembly) {
        errors.push(
          `UpgradeDefinition ${upgrade.id} references missing Assembly ID: ${change.assemblyId}`
        );
        continue;
      }
      if (assembly.category !== change.slot) {
        errors.push(
          `UpgradeDefinition ${upgrade.id} assigns Assembly ${change.assemblyId} category ${assembly.category} to incompatible slot ${change.slot}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
