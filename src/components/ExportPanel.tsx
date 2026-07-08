interface ExportPanelProps {
  simulationStatus: "idle" | "running" | "complete";
}

export default function ExportPanel({ simulationStatus }: ExportPanelProps) {
  const handleExport = (type: string) => {
    alert(`Export placeholder: this will generate a ${type} in a later phase.`);
  };

  const isEnabled = simulationStatus === "complete";
  const buttonClass = `px-3 py-1.5 rounded text-xs font-medium text-left border transition-colors ${
    isEnabled 
      ? "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-400 cursor-pointer" 
      : "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
  }`;

  return (
    <div className="mt-6 pt-4 border-t border-slate-800">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Export & Reports</h3>
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
