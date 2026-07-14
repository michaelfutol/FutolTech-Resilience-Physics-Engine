import { rpeTokens } from "@/lib/ui/tokens";

interface ExportPanelProps {
  simulationStatus: "idle" | "running" | "complete";
}

export default function ExportPanel({ simulationStatus }: ExportPanelProps) {
  const handleExport = (type: string) => {
    alert(`Export placeholder: this will generate a ${type} in a later phase.`);
  };

  const isEnabled = simulationStatus === "complete";
  const buttonClass = `px-3 py-1.5 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} text-left border transition-colors ${
    isEnabled 
      ? `${rpeTokens.colors.background.surface} ${rpeTokens.colors.borders.default} ${rpeTokens.colors.text.accent} hover:bg-slate-700 hover:border-slate-500 cursor-pointer` 
      : `${rpeTokens.colors.background.input} border-transparent ${rpeTokens.colors.text.muted} cursor-not-allowed`
  }`;

  return (
    <div className={`mt-6 pt-4 border-t ${rpeTokens.colors.borders.divider}`}>
      <h3 className={`${rpeTokens.typography.heading} mb-3`}>Export & Reports</h3>
      <div className="flex flex-col gap-2">
        <button 
          className={buttonClass} 
          disabled={!isEnabled}
          onClick={() => handleExport("Simulation Video (MP4)")}
        >
          🎬 Export Video
        </button>
        <button 
          className={buttonClass} 
          disabled={!isEnabled}
          onClick={() => handleExport("Screenshots (PNG)")}
        >
          📸 Save Screenshots
        </button>
        <button 
          className={buttonClass} 
          disabled={!isEnabled}
          onClick={() => handleExport("Cost Report (CSV/JSON)")}
        >
          📊 Generate Cost Report
        </button>
        <button 
          className={buttonClass} 
          disabled={!isEnabled}
          onClick={() => handleExport("Simulation Summary (PDF)")}
        >
          📄 Export Simulation Summary
        </button>
        <button 
          className={buttonClass} 
          disabled={!isEnabled}
          onClick={() => handleExport("Upgrade Cost Table (CSV)")}
        >
          💰 Export Upgrade Cost Table
        </button>
      </div>
    </div>
  );
}
