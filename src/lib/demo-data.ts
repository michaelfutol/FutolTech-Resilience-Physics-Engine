import specimensData from "../../data/specimens.sample.json";
import productsData from "../../data/products.sample.json";
import assembliesData from "../../data/assemblies.sample.json";
import costRatesData from "../../data/cost-rates.sample.json";
import upgradeDefinitionsData from "../../data/upgrade-definitions.sample.json";
import materialsData from "../../data/materials.sample.json";
import hazardsData from "../../data/hazards.sample.json";
import failureEventsData from "../../data/failure-events.sample.json";
import costItemsData from "../../data/cost-items.sample.json";
import upgradesData from "../../data/upgrades.sample.json";
import runModesData from "../../data/run-modes.sample.json";
import upgradeRulesData from "../../data/upgrade-rules.sample.json";

import type {
  Assembly,
  CostItem,
  CostRate,
  FailureEvent,
  Hazards,
  Material,
  Product,
  RunMode,
  Specimen,
  UpgradeDefinition,
  UpgradeOption,
  UpgradeRule,
} from "@/types/rpe";
import { validateCatalog } from "@/lib/catalog/validateReferences";

export const getSpecimens = (): Specimen[] => specimensData as Specimen[];
export const getProducts = (): Product[] => productsData as Product[];
export const getAssemblies = (): Assembly[] => assembliesData as Assembly[];
export const getCostRates = (): CostRate[] => costRatesData as CostRate[];
export const getUpgradeDefinitions = (): UpgradeDefinition[] =>
  upgradeDefinitionsData as UpgradeDefinition[];

// Legacy Phase 1 data loaders retained until Phase 2D migration is complete.
export const getMaterials = (): Material[] => materialsData as Material[];
export const getHazards = (): Hazards => hazardsData as Hazards;
export const getFailureEvents = (): FailureEvent[] => failureEventsData as FailureEvent[];
export const getCostItems = (): CostItem[] => costItemsData as CostItem[];
export const getUpgrades = (): UpgradeOption[] => upgradesData as UpgradeOption[];
export const getRunModes = (): RunMode[] => runModesData as RunMode[];
export const getUpgradeRules = (): UpgradeRule[] => upgradeRulesData as UpgradeRule[];

export const validateDemoCatalog = () =>
  validateCatalog(
    getProducts(),
    getAssemblies(),
    getCostRates(),
    getSpecimens(),
    getUpgradeDefinitions()
  );

// Baseline specimen helper. Prefer the explicit Dignity A0 ID and retain a
// legacy fallback so older sample data does not silently break the UI.
export const getDemoSpecimen = (): Specimen | undefined => {
  const specimens = getSpecimens();
  return (
    specimens.find((specimen) => specimen.id === "specimen-a0-dignity-3x3") ??
    specimens.find((specimen) => specimen.id === "A0") ??
    specimens.find((specimen) => specimen.parentSpecimenId === null)
  );
};
