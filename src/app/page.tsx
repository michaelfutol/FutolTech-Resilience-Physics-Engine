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
    <div className={`flex flex-col h-screen overflow-hidden ${rpeTokens.colors.background.main} ${rpeTokens.colors.text.primary}`}>
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
        <LeftPanel specimen={modelData.specimen} />
        <Viewport3D 
          specimen={modelData.specimen} 
          activeFailureEvent={modelData.activeFailureEvent}
        />
        <RightPanel 
          materials={modelData.materials} 
          costItems={modelData.costItems} 
          simulationStatus={modelData.simulationStatus}
          activeFailureEvent={modelData.activeFailureEvent}
          availableUpgrades={modelData.availableUpgrades}
          selectedUpgradeIds={modelData.selectedUpgradeIds}
          toggleUpgrade={modelData.toggleUpgrade}
          runModes={modelData.runModes}
          runSettings={modelData.runSettings}
          setRunSettings={modelData.setRunSettings}
          recommendation={modelData.recommendation}
        />
      </div>
      <BottomTimeline 
        events={modelData.failureEvents} 
        activeEventIndex={modelData.activeEventIndex}
        elapsedTime={modelData.elapsedTime}
      />
    </div>
  );
}
