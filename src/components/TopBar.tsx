import { Specimen, Hazards } from "@/types/rpe";

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
    ? "bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded font-medium transition-colors"
    : "bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded font-medium transition-colors";

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 text-white shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-lg">FutolTech RPE</h1>
        <span className="text-sm text-slate-400">
          {specimen ? `${specimen.id} — ${specimen.name}` : "Loading..."}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <select 
          className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
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
