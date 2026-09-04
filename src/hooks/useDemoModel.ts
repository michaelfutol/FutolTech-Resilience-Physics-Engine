import { useEffect, useMemo, useState } from "react";
import {
  getAssemblies,
  getCostRates,
  getDemoSpecimen,
  getFailureEvents,
  getHazards,
  getProducts,
  getRunModes,
  getUpgradeDefinitions,
  validateDemoCatalog,
} from "@/lib/demo-data";
import { calculateSpecimenCost } from "@/lib/costing/calculateSpecimenCost";
import {
  applyUpgradeDefinition,
  createCandidateFromDraft,
  createSpecimenDraft,
  diffSpecimenDraft,
  setDraftAssembly,
  type SpecimenDraft,
} from "@/lib/prototypes/specimenDraft";
import type {
  Assembly,
  AssemblyQuantityOverride,
  CostRate,
  CostRateOverride,
  FailureEvent,
  Hazards,
  Product,
  RunMode,
  RunSettings,
  Specimen,
  UpgradeDefinition,
} from "@/types/rpe";

export function useDemoModel() {
  const [specimen] = useState<Specimen | null>(() => getDemoSpecimen() || null);

  // Phase 2 source libraries remain immutable in UI state.
  const [products] = useState<Product[]>(getProducts());
  const [assemblies] = useState<Assembly[]>(getAssemblies());
  const [costRates] = useState<CostRate[]>(getCostRates());
  const [upgradeDefinitions] = useState<UpgradeDefinition[]>(getUpgradeDefinitions());
  const [catalogValidation] = useState(() => validateDemoCatalog());

  // Temporary structural draft. The baseline specimen above is never mutated.
  const [draft, setDraft] = useState<SpecimenDraft | null>(() => {
    const baseline = getDemoSpecimen();
    return baseline ? createSpecimenDraft(baseline) : null;
  });
  const [createdCandidate, setCreatedCandidate] = useState<Specimen | null>(null);
  const [candidateSequence, setCandidateSequence] = useState(1);

  // Cost/procurement context is intentionally separate from specimen ancestry.
  const [costRateOverrides, setCostRateOverrides] = useState<CostRateOverride[]>([]);
  const [quantityOverrides, setQuantityOverrides] = useState<AssemblyQuantityOverride[]>([]);

  const [hazards] = useState<Hazards>(getHazards());
  const [activeHazard, setActiveHazard] = useState<string>("typhoon_index_300");
  const [failureEvents] = useState<FailureEvent[]>(getFailureEvents());

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
      quantityOverrides,
    });
  }, [
    draftSpecimen,
    assemblies,
    products,
    costRates,
    costRateOverrides,
    quantityOverrides,
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
  const draftHasCostOverrides =
    costRateOverrides.length > 0 || quantityOverrides.length > 0;

  const updateDraftAssembly = (slot: string, assemblyId: string) => {
    const assembly = assemblies.find((item) => item.id === assemblyId);
    if (!assembly) throw new Error(`Cannot select missing assembly ${assemblyId}`);
    if (assembly.category !== slot) {
      throw new Error(
        `Cannot assign ${assembly.id} category ${assembly.category} to draft slot ${slot}`
      );
    }

    const previousAssemblyId = draft?.assemblySelections[slot];
    setDraft((previous) => {
      if (!previous) return previous;
      const manuallyEdited = setDraftAssembly(previous, slot, assemblyId);
      const invalidatedUpgradeIds = new Set(
        upgradeDefinitions
          .filter((definition) =>
            definition.assemblyChanges.some((change) => change.slot === slot)
          )
          .map((definition) => definition.id)
      );
      return {
        ...manuallyEdited,
        appliedUpgradeIds: manuallyEdited.appliedUpgradeIds.filter(
          (id) => !invalidatedUpgradeIds.has(id)
        ),
      };
    });

    if (previousAssemblyId && previousAssemblyId !== assemblyId) {
      setQuantityOverrides((previous) =>
        previous.filter((override) => override.assemblyId !== previousAssemblyId)
      );
    }
    setCreatedCandidate(null);
  };

  const applyUpgrade = (upgradeId: string) => {
    if (!specimen || !draft) return;
    const upgrade = upgradeDefinitions.find((item) => item.id === upgradeId);
    if (!upgrade) throw new Error(`Cannot apply missing upgrade ${upgradeId}`);

    const result = applyUpgradeDefinition(
      specimen,
      draft,
      upgrade,
      upgradeDefinitions
    );
    const selectedAssemblyIds = new Set(Object.values(result.draft.assemblySelections));

    setDraft(result.draft);
    setQuantityOverrides((previous) =>
      previous.filter((override) => selectedAssemblyIds.has(override.assemblyId))
    );
    setCreatedCandidate(null);
  };

  const updateCostRateOverride = (referenceId: string, unitRate: number | null) => {
    if (!referenceId.trim()) {
      throw new Error("Cost-rate override reference cannot be empty");
    }

    if (unitRate === null) {
      setCostRateOverrides((previous) =>
        previous.filter((override) => override.referenceId !== referenceId)
      );
      return;
    }

    if (!Number.isFinite(unitRate) || unitRate < 0) {
      throw new Error(
        `Cost-rate override for ${referenceId} must be a finite non-negative number`
      );
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
  };

  const updateQuantityOverride = (
    assemblyId: string,
    componentIndex: number,
    quantity: number | null
  ) => {
    const assembly = assemblies.find((item) => item.id === assemblyId);
    if (!assembly) {
      throw new Error(`Cannot override quantity for missing assembly ${assemblyId}`);
    }
    if (
      !Number.isInteger(componentIndex) ||
      componentIndex < 0 ||
      componentIndex >= assembly.components.length
    ) {
      throw new Error(
        `Cannot override quantity for invalid component index ${componentIndex} in ${assemblyId}`
      );
    }

    if (quantity === null) {
      setQuantityOverrides((previous) =>
        previous.filter(
          (override) =>
            !(
              override.assemblyId === assemblyId &&
              override.componentIndex === componentIndex
            )
        )
      );
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      throw new Error(
        `Quantity override for ${assemblyId} component ${componentIndex} must be a finite non-negative number`
      );
    }

    setQuantityOverrides((previous) => {
      const nextOverride: AssemblyQuantityOverride = {
        assemblyId,
        componentIndex,
        quantity,
        sourceNote: "User quantity override",
      };
      const existingIndex = previous.findIndex(
        (override) =>
          override.assemblyId === assemblyId &&
          override.componentIndex === componentIndex
      );
      if (existingIndex === -1) return [...previous, nextOverride];

      return previous.map((override, index) =>
        index === existingIndex ? nextOverride : override
      );
    });
  };

  const clearCostContextOverrides = () => {
    setCostRateOverrides([]);
    setQuantityOverrides([]);
  };

  const resetDraft = () => {
    if (!specimen) return;
    setDraft(createSpecimenDraft(specimen));
    setCostRateOverrides([]);
    setQuantityOverrides([]);
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

  // Simulation State — still scripted Phase 1 playback, not calculated mechanics.
  const [simulationStatus, setSimulationStatus] = useState<
    "idle" | "running" | "complete"
  >("idle");
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
        if (
          nextIndex < failureEvents.length &&
          timeString >= failureEvents[nextIndex].time
        ) {
          setActiveFailureEvent(failureEvents[nextIndex]);
          return nextIndex;
        }
        return prevIndex;
      });

      if (
        runSettings.mode === "fixed_duration" &&
        currentSeconds >= runSettings.durationSeconds
      ) {
        clearInterval(interval);
        setSimulationStatus("complete");
      } else if (currentSeconds >= 300) {
        clearInterval(interval);
        setSimulationStatus("complete");
      }
    }, 150);

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

  const recommendedUpgradeDefinitions = useMemo(() => {
    if (!activeFailureEvent) return [];
    return upgradeDefinitions.filter((definition) =>
      definition.targetFailureTypes.includes(activeFailureEvent.type)
    );
  }, [activeFailureEvent, upgradeDefinitions]);

  return {
    specimen,
    products,
    assemblies,
    costRates,
    upgradeDefinitions,
    recommendedUpgradeDefinitions,
    catalogValidation,
    draft,
    draftSpecimen,
    draftDiff,
    draftHasChanges,
    draftHasCostOverrides,
    costRateOverrides,
    quantityOverrides,
    baselineCost,
    draftCost,
    updateDraftAssembly,
    applyUpgrade,
    updateCostRateOverride,
    updateQuantityOverride,
    clearCostContextOverrides,
    resetDraft,
    createCandidate,
    createdCandidate,
    hazards,
    activeHazard,
    setActiveHazard,
    failureEvents,
    runModes,
    runSettings,
    setRunSettings,
    simulationStatus,
    activeEventIndex,
    elapsedTime,
    activeFailureEvent,
    startSimulation,
    resetSimulation,
  };
}
