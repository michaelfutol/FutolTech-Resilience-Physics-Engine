import specimensData from "../../data/specimens.sample.json";
import materialsData from "../../data/materials.sample.json";
import hazardsData from "../../data/hazards.sample.json";
import failureEventsData from "../../data/failure-events.sample.json";
import costItemsData from "../../data/cost-items.sample.json";
import upgradesData from "../../data/upgrades.sample.json";

import { Specimen, Material, Hazards, FailureEvent, CostItem, UpgradeOption } from "@/types/rpe";

export const getSpecimens = (): Specimen[] => specimensData as Specimen[];
export const getMaterials = (): Material[] => materialsData as Material[];
export const getHazards = (): Hazards => hazardsData as Hazards;
export const getFailureEvents = (): FailureEvent[] => failureEventsData as FailureEvent[];
export const getCostItems = (): CostItem[] => costItemsData as CostItem[];
export const getUpgrades = (): UpgradeOption[] => upgradesData as UpgradeOption[];

// A helper to get the "Demo 01" specimen
export const getDemoSpecimen = (): Specimen | undefined => {
  return getSpecimens().find((s) => s.id === "A0");
};
