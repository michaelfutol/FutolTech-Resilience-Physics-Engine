import { useState, useEffect } from "react";
import { getDemoSpecimen, getMaterials, getHazards, getFailureEvents, getCostItems, getUpgrades, getRunModes, getUpgradeRules } from "@/lib/demo-data";
import { Specimen, Material, Hazards, FailureEvent, CostItem, UpgradeOption, RunSettings, PrototypeRecommendation, RunMode, UpgradeRule } from "@/types/rpe";

export function useDemoModel() {
  const [specimen] = useState<Specimen | null>(getDemoSpecimen() || null);
  const [materials] = useState<Material[]>(getMaterials());
  const [hazards] = useState<Hazards>(getHazards());
  const [activeHazard, setActiveHazard] = useState<string>("typhoon_index_300");
  const [failureEvents] = useState<FailureEvent[]>(getFailureEvents());
  const [costItems] = useState<CostItem[]>(getCostItems());
  const [availableUpgrades] = useState<UpgradeOption[]>(getUpgrades());
  const [selectedUpgradeIds, setSelectedUpgradeIds] = useState<string[]>([]);

  // Simulation Settings
  const [runModes] = useState<RunMode[]>(getRunModes());
  const [runSettings, setRunSettings] = useState<RunSettings>({
    mode: "fixed_duration",
    durationSeconds: 30,
    stopAtFirstCriticalFailure: false
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
      } else if (currentSeconds >= 300) { // Safety fallback for long or infinite modes
        clearInterval(interval);
        setSimulationStatus("complete");
      }
    }, 150); // Fast-forward time (150ms real = 1s simulation)

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
    setSelectedUpgradeIds(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const getRecommendation = (): PrototypeRecommendation | null => {
    if (simulationStatus !== "complete" || !activeFailureEvent || !specimen) return null;

    const rules = getUpgradeRules();
    const matchedRule = rules.find((r: UpgradeRule) => r.failureType === activeFailureEvent.type);

    if (matchedRule) {
      return {
        currentSpecimenId: specimen.id,
        nextSpecimenId: matchedRule.nextSpecimenId,
        reason: `Rule match for ${activeFailureEvent.type}`,
        recommendedUpgrades: matchedRule.recommendedUpgrades,
        estimatedAddedCostPhp: 0,
        notes: []
      };
    }

    return null;
  };

  return {
    specimen,
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
    resetSimulation
  };
}
