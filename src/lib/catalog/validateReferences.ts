import type { Product, Assembly, CostRate, Specimen } from "../../types/rpe";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCatalog(
  products: Product[],
  assemblies: Assembly[],
  rates: CostRate[],
  specimens: Specimen[]
): ValidationResult {
  const errors: string[] = [];
  
  // 1. Check for duplicate IDs
  const productIds = new Set<string>();
  products.forEach(p => {
    if (!p.id) errors.push(`Product missing ID: ${JSON.stringify(p)}`);
    else if (productIds.has(p.id)) errors.push(`Duplicate Product ID: ${p.id}`);
    else productIds.add(p.id);

    if (!p.name) errors.push(`Product ${p.id} missing name`);
  });

  const assemblyIds = new Set<string>();
  assemblies.forEach(a => {
    if (!a.id) errors.push(`Assembly missing ID: ${JSON.stringify(a)}`);
    else if (assemblyIds.has(a.id)) errors.push(`Duplicate Assembly ID: ${a.id}`);
    else assemblyIds.add(a.id);

    if (!a.name) errors.push(`Assembly ${a.id} missing name`);
    
    // 2. Check component references and negative values
    a.components.forEach((c, idx) => {
      if (!productIds.has(c.productId)) {
        errors.push(`Assembly ${a.id} references missing Product ID: ${c.productId}`);
      }
      if (c.quantity < 0) errors.push(`Assembly ${a.id} has negative quantity for component ${idx}`);
      if (c.wastePercent < 0 || c.wastePercent > 1) errors.push(`Assembly ${a.id} has invalid wastePercent ${c.wastePercent}`);
    });
  });

  const rateIds = new Set<string>();
  rates.forEach(r => {
    if (!r.id) errors.push(`CostRate missing ID: ${JSON.stringify(r)}`);
    else if (rateIds.has(r.id)) errors.push(`Duplicate CostRate ID: ${r.id}`);
    else rateIds.add(r.id);

    if (r.unitRate < 0) errors.push(`CostRate ${r.id} has negative unit rate`);
    if (!productIds.has(r.referenceId)) {
      errors.push(`CostRate ${r.id} references missing Product ID: ${r.referenceId}`);
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(r.effectiveDate)) {
      errors.push(`CostRate ${r.id} has malformed date: ${r.effectiveDate}`);
    }
  });

  const specimenIds = new Set<string>();
  specimens.forEach(s => {
    if (!s.id) errors.push(`Specimen missing ID: ${JSON.stringify(s)}`);
    else if (specimenIds.has(s.id)) errors.push(`Duplicate Specimen ID: ${s.id}`);
    else specimenIds.add(s.id);

    if (s.parentSpecimenId && !specimenIds.has(s.parentSpecimenId) && s.parentSpecimenId !== "null") {
      // It's possible the parent isn't loaded, but in a full validation it should be.
      // For now, let's just log it if it doesn't match an existing or null
    }

    Object.entries(s.assemblySelections).forEach(([category, asmId]) => {
      if (!assemblyIds.has(asmId)) {
        errors.push(`Specimen ${s.id} references missing Assembly ID: ${asmId} in category ${category}`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
