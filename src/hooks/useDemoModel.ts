import { useEffect, useMemo, useState } from "react";
import {
  getAssemblies,
  getCostItems,
  getCostRates,
  getDemoSpecimen,
  getFailureEvents,
  getHazards,
  getMaterials,
  getProducts,
  getRunModes,
  getUpgradeRules,
  getUpgrades,
  validateDemoCatalog,
} from "@/lib/demo-data";
import { calculateSpecimenCost } from "@/lib/costing/calculateSpecimenCost";
import {
  createCandidateFromDraft,
  createSpecimenDraft,
  diffSpecimenDraft,
  setDraftAssembly,
  type SpecimenDraft,
} from "@/lib/prototypes/specimenDraft";
import type {
  Assembly,
  CostItem,
  CostRate,
  CostRateOverride,
  FailureEvent,
  Hazards,
  Material,
  Product,
  PrototypeRecommendation,
  RunMode,
  RunSettings,
  Specimen,
  UpgradeOption,
  UpgradeRule,
} from "@/types/rpe";

export function useDemoModel() {
  const [specimen] = useState<Specimen | null>(() => getDemoSpecimen() || null);

  // Phase 2 catalog/data spine. These are source-library records and remain immutable in UI state.
  const [products] = useState<Product[]>(getProducts());
  const [assemblies] = useState<Assembly[]>(getAssemblies());
  const [costRates] = useState<CostRate[]>(getCostRates());
  const [catalogValidation] = useState(() => validateDemoCatalog());

  // Temporary editable draft. The baseline specimen above is never mutated.
  const [draft, setDraft] = useState<SpecimenDraft | null>(() => {
    const baseline = getDemoSpecimen();
    return baseline ? createSpecimenDraft(baseline) : null;
  });
  const [createdCandidate, setCreatedCandidate] = useState<Specimen | null>(null);
  const [candidateSequence, setCandidateSequence] = useState(1);
  const [costRateOverrides, setCostRateOverrides] = useState<CostRateOverride[]>([]);

  // Legacy Phase 1 data retained until Phase 2D UI migration is complete.
  const [materials] = useState<Material[]>(getMaterials());
  const [hazards] = useState<Hazards>(getHazards());
  const [activeHazard, setActiveHazard] = useState<string>("typhoon_index_300");
  const [failureEvents] = useState<FailureEvent[]>(getFailureEvents());
  const [costItems] = useState<CostItem[]>(getCostItems());
  const [availableUpgrades] = useState<UpgradeOption[]>(getUpgrades());
  const [selectedUpgradeIds, setSelectedUpgradeIds] = useState<string[]>([]);

  const baselineCost = useMemo(() => {
    if (!specimen || !catalogValidation.valid) return null;
    return calculateSpecimenCost(specimen, assemblies, products, costRates);
  }, [specimen, assemblies, products, costRates, catalogValidation.valid]);

  const draftSpecimen = useMemo<Specimen | null>(() => {
    if (!specimen || !draft) return null;
    return {
      ...specimen,
      assemblySelections: { ...draft.assemblySelections },
      appliedUpgradeIds: [...draft.appliedUpgradeIds],
      notes: draft.notes,
    };
  }, [specimen, draft]);

  const draftCost = useMemo(() => {
    if (!draftSpecimen || !catalogValidation.valid) return null;
    return calculateSpecimenCost(draftSpecimen, assemblies, products, costRates, {
      overrides: costRateOverrides,
    });
  }, [
    draftSpecimen,
    assemblies,
    products,
    costRates,
    costRateOverrides,
    catalogValidation.valid,
  ]);

  const draftDiff = useMemo(() => {
    if (!specimen || !draft) return null;
    return diffSpecimenDraft(specimen, draft);
  }, [specimen, draft]);

  const draftHasChanges = Boolean(
    draftDiff &&
      (draftDiff.assemblyChanges.length > 0 ||
        draftDiff.addedUpgradeIds.length > 0 ||
        draftDiff.removedUpgradeIds.length > 0)
  );
  const draftHasCostOverrides = costRateOverrides.length > 0;

  const updateDraftAssembly = (slot: string, assemblyId: string) => {
    const assembly = assemblies.find((item) => item.id === assemblyId);
    if (!assembly) {
      throw new Error(`Cannot select missing assembly ${assemblyId}`);
    }
    if (assembly.category !== slot) {
      throw new Error(
        `Cannot assign ${assembly.id} category ${assembly.category} to draft slot ${slot}`
      );
    }

    setDraft((previous) =>
      previous ? setDraftAssembly(previous, slot, assemblyId) : previous
    );
    // The previously created session candidate remains historically valid, but
    // a new edit means the current draft is no longer represented by it.
    setCreatedCandidate(null);
  };

  const updateCostRateOverride = (referenceId: string, unitRate: number | null) => {
    if (!referenceId.trim()) throw new Error("Cost-rate override reference cannot be empty");

    if (unitRate === null) {
      setCostRateOverrides((previous) =>
        previous.filter((override) => override.referenceId !== referenceId)
      );
      return;
    }

    if (!Number.isFinite(unitRate) || unitRate < 0) {
      throw new Error(`Cost-rate override for ${referenceId} must be a finite non-negative number`);
    }

    setCostRateOverrides((previous) => {
      const nextOverride: CostRateOverride = {
        referenceId,
        unitRate,
        sourceNote: "User local override",
      };
      const existingIndex = previous.findIndex(
        (override) => override.referenceId === referenceId
      );
      if (existingIndex === -1) return [...previous, nextOverride];

      return previous.map((override, index) =>
        index === existingIndex ? nextOverride : override
      );
    });
    setCreatedCandidate(null);
  };

  const clearCostRateOverrides = () => {
    setCostRateOverrides([]);
    setCreatedCandidate(null);
  };

  const resetDraft = () => {
    if (!specimen) return;
    setDraft(createSpecimenDraft(specimen));
    setCostRateOverrides([]);
    setCreatedCandidate(null);
  };

  const createCandidate = () => {
    if (!specimen || !draft || !draftHasChanges || createdCandidate) return;

    const candidateId = `specimen-a${candidateSequence}-dignity-3x3`;
    const result = createCandidateFromDraft(specimen, draft, {
      candidateId,
      candidateName: `Dignity Native Homes (A${candidateSequence} Candidate)`,
      verificationStatus: "unverified",
    });

    setCreatedCandidate(result.candidate);
    setCandidateSequence((previous) => previous + 1);
  };

  // Simulation Settings
  const [runModes] = useState<RunMode[]>(getRunModes());
  const [runSettings, setRunSettings] = useState<RunSettings>({
    mode: "fixed_duration",
    durationSeconds: 30,
    stopAtFirstCriticalFailure: false,
  });

  // Simulation State
  const [simulationStatus, setSimulationStatus] = useState<"idle" | "running" | "complete">("idle");
  const [activeEventIndex, setActiveEventIndex] = useState<number>(-1);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [activeFailureEvent, setActiveFailureEvent] = useState<FailureEvent | null>(null);

  useEffect(() => {
    if (simulationStatus !== "running") return;

    let currentSeconds = 0;
    const interval = setInterval(() => {
      currentSeconds++;

      const mm = String(Math.floor(currentSeconds / 60)).padStart(2, "0");
      const ss = String(currentSeconds % 60).padStart(2, "0");
      const timeString = `${mm}:${ss}`;
      setElapsedTime(timeString);

      setActiveEventIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < failureEvents.length && timeString >= failureEvents[nextIndex].time) {
          setActiveFailureEvent(failureEvents[nextIndex]);
          return nextIndex;
        }
        return prevIndex;
      });

      if (runSettings.mode === "fixed_duration" && currentSeconds >= runSettings.durationSeconds) {
        clearInterval(interval);
        setSimulationStatus("complete");
      } else if (currentSeconds >= 300) {
        // Safety fallback for long or infinite placeholder modes.
        clearInterval(interval);
        setSimulationStatus("complete");
      }
    }, 150); // Fast-forward scripted Phase 1 playback (150ms real = 1s simulation)

    return () => clearInterval(interval);
  }, [simulationStatus, failureEvents, runSettings]);

  const startSimulation = () => {
    setSimulationStatus("running");
    setActiveEventIndex(-1);
    setActiveFailureEvent(null);
    setElapsedTime("00:00");
  };

  const resetSimulation = () => {
    setSimulationStatus("idle");
    setActiveEventIndex(-1);
    setActiveFailureEvent(null);
    setElapsedTime("00:00");
  };

  const toggleUpgrade = (id: string) => {
    setSelectedUpgradeIds((prev) =>
      prev.includes(id) ? prev.filter((upgradeId) => upgradeId !== id) : [...prev, id]
    );
  };

  const getRecommendation = (): PrototypeRecommendation | null => {
    if (simulationStatus !== "complete" || !activeFailureEvent || !specimen) return null;

    const rules = getUpgradeRules();
    const matchedRule = rules.find(
      (rule: UpgradeRule) => rule.failureType === activeFailureEvent.type
    );

    if (matchedRule) {
      return {
        currentSpecimenId: specimen.id,
        nextSpecimenId: matchedRule.nextSpecimenId,
        reason: `Rule match for ${activeFailureEvent.type}`,
        recommendedUpgrades: matchedRule.recommendedUpgrades,
        estimatedAddedCostPhp: 0,
        notes: [],
      };
    }

    return null;
  };

  return {
    specimen,
    products,
    assemblies,
    costRates,
    catalogValidation,
    draft,
    draftSpecimen,
    draftDiff,
    draftHasChanges,
    draftHasCostOverrides,
    costRateOverrides,
    baselineCost,
    draftCost,
    updateDraftAssembly,
    updateCostRateOverride,
    clearCostRateOverrides,
    resetDraft,
    createCandidate,
    createdCandidate,
    materials,
    hazards,
    activeHazard,
    setActiveHazard,
    failureEvents,
    costItems,
    availableUpgrades,
    selectedUpgradeIds,
    toggleUpgrade,
    runModes,
    runSettings,
    setRunSettings,
    recommendation: getRecommendation(),
    simulationStatus,
    activeEventIndex,
    elapsedTime,
    activeFailureEvent,
    startSimulation,
    resetSimulation,
  };
}
