"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useJobProgress(jobId: Id<"jobs"> | null) {
  const progress = useQuery(
    api.jobs.getProgress,
    jobId ? { id: jobId } : "skip"
  );

  return {
    progress: progress?.progress ?? 0,
    currentStep: progress?.currentStep ?? "",
    status: progress?.status ?? "queued",
    error: progress?.error,
    isLoading: progress === undefined,
  };
}
