"use client";

import TopBar from "@/components/TopBar";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import Viewport3D from "@/components/Viewport3D";
import BottomTimeline from "@/components/BottomTimeline";
import { useDemoModel } from "@/hooks/useDemoModel";
import { rpeTokens } from "@/lib/ui/tokens";

export default function Home() {
  const modelData = useDemoModel();

  return (
    <div
      className={`flex flex-col h-screen overflow-hidden ${rpeTokens.colors.background.main} ${rpeTokens.colors.text.primary}`}
    >
      <TopBar
        specimen={modelData.specimen}
        activeHazard={modelData.activeHazard}
        hazards={modelData.hazards}
        setActiveHazard={modelData.setActiveHazard}
        simulationStatus={modelData.simulationStatus}
        startSimulation={modelData.startSimulation}
        resetSimulation={modelData.resetSimulation}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          specimen={modelData.specimen}
          draftSpecimen={modelData.draftSpecimen}
          assemblies={modelData.assemblies}
          savedCandidates={modelData.savedCandidates}
          candidateWorkspaceReady={modelData.candidateWorkspaceReady}
          candidateWorkspaceWarnings={modelData.candidateWorkspaceWarnings}
        />
        <Viewport3D
          specimen={modelData.specimen}
          activeFailureEvent={modelData.activeFailureEvent}
        />
        <RightPanel
          products={modelData.products}
          assemblies={modelData.assemblies}
          upgradeDefinitions={modelData.upgradeDefinitions}
          recommendedUpgradeDefinitions={modelData.recommendedUpgradeDefinitions}
          catalogValidation={modelData.catalogValidation}
          draft={modelData.draft}
          draftDiff={modelData.draftDiff}
          draftHasChanges={modelData.draftHasChanges}
          draftHasCostOverrides={modelData.draftHasCostOverrides}
          costRateOverrides={modelData.costRateOverrides}
          quantityOverrides={modelData.quantityOverrides}
          baselineCost={modelData.baselineCost}
          draftCost={modelData.draftCost}
          updateDraftAssembly={modelData.updateDraftAssembly}
          applyUpgrade={modelData.applyUpgrade}
          updateCostRateOverride={modelData.updateCostRateOverride}
          updateQuantityOverride={modelData.updateQuantityOverride}
          clearCostContextOverrides={modelData.clearCostContextOverrides}
          resetDraft={modelData.resetDraft}
          createCandidate={modelData.createCandidate}
          createdCandidate={modelData.createdCandidate}
          simulationStatus={modelData.simulationStatus}
          activeFailureEvent={modelData.activeFailureEvent}
          runModes={modelData.runModes}
          runSettings={modelData.runSettings}
          setRunSettings={modelData.setRunSettings}
        />
      </div>
      <BottomTimeline
        events={modelData.failureEvents}
        activeEventIndex={modelData.activeEventIndex}
        elapsedTime={modelData.elapsedTime}
        durationSeconds={modelData.runSettings.durationSeconds}
      />
    </div>
  );
}
