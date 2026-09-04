import type {
  Assembly,
  AssemblyQuantityOverride,
  CostRateOverride,
  FailureEvent,
  Product,
  RunMode,
  RunSettings,
  SimulationRunMode,
  Specimen,
  SpecimenCostResult,
  UpgradeDefinition,
} from "@/types/rpe";
import type {
  SpecimenDraft,
  SpecimenDraftDiff,
} from "@/lib/prototypes/specimenDraft";
import ExportPanel from "./ExportPanel";
import { rpeTokens } from "@/lib/ui/tokens";

interface CatalogValidationState {
  valid: boolean;
  errors: string[];
}

interface RightPanelProps {
  products: Product[];
  assemblies: Assembly[];
  upgradeDefinitions: UpgradeDefinition[];
  recommendedUpgradeDefinitions: UpgradeDefinition[];
  catalogValidation: CatalogValidationState;
  draft: SpecimenDraft | null;
  draftDiff: SpecimenDraftDiff | null;
  draftHasChanges: boolean;
  draftHasCostOverrides: boolean;
  costRateOverrides: CostRateOverride[];
  quantityOverrides: AssemblyQuantityOverride[];
  baselineCost: SpecimenCostResult | null;
  draftCost: SpecimenCostResult | null;
  updateDraftAssembly: (slot: string, assemblyId: string) => void;
  applyUpgrade: (upgradeId: string) => void;
  updateCostRateOverride: (referenceId: string, unitRate: number | null) => void;
  updateQuantityOverride: (
    assemblyId: string,
    componentIndex: number,
    quantity: number | null
  ) => void;
  clearCostContextOverrides: () => void;
  resetDraft: () => void;
  createCandidate: () => void;
  createdCandidate: Specimen | null;
  simulationStatus: "idle" | "running" | "complete";
  activeFailureEvent: FailureEvent | null;
  runModes: RunMode[];
  runSettings: RunSettings;
  setRunSettings: (settings: RunSettings) => void;
}

