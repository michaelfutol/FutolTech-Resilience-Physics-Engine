import { Material, CostItem, FailureEvent, UpgradeOption, RunSettings, PrototypeRecommendation, RunMode } from "@/types/rpe";
import ExportPanel from "./ExportPanel";
import { rpeTokens } from "@/lib/ui/tokens";

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
    <aside className={`w-80 ${rpeTokens.colors.background.panel} border-l ${rpeTokens.colors.borders.divider} flex flex-col h-full overflow-hidden shrink-0`}>
      <div className={`p-4 border-b ${rpeTokens.colors.borders.divider} flex-none`}>
        <h2 className={`${rpeTokens.typography.heading} flex items-center justify-between`}>
          Settings & Upgrades
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* RUN SETTINGS PLACEHOLDER */}
        <div className={`${rpeTokens.colors.background.surface} ${rpeTokens.layout.borderRadius} p-3 border ${rpeTokens.colors.borders.default}`}>
          <h3 className={`${rpeTokens.typography.heading} mb-3`}>Run Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className={`${rpeTokens.typography.label} block mb-1`}>Run Mode:</label>
              <select 
                className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary} p-1.5 focus:border-emerald-500/50 outline-none`}
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
                <label className={`${rpeTokens.typography.label} block mb-1`}>Simulation Time:</label>
                <select 
                  className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary} p-1.5 focus:border-emerald-500/50 outline-none`}
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
                <label className={`${rpeTokens.typography.label} block mb-1`}>Stop Condition:</label>
                <div className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary} p-1.5`}>
                  first critical failure
                </div>
              </div>
            )}
          </div>
        </div>

        {simulationStatus === "complete" && (
          <div className={`${rpeTokens.colors.status.failure} ${rpeTokens.layout.borderRadius} p-3 border`}>
            <h3 className={`${rpeTokens.typography.heading} !text-red-400 mb-2`}>Simulation Summary</h3>
            <div className={`space-y-2 ${rpeTokens.typography.body}`}>
              <p><span className={rpeTokens.colors.text.muted}>Baseline result:</span> <span className="font-medium">Likely fails / major damage</span></p>
              <p><span className={rpeTokens.colors.text.muted}>First likely failure:</span> Sawali cladding vibration</p>
              <p><span className={rpeTokens.colors.text.muted}>Primary weak points:</span> roof uplift, frame racking, cladding attachment</p>
              <div className={`pt-2 mt-2 border-t ${rpeTokens.colors.borders.divider}`}>
                <p className={`${rpeTokens.typography.label} mb-1`}>Suggested improvements:</p>
                <ul className={`list-disc pl-4 ${rpeTokens.colors.text.secondary} text-xs`}>
                  <li>Add diagonal bracing</li>
                  <li>Add roof tie-down straps</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {simulationStatus === "complete" && (
          <div className={`${rpeTokens.colors.background.surface} ${rpeTokens.layout.borderRadius} p-3 border border-emerald-900/50 mt-4`}>
            <h3 className={`${rpeTokens.typography.heading} !text-emerald-400 mb-3`}>Upgrade Options</h3>
            <div className="space-y-3">
              {availableUpgrades.map(upgrade => {
                const isSelected = selectedUpgradeIds.includes(upgrade.id);
                return (
                  <label key={upgrade.id} className={`flex flex-col gap-1 p-2 ${rpeTokens.layout.borderRadius} border cursor-pointer transition-colors ${isSelected ? rpeTokens.colors.status.success : `${rpeTokens.colors.background.panel} ${rpeTokens.colors.borders.default} hover:border-slate-500`}`}>
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className={`mt-1 ${rpeTokens.layout.borderRadius} border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500`} 
                        checked={isSelected}
                        onChange={() => toggleUpgrade(upgrade.id)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${rpeTokens.colors.text.primary}`}>{upgrade.name}</span>
                          <span className={`${rpeTokens.typography.data} text-emerald-400`}>+₱{upgrade.estimatedCostPhp.toLocaleString()}</span>
                        </div>
                        <p className={`text-xs ${rpeTokens.colors.text.muted} leading-tight mt-1`}>{upgrade.expectedBenefit}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            {selectedUpgradeIds.length > 0 && (
              <div className="mt-4 pt-3 border-t border-emerald-900/50">
                <div className={`flex justify-between text-sm font-medium text-emerald-400 mb-3`}>
                  <span>Added cost placeholder:</span>
                  <span className={rpeTokens.typography.data}>₱{availableUpgrades.filter(u => selectedUpgradeIds.includes(u.id)).reduce((sum, u) => sum + u.estimatedCostPhp, 0).toLocaleString()}</span>
                </div>
                <div className={`${rpeTokens.colors.status.success} ${rpeTokens.layout.borderRadius} p-2 text-xs border`}>
                  <span className={rpeTokens.colors.text.muted}>Next specimen: </span>
                  <span className={`font-medium ${rpeTokens.colors.text.primary}`}>
                    {recommendation ? `${recommendation.nextSpecimenId} (Recommended via Rebuilder)` : "A1 — Braced 3m x 3m Sawali Test House"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className={`${rpeTokens.typography.heading} mb-3`}>Materials</h3>
          <div className="space-y-3">
            {structureMaterials.map((mat) => (
              <div key={mat.id} className={`${rpeTokens.colors.background.surface} p-3 ${rpeTokens.layout.borderRadius}`}>
                <div className={`text-sm font-medium ${rpeTokens.colors.text.primary}`}>{mat.name}</div>
                <div className={`text-xs ${rpeTokens.colors.text.muted} mt-1 capitalize`}>{mat.type}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className={`${rpeTokens.typography.heading} mb-3`}>Connectors</h3>
          <div className="space-y-2">
            {connections.map((conn) => (
              <label key={conn.id} className={`flex items-center gap-2 text-sm ${rpeTokens.colors.text.secondary}`}>
                <input type="checkbox" className={`${rpeTokens.layout.borderRadius} border-slate-600 bg-slate-700`} defaultChecked />
                {conn.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`${rpeTokens.typography.heading} mb-3`}>Cost Estimate</h3>
          <div className="space-y-2 text-sm">
            {costItems.map((cost) => (
              <div key={cost.id} className={`flex justify-between border-b ${rpeTokens.colors.borders.divider} pb-1 mb-1`}>
                <span className={rpeTokens.colors.text.muted}>{cost.name}</span>
                <span className={`${rpeTokens.colors.text.primary} ${rpeTokens.typography.data}`}>₱{cost.placeholderCost.toLocaleString()}</span>
              </div>
            ))}
            <div className={`flex justify-between font-bold pt-2 ${rpeTokens.colors.text.primary}`}>
              <span>Total Estimated</span>
              <span className={rpeTokens.typography.data}>₱{costItems.reduce((acc, curr) => acc + curr.placeholderCost, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <ExportPanel simulationStatus={simulationStatus} />
      </div>
    </aside>
  );
}
