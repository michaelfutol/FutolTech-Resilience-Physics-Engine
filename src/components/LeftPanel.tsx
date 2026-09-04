import type { Assembly, Specimen } from "@/types/rpe";
import { rpeTokens } from "@/lib/ui/tokens";

interface LeftPanelProps {
  specimen: Specimen | null;
  draftSpecimen: Specimen | null;
  assemblies: Assembly[];
}

function formatSlot(slot: string): string {
  return slot
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function LeftPanel({ specimen, draftSpecimen, assemblies }: LeftPanelProps) {
  if (!specimen) {
    return (
      <aside
        className={`w-64 ${rpeTokens.colors.background.surface} border-r ${rpeTokens.colors.borders.default} flex flex-col shrink-0 overflow-y-auto`}
      >
        <div className={`p-4 border-b ${rpeTokens.colors.borders.divider}`}>
          <h2 className={rpeTokens.typography.heading}>Model Builder</h2>
        </div>
        <div className={`p-4 ${rpeTokens.typography.body} ${rpeTokens.colors.text.muted}`}>
          Loading...
        </div>
      </aside>
    );
  }

  const activeSpecimen = draftSpecimen ?? specimen;
  const assembliesById = new Map(assemblies.map((assembly) => [assembly.id, assembly]));
  const isDraftChanged = Object.entries(activeSpecimen.assemblySelections).some(
    ([slot, assemblyId]) => specimen.assemblySelections[slot] !== assemblyId
  );

  return (
    <aside
      className={`w-64 ${rpeTokens.colors.background.surface} border-r ${rpeTokens.colors.borders.divider} flex flex-col shrink-0 overflow-y-auto`}
    >
      <div className={`p-4 border-b ${rpeTokens.colors.borders.divider}`}>
        <h2 className={rpeTokens.typography.heading}>Model Builder</h2>
      </div>
      <div className="p-4 flex-1">
        <div className="mb-6">
          <div className={rpeTokens.typography.heading}>Baseline Specimen</div>
          <div className={`text-sm font-medium ${rpeTokens.colors.text.primary} mt-1`}>
            {specimen.name}
          </div>
          <div
            className={`mt-2 ${rpeTokens.typography.data} border px-2 py-1 ${rpeTokens.layout.borderRadius} inline-block ${
              specimen.verificationStatus === "verified"
                ? rpeTokens.colors.status.success
                : "border-amber-800/60 text-amber-400 bg-amber-950/20"
            }`}
          >
            {specimen.verificationStatus === "verified" ? "VERIFIED" : "UNVERIFIED A0"}
          </div>
          <div className={`mt-2 text-[10px] ${rpeTokens.colors.text.muted} break-all`}>
            {specimen.id}
          </div>
          {isDraftChanged && (
            <div className="mt-2 text-[10px] text-emerald-400">
              Viewing structural draft; A0 remains unchanged.
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className={rpeTokens.typography.heading}>Assembly Tree</div>
        </div>

        <ul
          className={`space-y-4 ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary}`}
        >
          {Object.entries(activeSpecimen.assemblySelections).map(([slot, assemblyId]) => {
            const assembly = assembliesById.get(assemblyId);
            const changedFromA0 = specimen.assemblySelections[slot] !== assemblyId;

            return (
              <li
                key={slot}
                className={`flex flex-col gap-1 border-l-2 pl-3 ml-1 ${
                  changedFromA0 ? "border-emerald-600" : "border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={rpeTokens.typography.label}>{formatSlot(slot)}</span>
                  {changedFromA0 && (
                    <span className="text-[9px] text-emerald-400">DRAFT</span>
                  )}
                </div>
                <span className="flex items-center gap-2">
                  {assembly?.name ?? assemblyId}
                </span>
                {assembly?.verificationStatus !== "verified" && (
                  <span className={`text-[10px] ${rpeTokens.colors.text.muted}`}>
                    [Unverified assembly]
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