function formatSlot(slot: string): string {
  return slot
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPhp(value: number): string {
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function productHasUnverifiedProperties(product: Product): boolean {
  return Object.values(product.engineeringProperties).some((value) => value === null);
}

function quantityOverrideKey(assemblyId: string, componentIndex: number): string {
  return `${assemblyId}:${componentIndex}`;
}

export default function RightPanel({
  products,
  assemblies,
  upgradeDefinitions,
  recommendedUpgradeDefinitions,
  catalogValidation,
  draft,
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
  simulationStatus,
  activeFailureEvent,
  runModes,
  runSettings,
  setRunSettings,
}: RightPanelProps) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const rateOverridesByReference = new Map(
    costRateOverrides.map((override) => [override.referenceId, override])
  );
  const quantityOverridesByComponent = new Map(
    quantityOverrides.map((override) => [
      quantityOverrideKey(override.assemblyId, override.componentIndex),
      override,
    ])
  );
  const recommendedUpgradeIds = new Set(
    recommendedUpgradeDefinitions.map((upgrade) => upgrade.id)
  );
  const appliedUpgradeIds = new Set(draft?.appliedUpgradeIds ?? []);
  const draftCostBySlot = new Map(
    (draftCost?.assemblyCosts ?? []).map((item) => [item.slot, item.assembly])
  );
  const costDelta =
    baselineCost && draftCost ? draftCost.totalCost - baselineCost.totalCost : 0;
  const canResetDraft = draftHasChanges || draftHasCostOverrides;

  return (
    <aside
      className={`w-80 ${rpeTokens.colors.background.panel} border-l ${rpeTokens.colors.borders.divider} flex flex-col h-full overflow-hidden shrink-0`}
    >
      <div className={`p-4 border-b ${rpeTokens.colors.borders.divider} flex-none`}>
        <h2 className={`${rpeTokens.typography.heading} flex items-center justify-between`}>
          Settings & Prototype
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!catalogValidation.valid && (
          <div
            className={`${rpeTokens.colors.status.failure} ${rpeTokens.layout.borderRadius} p-3 border`}
          >
            <h3 className={`${rpeTokens.typography.heading} !text-red-400 mb-2`}>
              Catalog Validation Failed
            </h3>
            <ul className="list-disc pl-4 text-xs text-red-200 space-y-1">
              {catalogValidation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          className={`${rpeTokens.colors.background.surface} ${rpeTokens.layout.borderRadius} p-3 border ${rpeTokens.colors.borders.default}`}
        >
          <h3 className={`${rpeTokens.typography.heading} mb-3`}>Run Settings</h3>
          <div className="space-y-3">
            <div>
              <label className={`${rpeTokens.typography.label} block mb-1`}>Run Mode:</label>
              <select
                className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary} p-1.5 focus:border-emerald-500/50 outline-none`}
                value={runSettings.mode}
                onChange={(event) =>
                  setRunSettings({
                    ...runSettings,
                    mode: event.target.value as SimulationRunMode,
                  })
                }
              >
                {runModes.map((runMode) => (
                  <option key={runMode.id} value={runMode.id} disabled={runMode.future}>
                    {runMode.name} {runMode.future && "(Future)"}
                  </option>
                ))}
              </select>
            </div>

            {runSettings.mode === "fixed_duration" && (
              <div>
                <label className={`${rpeTokens.typography.label} block mb-1`}>
                  Simulation Time:
                </label>
                <select
                  className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary} p-1.5 focus:border-emerald-500/50 outline-none`}
                  value={runSettings.durationSeconds}
                  onChange={(event) =>
                    setRunSettings({
                      ...runSettings,
                      durationSeconds: parseInt(event.target.value, 10),
                    })
                  }
                >
                  <option value={30}>30 sec default</option>
                  <option value={60}>1 min</option>
                  <option value={300}>5 min</option>
                </select>
              </div>
            )}

            {runSettings.mode === "until_breaking_point" && (
              <div>
                <label className={`${rpeTokens.typography.label} block mb-1`}>
                  Stop Condition:
                </label>
                <div
                  className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary} p-1.5`}
                >
                  first critical failure
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={rpeTokens.typography.heading}>Prototype Assemblies</h3>
            <span className="text-[10px] text-slate-500">A0 → Draft</span>
          </div>

          {!draft ? (
            <div className="text-xs text-red-300">No baseline specimen available.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(draft.assemblySelections).map(([slot, assemblyId]) => {
                const selectedAssembly = assemblies.find((assembly) => assembly.id === assemblyId);
                const alternatives = assemblies.filter((assembly) => assembly.category === slot);
                const slotCost = draftCostBySlot.get(slot);

                return (
                  <div
                    key={slot}
                    className={`${rpeTokens.colors.background.surface} p-3 ${rpeTokens.layout.borderRadius} border ${rpeTokens.colors.borders.default}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className={rpeTokens.typography.label}>{formatSlot(slot)}</label>
                      {selectedAssembly?.verificationStatus !== "verified" && (
                        <span className="text-[10px] font-semibold text-amber-400">
                          [Unverified]
                        </span>
                      )}
                    </div>

                    <select
                      value={assemblyId}
                      onChange={(event) => updateDraftAssembly(slot, event.target.value)}
                      disabled={!catalogValidation.valid}
                      className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} text-xs ${rpeTokens.colors.text.secondary} p-1.5 outline-none`}
                    >
                      {alternatives.map((assembly) => (
                        <option key={assembly.id} value={assembly.id}>
                          {assembly.name}
                        </option>
                      ))}
                    </select>

                    {selectedAssembly && (
                      <div className="mt-2 space-y-2">
                        {selectedAssembly.components.length === 0 ? (
                          <div className={`text-[11px] ${rpeTokens.colors.text.muted}`}>
                            No material line items in this assembly.
                          </div>
                        ) : (
                          selectedAssembly.components.map((component, componentIndex) => {
                            const product = productsById.get(component.productId);
                            const costedComponent = slotCost?.components.find(
                              (item) => item.componentIndex === componentIndex
                            );
                            const rateOverride = rateOverridesByReference.get(
                              component.productId
                            );
                            const quantityOverride = quantityOverridesByComponent.get(
                              quantityOverrideKey(selectedAssembly.id, componentIndex)
                            );

                            return (
                              <div
                                key={`${slot}-${componentIndex}-${component.productId}`}
                                className={`text-[11px] border-t ${rpeTokens.colors.borders.divider} pt-2 first:border-t-0 first:pt-0`}
                              >
                                <div className="flex justify-between gap-2">
                                  <span className={rpeTokens.colors.text.secondary}>
                                    {product?.name ?? component.productId}
                                  </span>
                                  {product && productHasUnverifiedProperties(product) && (
                                    <span className="text-amber-400">[Unverified]</span>
                                  )}
                                </div>
                                <div className={rpeTokens.colors.text.muted}>
                                  Library: {component.quantity} {component.unit} · effective:{" "}
                                  {costedComponent?.baseQuantity ?? component.quantity} {component.unit}{" "}
                                  · +{Math.round(component.wastePercent * 100)}% waste
                                </div>

                                <div className="mt-2 grid grid-cols-[1fr_92px] gap-2 items-center">
                                  <div>
                                    <div className="text-[10px] text-slate-500">
                                      Quantity / takeoff override
                                    </div>
                                    <div className="text-[9px] text-slate-600">
                                      {costedComponent?.quantityOverrideApplied
                                        ? costedComponent.quantityOverrideSourceNote ??
                                          "quantity override active"
                                        : "library takeoff active"}
                                    </div>
                                  </div>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={quantityOverride?.quantity ?? ""}
                                    placeholder={String(component.quantity)}
                                    onChange={(event) => {
                                      const rawValue = event.target.value;
                                      if (rawValue === "") {
                                        updateQuantityOverride(
                                          selectedAssembly.id,
                                          componentIndex,
                                          null
                                        );
                                        return;
                                      }
                                      const parsed = Number(rawValue);
                                      if (Number.isFinite(parsed) && parsed >= 0) {
                                        updateQuantityOverride(
                                          selectedAssembly.id,
                                          componentIndex,
                                          parsed
                                        );
                                      }
                                    }}
                                    className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} text-xs p-1 text-right`}
                                  />
                                </div>

                                <div className="mt-1.5 grid grid-cols-[1fr_92px] gap-2 items-center">
                                  <div>
                                    <div className="text-[10px] text-slate-500">
                                      Local unit-rate override
                                    </div>
                                    <div className="text-[9px] text-slate-600">
                                      {costedComponent?.rateType === "user_override"
                                        ? "user price override active"
                                        : costedComponent?.sourceNote ?? "library rate"}
                                    </div>
                                  </div>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={rateOverride?.unitRate ?? ""}
                                    placeholder={
                                      costedComponent ? String(costedComponent.unitRate) : "rate"
                                    }
                                    onChange={(event) => {
                                      const rawValue = event.target.value;
                                      if (rawValue === "") {
                                        updateCostRateOverride(component.productId, null);
                                        return;
                                      }
                                      const parsed = Number(rawValue);
                                      if (Number.isFinite(parsed) && parsed >= 0) {
                                        updateCostRateOverride(component.productId, parsed);
                                      }
                                    }}
                                    className={`w-full ${rpeTokens.colors.background.input} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} text-xs p-1 text-right`}
                                  />
                                </div>

                                {costedComponent && (
                                  <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                                    <span>
                                      With waste: {costedComponent.quantityWithWaste}{" "}
                                      {costedComponent.unit}
                                    </span>
                                    <span>{formatPhp(costedComponent.materialCost)}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {slotCost && (
                          <div
                            className={`flex justify-between text-[11px] pt-2 border-t ${rpeTokens.colors.borders.divider}`}
                          >
                            <span className={rpeTokens.colors.text.muted}>Assembly total</span>
                            <span className={rpeTokens.typography.data}>
                              {formatPhp(slotCost.totalCost)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {baselineCost && draftCost && (
          <div
            className={`${rpeTokens.colors.background.surface} ${rpeTokens.layout.borderRadius} p-3 border ${rpeTokens.colors.borders.default}`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className={rpeTokens.typography.heading}>Traceable Cost</h3>
              {draftHasCostOverrides && (
                <button
                  type="button"
                  onClick={clearCostContextOverrides}
                  className="text-[10px] text-amber-400 hover:text-amber-300"
                >
                  Clear cost context
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={rpeTokens.colors.text.muted}>A0 library baseline</span>
                <span
                  className={`${rpeTokens.typography.data} ${rpeTokens.colors.text.primary}`}
                >
                  {formatPhp(baselineCost.totalCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={rpeTokens.colors.text.muted}>Draft / local context</span>
                <span
                  className={`${rpeTokens.typography.data} ${rpeTokens.colors.text.primary}`}
                >
                  {formatPhp(draftCost.totalCost)}
                </span>
              </div>
              <div
                className={`flex justify-between pt-1.5 border-t ${rpeTokens.colors.borders.divider}`}
              >
                <span className={rpeTokens.colors.text.muted}>Difference</span>
                <span
                  className={`${rpeTokens.typography.data} ${
                    costDelta > 0
                      ? "text-amber-400"
                      : costDelta < 0
                        ? "text-emerald-400"
                        : rpeTokens.colors.text.secondary
                  }`}
                >
                  {costDelta > 0 ? "+" : ""}
                  {formatPhp(costDelta)}
                </span>
              </div>
            </div>

            <div
              className={`mt-3 pt-3 border-t ${rpeTokens.colors.borders.divider} space-y-1 text-[11px]`}
            >
              <div className="flex justify-between">
                <span className={rpeTokens.colors.text.muted}>Materials incl. waste</span>
                <span>{formatPhp(draftCost.materialSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className={rpeTokens.colors.text.muted}>Labor allowance</span>
                <span>{formatPhp(draftCost.laborSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className={rpeTokens.colors.text.muted}>Equipment allowance</span>
                <span>{formatPhp(draftCost.equipmentSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className={rpeTokens.colors.text.muted}>Installation allowance</span>
                <span>{formatPhp(draftCost.installationSubtotal)}</span>
              </div>
            </div>

            <p className="text-[10px] text-amber-400/80 mt-3 leading-relaxed">
              Sample rates, takeoff quantities, and engineering properties marked unverified
              are not design or procurement truth.
            </p>
          </div>
        )}

        <div
          className={`${rpeTokens.colors.background.surface} ${rpeTokens.layout.borderRadius} p-3 border ${rpeTokens.colors.borders.default}`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className={rpeTokens.typography.heading}>Assembly Upgrade Paths</h3>
            <span className="text-[9px] text-emerald-400">PHASE 2</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
            Applying a ready upgrade changes actual draft assemblies. Cost impact is derived
            from the resulting BOM; no fixed upgrade peso modifier is used.
          </p>
          <div className="space-y-2">
            {upgradeDefinitions.map((upgrade) => {
              const isApplied = appliedUpgradeIds.has(upgrade.id);
              const isRecommended = recommendedUpgradeIds.has(upgrade.id);
              const isReady = upgrade.status === "ready";

              return (
                <div
                  key={upgrade.id}
                  className={`p-2 ${rpeTokens.layout.borderRadius} border ${
                    isApplied
                      ? "border-emerald-700/70 bg-emerald-950/20"
                      : rpeTokens.colors.borders.default
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-xs font-medium ${rpeTokens.colors.text.primary}`}>
                          {upgrade.name}
                        </span>
                        {isRecommended && activeFailureEvent && (
                          <span className="text-[9px] text-amber-300 border border-amber-800/60 px-1 rounded">
                            scripted recommendation
                          </span>
                        )}
                        {!isReady && (
                          <span className="text-[9px] text-slate-400 border border-slate-700 px-1 rounded">
                            needs definition
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] ${rpeTokens.colors.text.muted} mt-1 leading-relaxed`}>
                        {upgrade.expectedBenefit}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!isReady || isApplied || !catalogValidation.valid}
                      onClick={() => applyUpgrade(upgrade.id)}
                      className={`shrink-0 px-2 py-1 text-[10px] border ${rpeTokens.layout.borderRadius} ${
                        isReady && !isApplied && catalogValidation.valid
                          ? "border-emerald-700 text-emerald-300 hover:bg-emerald-950/40"
                          : "border-slate-700 text-slate-500 opacity-60"
                      }`}
                    >
                      {isApplied ? "Applied" : isReady ? "Apply" : "Blocked"}
                    </button>
                  </div>

                  {upgrade.assemblyChanges.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {upgrade.assemblyChanges.map((change) => {
                        const targetAssembly = assemblies.find(
                          (assembly) => assembly.id === change.assemblyId
                        );
                        return (
                          <div
                            key={`${upgrade.id}-${change.slot}`}
                            className="text-[9px] text-slate-500"
                          >
                            {formatSlot(change.slot)} → {targetAssembly?.name ?? change.assemblyId}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!isReady && upgrade.notes[0] && (
                    <div className="mt-1.5 text-[9px] text-amber-400/80 leading-relaxed">
                      {upgrade.notes[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {activeFailureEvent && recommendedUpgradeDefinitions.length === 0 && (
            <div className="mt-2 text-[9px] text-slate-500">
              No Phase 2 upgrade definition is mapped to scripted failure type{" "}
              <span className="font-mono">{activeFailureEvent.type}</span>.
            </div>
          )}
        </div>

        <div className="space-y-2">
          {draftDiff && draftDiff.assemblyChanges.length > 0 && (
            <div
              className={`${rpeTokens.colors.background.surface} p-2 ${rpeTokens.layout.borderRadius} border ${rpeTokens.colors.borders.default}`}
            >
              <div className={`${rpeTokens.typography.label} mb-1`}>
                Structural Draft Changes
              </div>
              {draftDiff.assemblyChanges.map((change) => (
                <div key={change.slot} className="text-[11px] text-slate-400">
                  {formatSlot(change.slot)}: {change.fromAssemblyId ?? "none"} →{" "}
                  {change.toAssemblyId ?? "none"}
                </div>
              ))}
              {draftDiff.addedUpgradeIds.length > 0 && (
                <div className="mt-1.5 text-[10px] text-emerald-400/80">
                  Applied upgrade IDs: {draftDiff.addedUpgradeIds.join(", ")}
                </div>
              )}
            </div>
          )}

          {draftHasCostOverrides && (
            <div className="text-[10px] text-slate-500">
              {costRateOverrides.length} price override
              {costRateOverrides.length === 1 ? "" : "s"} and {quantityOverrides.length}{" "}
              quantity override{quantityOverrides.length === 1 ? "" : "s"} active. Cost
              context does not alter specimen ancestry.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={resetDraft}
              disabled={!canResetDraft}
              className={`px-2 py-2 text-xs border ${rpeTokens.layout.borderRadius} ${rpeTokens.colors.borders.default} disabled:opacity-40`}
            >
              Reset Draft
            </button>
            <button
              type="button"
              onClick={createCandidate}
              disabled={!draftHasChanges || !catalogValidation.valid || Boolean(createdCandidate)}
              className={`px-2 py-2 text-xs border ${rpeTokens.layout.borderRadius} ${
                draftHasChanges && catalogValidation.valid && !createdCandidate
                  ? "border-emerald-600 text-emerald-300 bg-emerald-950/30"
                  : `${rpeTokens.colors.borders.default} text-slate-500 opacity-50`
              }`}
            >
              {createdCandidate ? "Candidate Created" : "Create Candidate"}
            </button>
          </div>

          {createdCandidate && (
            <div
              className={`${rpeTokens.colors.status.success} ${rpeTokens.layout.borderRadius} p-2 text-xs border`}
            >
              <div className="font-semibold text-emerald-300">
                Candidate created in session
              </div>
              <div className={rpeTokens.colors.text.secondary}>{createdCandidate.id}</div>
              <div className={rpeTokens.colors.text.muted}>
                Parent: {createdCandidate.parentSpecimenId}. A0 remains unchanged.
              </div>
              {draftHasCostOverrides && (
                <div className="text-[10px] text-slate-500 mt-1">
                  Local price/takeoff context remains separate from structural specimen
                  identity.
                </div>
              )}
            </div>
          )}
        </div>

        {simulationStatus === "complete" && (
          <div
            className={`${rpeTokens.colors.status.failure} ${rpeTokens.layout.borderRadius} p-3 border`}
          >
            <h3 className={`${rpeTokens.typography.heading} !text-red-400 mb-2`}>
              Scripted MVP Summary
            </h3>
            <div className={`space-y-2 ${rpeTokens.typography.body}`}>
              <p className="text-xs text-amber-300">
                Conceptual Phase 1 playback only — not force-based physics.
              </p>
              <p>
                <span className={rpeTokens.colors.text.muted}>Current event:</span>{" "}
                <span className="font-medium">
                  {activeFailureEvent?.name ?? "No scripted failure event reached"}
                </span>
              </p>
              <p>
                <span className={rpeTokens.colors.text.muted}>Primary limitation:</span>{" "}
                event timing and failure state are predefined rather than calculated.
              </p>
            </div>
          </div>
        )}

        <ExportPanel simulationStatus={simulationStatus} />
      </div>
    </aside>
  );
}
