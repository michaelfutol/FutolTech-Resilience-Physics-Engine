"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";

import {
  evaluateGenesisAerodynamicForceStep,
  type GenesisAerodynamicForceStepEvaluation,
} from "@/lib/genesis/aerodynamicForceWindow";
import type { GenesisAerodynamicForceApplicationPlan } from "@/types/genesisForceApplication";

export const GENESIS_RAPIER_FIXED_STEP_SECONDS = 1 / 60;

interface GenesisAerodynamicForceDriverProps {
  rigidBodyRef: RefObject<RapierRigidBody | null>;
  plan: GenesisAerodynamicForceApplicationPlan | null;
  runContextKey: string;
  onForceStepEvidence: (evaluation: GenesisAerodynamicForceStepEvaluation) => void;
}

/**
 * Runtime-only bridge from the already validated force-application plan to
 * Rapier. The driver owns no aerodynamic calculation and introduces no torque.
 * It resets the external force accumulator every fixed step so the declared
 * force cannot persist beyond the explicit application window.
 */
export default function GenesisAerodynamicForceDriver({
  rigidBodyRef,
  plan,
  runContextKey,
  onForceStepEvidence,
}: GenesisAerodynamicForceDriverProps) {
  const elapsedSecondsRef = useRef(0);
  const lastEvidenceStateRef = useRef<GenesisAerodynamicForceStepEvaluation["state"] | null>(null);

  useEffect(() => {
    elapsedSecondsRef.current = 0;
    lastEvidenceStateRef.current = null;
    rigidBodyRef.current?.resetForces(true);
  }, [rigidBodyRef, runContextKey, plan]);

  useBeforePhysicsStep(() => {
    const rigidBody = rigidBodyRef.current;
    if (!rigidBody) return;

    // Rapier forces persist until cleared. Reset first so this driver cannot
    // silently extend a prior step's aerodynamic force beyond the declared window.
    rigidBody.resetForces(true);

    if (!plan) return;

    const evaluation = evaluateGenesisAerodynamicForceStep(
      plan,
      elapsedSecondsRef.current,
      GENESIS_RAPIER_FIXED_STEP_SECONDS,
    );

    if (evaluation.shouldApplyForce && evaluation.effectiveForceN) {
      rigidBody.addForce(evaluation.effectiveForceN, true);
    }

    if (evaluation.state !== lastEvidenceStateRef.current) {
      lastEvidenceStateRef.current = evaluation.state;
      onForceStepEvidence(evaluation);
    }

    elapsedSecondsRef.current += GENESIS_RAPIER_FIXED_STEP_SECONDS;
  });

  return null;
}
