import type { Specimen } from "../../types/rpe";

export const CANDIDATE_WORKSPACE_SCHEMA_VERSION = 1 as const;
export const CANDIDATE_WORKSPACE_STORAGE_KEY = "rpe.candidate-workspace.v1";

export interface CandidateWorkspacePayload {
  schemaVersion: typeof CANDIDATE_WORKSPACE_SCHEMA_VERSION;
  baselineSpecimenId: string;
  candidates: Specimen[];
}

export interface CandidateWorkspaceParseResult {
  candidates: Specimen[];
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function parseCandidate(value: unknown, baselineSpecimenId: string): Specimen | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id.trim()) return null;
  if (typeof value.name !== "string" || !value.name.trim()) return null;
  if (value.parentSpecimenId !== baselineSpecimenId) return null;
  if (!isStringArray(value.appliedUpgradeIds)) return null;
  if (!isStringRecord(value.assemblySelections)) return null;
  if (value.createdFromDraft !== true) return null;
  if (typeof value.notes !== "string") return null;
  if (value.verificationStatus !== "unverified" && value.verificationStatus !== "verified") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    parentSpecimenId: value.parentSpecimenId,
    appliedUpgradeIds: [...value.appliedUpgradeIds],
    assemblySelections: { ...value.assemblySelections },
    createdFromDraft: true,
    notes: value.notes,
    verificationStatus: value.verificationStatus,
  };
}

export function serializeCandidateWorkspace(
  baselineSpecimenId: string,
  candidates: Specimen[]
): string {
  const payload: CandidateWorkspacePayload = {
    schemaVersion: CANDIDATE_WORKSPACE_SCHEMA_VERSION,
    baselineSpecimenId,
    candidates,
  };
  return JSON.stringify(payload);
}

export function parseCandidateWorkspace(
  raw: string | null,
  baselineSpecimenId: string
): CandidateWorkspaceParseResult {
  if (!raw) return { candidates: [], errors: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      candidates: [],
      errors: ["Candidate workspace is not valid JSON"],
    };
  }

  if (!isRecord(parsed)) {
    return { candidates: [], errors: ["Candidate workspace payload is not an object"] };
  }
  if (parsed.schemaVersion !== CANDIDATE_WORKSPACE_SCHEMA_VERSION) {
    return {
      candidates: [],
      errors: [`Unsupported candidate workspace schema version: ${String(parsed.schemaVersion)}`],
    };
  }
  if (parsed.baselineSpecimenId !== baselineSpecimenId) {
    return {
      candidates: [],
      errors: [
        `Candidate workspace baseline ${String(parsed.baselineSpecimenId)} does not match ${baselineSpecimenId}`,
      ],
    };
  }
  if (!Array.isArray(parsed.candidates)) {
    return { candidates: [], errors: ["Candidate workspace candidates must be an array"] };
  }

  const candidates: Specimen[] = [];
  const errors: string[] = [];
  const seenIds = new Set<string>();

  parsed.candidates.forEach((value, index) => {
    const candidate = parseCandidate(value, baselineSpecimenId);
    if (!candidate) {
      errors.push(`Candidate workspace item ${index} is invalid`);
      return;
    }
    if (seenIds.has(candidate.id)) {
      errors.push(`Candidate workspace contains duplicate candidate ID: ${candidate.id}`);
      return;
    }
    seenIds.add(candidate.id);
    candidates.push(candidate);
  });

  return { candidates, errors };
}

export function nextCandidateSequence(candidates: Specimen[]): number {
  let maxSequence = 0;
  for (const candidate of candidates) {
    const match = candidate.id.match(/^specimen-a(\d+)-/i);
    if (!match) continue;
    const sequence = Number(match[1]);
    if (Number.isInteger(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }
  return maxSequence + 1;
}
