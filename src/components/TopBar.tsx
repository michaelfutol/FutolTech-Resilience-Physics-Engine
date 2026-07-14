import { Specimen, Hazards } from "@/types/rpe";
import { rpeTokens } from "@/lib/ui/tokens";

interface TopBarProps {
  specimen: Specimen | null;
  activeHazard: string;
  hazards: Hazards;
  setActiveHazard: (hazard: string) => void;
  simulationStatus: "idle" | "running" | "complete";
  startSimulation: () => void;
  resetSimulation: () => void;
}

export default function TopBar({ 
  specimen, activeHazard, hazards, setActiveHazard, 
  simulationStatus, startSimulation, resetSimulation 
}: TopBarProps) {

  const handleAction = () => {
    if (simulationStatus === "idle" || simulationStatus === "complete") {
      startSimulation();
    } else if (simulationStatus === "running") {
      resetSimulation(); // optionally let user stop it
    }
  };

  const buttonText = () => {
    if (simulationStatus === "idle") return "Run Simulation";
    if (simulationStatus === "running") return "Stop...";
    return "Replay Simulation";
  };

  const buttonClass = simulationStatus === "running" 
    ? `${rpeTokens.colors.status.warning} hover:opacity-80 px-4 py-1.5 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} transition-colors border`
    : `${rpeTokens.colors.status.success} hover:opacity-80 px-4 py-1.5 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} transition-colors border`;

  return (
    <header className={`h-14 ${rpeTokens.colors.background.panel} border-b ${rpeTokens.colors.borders.divider} flex items-center justify-between px-6 shrink-0 z-10 ${rpeTokens.layout.shadow}`}>
      <div className="flex items-center gap-4">
        <h1 className={`${rpeTokens.typography.heading} text-lg`}>FutolTech RPE</h1>
        <span className={`${rpeTokens.typography.data} ${rpeTokens.colors.text.muted}`}>
          {specimen ? `${specimen.id} — ${specimen.name}` : "Loading..."}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <select 
          className={`${rpeTokens.colors.background.surface} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} px-3 py-1 ${rpeTokens.typography.data} ${rpeTokens.colors.text.secondary} outline-none focus:border-emerald-500/50 disabled:opacity-50`}
          value={activeHazard}
          onChange={(e) => setActiveHazard(e.target.value)}
          disabled={simulationStatus === "running"}
        >
          {Object.keys(hazards).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, " ").toUpperCase()} ({hazards[key].wind_kph} kph)
            </option>
          ))}
        </select>
        <button 
          onClick={handleAction}
          className={buttonClass}
        >
          {buttonText()}
        </button>
      </div>
    </header>
  );
}
