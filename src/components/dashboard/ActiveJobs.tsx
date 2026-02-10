"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { toast } from "sonner";

interface ActiveJob {
  _id: Id<"jobs">;
  jobType: string;
  status: string;
  progress: number;
  currentStep?: string;
  creditsCharged: number;
  _creationTime: number;
}

interface ActiveJobsProps {
  jobs: ActiveJob[];
}

export function ActiveJobs({ jobs }: ActiveJobsProps) {
  const cancelJob = useMutation(api.jobs.cancel);

  if (jobs.length === 0) return null;

  const handleCancel = async (jobId: Id<"jobs">) => {
    try {
      await cancelJob({ id: jobId });
      toast.success("Job cancelled");
    } catch {
      toast.error("Failed to cancel job");
    }
  };

  return (
    <AnimateIn variant="fade-up" delay={0.1}>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Active Jobs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="relative rounded-xl border border-primary/20 bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {job.jobType.replace(/-/g, " ")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleCancel(job._id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Progress value={job.progress} className="h-1.5" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">
                  {job.currentStep || "Starting..."}
                </span>
                <span className="shrink-0 ml-2">{job.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  );
}
