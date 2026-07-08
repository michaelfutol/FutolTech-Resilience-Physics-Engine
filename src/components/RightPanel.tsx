import { Material, CostItem, FailureEvent, UpgradeOption, RunSettings, PrototypeRecommendation, RunMode } from "@/types/rpe";
import ExportPanel from "./ExportPanel";

interface RightPanelProps {
  materials: Material[];
  costItems: CostItem[];
  simulationStatus: "idle" | "running" | "complete";
  activeFailureEvent: FailureEvent | null;
  availableUpgrades: UpgradeOption[];
  selectedUpgradeIds: string[];
  toggleUpgrade: (id: string) => void;
  runModes: RunMode[];
  runSettings: RunSettings;
  setRunSettings: (settings: RunSettings) => void;
  recommendation: PrototypeRecommendation | null;
}

export default function RightPanel({ 
  materials, costItems, simulationStatus, 
  availableUpgrades, selectedUpgradeIds, toggleUpgrade,
  runModes, runSettings, setRunSettings, recommendation
}: RightPanelProps) {
  const structureMaterials = materials.filter((m) => m.type !== "connection");
  const connections = materials.filter((m) => m.type === "connection");

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex-none">
        <h2 className="font-semibold text-slate-100 flex items-center justify-between">
          Settings & Upgrades
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* RUN SETTINGS PLACEHOLDER */}
        <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Run Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Run Mode:</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 p-1.5 focus:border-emerald-500 focus:outline-none"
                value={runSettings.mode}
                onChange={(e) => setRunSettings({...runSettings, mode: e.target.value as import("@/types/rpe").SimulationRunMode})}
              >
                {runModes.map((rm) => (
                  <option key={rm.id} value={rm.id} disabled={rm.future}>
                    {rm.name} {rm.future && "(Future)"}
                  </option>
                ))}
              </select>
            </div>

            {runSettings.mode === "fixed_duration" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Simulation Time:</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 p-1.5 focus:border-emerald-500 focus:outline-none"
                  value={runSettings.durationSeconds}
                  onChange={(e) => setRunSettings({...runSettings, durationSeconds: parseInt(e.target.value)})}
                >
                  <option value={30}>30 sec default</option>
                  <option value={60}>1 min</option>
                  <option value={300}>5 min</option>
                  <option value={-1}>custom input</option>
                </select>
              </div>
            )}
            
            {runSettings.mode === "until_breaking_point" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Stop Condition:</label>
                <div className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 p-1.5">
                  first critical failure
                </div>
              </div>
            )}
          </div>
        </div>

        {simulationStatus === "complete" && (
          <div className="bg-slate-800 rounded p-3 border border-red-900/50">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Simulation Summary</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-400">Baseline result:</span> <span className="text-red-400 font-medium">Likely fails / major damage</span></p>
              <p><span className="text-slate-400">First likely failure:</span> Sawali cladding vibration</p>
              <p><span className="text-slate-400">Primary weak points:</span> roof uplift, frame racking, cladding attachment</p>
              <div className="pt-2 mt-2 border-t border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Suggested improvements:</p>
                <ul className="list-disc pl-4 text-slate-300 text-xs">
                  <li>Add diagonal bracing</li>
                  <li>Add roof tie-down straps</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {simulationStatus === "complete" && (
          <div className="bg-slate-800 rounded p-3 border border-emerald-900/50 mt-4">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Upgrade Options</h3>
            <div className="space-y-3">
              {availableUpgrades.map(upgrade => {
                const isSelected = selectedUpgradeIds.includes(upgrade.id);
                return (
                  <label key={upgrade.id} className={`flex flex-col gap-1 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}>
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className="mt-1 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500" 
                        checked={isSelected}
                        onChange={() => toggleUpgrade(upgrade.id)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-200">{upgrade.name}</span>
                          <span className="text-xs font-mono text-emerald-400">+₱{upgrade.estimatedCostPhp.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight mt-1">{upgrade.expectedBenefit}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            {selectedUpgradeIds.length > 0 && (
              <div className="mt-4 pt-3 border-t border-emerald-900/50">
                <div className="flex justify-between text-sm font-medium text-emerald-400 mb-3">
                  <span>Added cost placeholder:</span>
                  <span className="font-mono">₱{availableUpgrades.filter(u => selectedUpgradeIds.includes(u.id)).reduce((sum, u) => sum + u.estimatedCostPhp, 0).toLocaleString()}</span>
                </div>
                <div className="bg-emerald-950/30 rounded p-2 text-xs border border-emerald-900/30">
                  <span className="text-slate-400">Next specimen: </span>
                  <span className="text-slate-200 font-medium">
                    {recommendation ? `${recommendation.nextSpecimenId} (Recommended via Rebuilder)` : "A1 — Braced 3m x 3m Sawali Test House"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Materials</h3>
          <div className="space-y-3">
            {structureMaterials.map((mat) => (
              <div key={mat.id} className="bg-slate-700 p-3 rounded-md">
                <div className="text-sm font-medium text-slate-200">{mat.name}</div>
                <div className="text-xs text-slate-400 mt-1 capitalize">{mat.type}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Connectors</h3>
          <div className="space-y-2">
            {connections.map((conn) => (
              <label key={conn.id} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" className="rounded border-slate-600 bg-slate-700" defaultChecked />
                {conn.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cost Estimate</h3>
          <div className="space-y-2 text-sm">
            {costItems.map((cost) => (
              <div key={cost.id} className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                <span className="text-slate-400">{cost.name}</span>
                <span className="text-slate-200 font-mono">₱{cost.placeholderCost.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 text-emerald-400">
              <span>Total Estimated</span>
              <span className="font-mono">₱{costItems.reduce((acc, curr) => acc + curr.placeholderCost, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <ExportPanel simulationStatus={simulationStatus} />
      </div>
    </aside>
  );
}
