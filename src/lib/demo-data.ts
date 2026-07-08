import specimensData from "../../data/specimens.sample.json";
import materialsData from "../../data/materials.sample.json";
import hazardsData from "../../data/hazards.sample.json";
import failureEventsData from "../../data/failure-events.sample.json";
import costItemsData from "../../data/cost-items.sample.json";
import upgradesData from "../../data/upgrades.sample.json";
import runModesData from "../../data/run-modes.sample.json";
import upgradeRulesData from "../../data/upgrade-rules.sample.json";

import { Specimen, Material, Hazards, FailureEvent, CostItem, UpgradeOption, RunMode, UpgradeRule } from "@/types/rpe";

export const getSpecimens = (): Specimen[] => specimensData as Specimen[];
export const getMaterials = (): Material[] => materialsData as Material[];
export const getHazards = (): Hazards => hazardsData as Hazards;
export const getFailureEvents = (): FailureEvent[] => failureEventsData as FailureEvent[];
export const getCostItems = (): CostItem[] => costItemsData as CostItem[];
export const getUpgrades = (): UpgradeOption[] => upgradesData as UpgradeOption[];
export const getRunModes = (): RunMode[] => runModesData as RunMode[];
export const getUpgradeRules = (): UpgradeRule[] => upgradeRulesData as UpgradeRule[];

// A helper to get the "Demo 01" specimen
export const getDemoSpecimen = (): Specimen | undefined => {
  return getSpecimens().find((s) => s.id === "A0");
};
