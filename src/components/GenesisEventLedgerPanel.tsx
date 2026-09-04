import type { GenesisOrderedEvidenceEvent } from "@/lib/genesis/simulationEventLedger";

interface GenesisEventLedgerPanelProps {
  events: GenesisOrderedEvidenceEvent[];
}

function eventValueSummary(event: GenesisOrderedEvidenceEvent): string {
  return Object.entries(event.values)
    .map(([key, value]) => `${key}=${value === null ? "null" : String(value)}`)
    .join(" · ");
}

export default function GenesisEventLedgerPanel({ events }: GenesisEventLedgerPanelProps) {
  return (
    <section className="rounded border border-slate-700 bg-slate-950/80 p-3 text-[11px] text-slate-200">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-100">Genesis evidence ledger</h3>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          analytical → simulation
        </span>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <article key={`${event.sequence}-${event.eventType}`} className="rounded border border-slate-800 bg-slate-900/70 p-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-slate-400">#{event.sequence}</span>
              <span className="font-medium text-slate-100">{event.eventType}</span>
              <span className="rounded border border-slate-700 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-slate-300">
                {event.evidenceLayer}
              </span>
              <span className="text-slate-400">{event.status}</span>
            </div>
            <p className="mt-1 text-slate-300">{event.message}</p>
            {Object.keys(event.values).length > 0 && (
              <p className="mt-1 break-words font-mono text-[10px] text-slate-400">{eventValueSummary(event)}</p>
            )}
            {event.sourceNotes.length > 0 && (
              <p className="mt-1 text-[10px] text-slate-500">Source: {event.sourceNotes.join(" · ")}</p>
            )}
          </article>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Collision-enter records are event observations only. They do not establish impact force, energy, damage, contact properties, solver authority, CFD authority, or physical-test evidence.
      </p>
    </section>
  );
}
