"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useJobProgress } from "@/hooks/useJobProgress";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  RotateCw,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface GenerationProgressProps {
  jobId: Id<"jobs"> | null;
  layerCount: number;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function GenerationProgress({
  jobId,
  layerCount,
  onComplete,
  onError,
  onCancel,
  onRetry,
}: GenerationProgressProps) {
  const { progress, currentStep, status, error } = useJobProgress(jobId);
  const cancelJob = useMutation(api.jobs.cancel);
  const hasCalledComplete = useRef(false);
  const hasCalledError = useRef(false);

  useEffect(() => {
    if (status === "completed" && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onComplete?.();
    }
    if (status === "failed" && error && !hasCalledError.current) {
      hasCalledError.current = true;
      onError?.(error);
    }
  }, [status, error, onComplete, onError]);

  if (!jobId) return null;

  const isActive = status === "processing" || status === "queued";
  const isCancelled = status === "cancelled";
  const isFailed = status === "failed";
  const stepLabel = deriveStepLabel(currentStep, layerCount);

  const handleCancel = async () => {
    try {
      await cancelJob({ id: jobId });
      onCancel?.();
    } catch (err) {
      console.error("Failed to cancel job:", err);
    }
  };

  return (
    <Card
      className={
        isCancelled
          ? "border-yellow-500/30 bg-yellow-500/5"
          : isFailed
            ? "border-red-500/30 bg-red-500/5"
            : "border-primary/30 bg-primary/5"
      }
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          {isActive && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {status === "completed" && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {isFailed && <AlertCircle className="h-4 w-4 text-red-500" />}
          {isCancelled && <XCircle className="h-4 w-4 text-yellow-500" />}
          <span className="font-medium text-sm">
            {status === "queued"
              ? "Starting generation..."
              : status === "processing"
                ? "Generating Scene..."
                : status === "completed"
                  ? "Generation Complete!"
                  : isCancelled
                    ? "Generation Cancelled"
                    : isFailed
                      ? "Generation Failed"
                      : "Queued"}
          </span>
          <Badge variant="secondary" className="ml-auto text-xs font-mono">
            {progress}%
          </Badge>
        </div>

        <Progress value={progress} />

        {isActive && (
          <p className="text-xs text-muted-foreground">{stepLabel}</p>
        )}

        {error && !isCancelled && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {isCancelled && (
          <p className="text-xs text-yellow-600">
            Generation was cancelled. Credits have been refunded.
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </Button>
          )}

          {(isFailed || isCancelled) && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>

        {isActive && (
          <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              You can navigate away safely. Your scene will appear in the list
              when ready.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function deriveStepLabel(currentStep: string, layerCount: number): string {
  if (!currentStep) return "Initializing...";
  const match = currentStep.match(/^layer-(\d+)$/);
  if (match) {
    const layerIndex = parseInt(match[1], 10);
    return `Generating layer ${layerIndex + 1} of ${layerCount}...`;
  }
  if (currentStep === "depth-estimation") return "Estimating depth...";
  if (currentStep === "layer-splitting") return "Splitting layers...";
  if (currentStep === "finalizing") return "Finalizing...";
  return `Processing: ${currentStep}`;
}
