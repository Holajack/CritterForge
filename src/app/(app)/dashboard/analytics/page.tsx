"use client";

import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";

const CHART_PREVIEWS = [
  {
    title: "Credit Usage Over Time",
    icon: TrendingUp,
    colSpan: "sm:col-span-2",
  },
  {
    title: "Generations by Type",
    icon: BarChart3,
    colSpan: "",
  },
  {
    title: "Most Used Styles",
    icon: PieChart,
    colSpan: "",
  },
  {
    title: "Activity Heatmap",
    icon: Activity,
    colSpan: "sm:col-span-2",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10 space-y-6">
      <AnimateIn variant="fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your creative output and optimize your workflow.
          </p>
        </div>
      </AnimateIn>

      <ComingSoon
        icon={BarChart3}
        title="Usage Analytics"
        description="Understand your generation patterns, track credit consumption, and identify your most productive workflows with detailed charts and insights."
      />

      {/* Preview chart placeholders */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2">
        {CHART_PREVIEWS.map((chart) => {
          const Icon = chart.icon;
          return (
            <StaggerItem key={chart.title} className={chart.colSpan}>
              <div className="rounded-xl border border-border/40 bg-muted/20 p-6 opacity-40">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {chart.title}
                  </span>
                </div>
                <div className="h-32 rounded-lg bg-muted/30 flex items-center justify-center">
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                      <div
                        key={i}
                        className="w-4 rounded-t bg-primary/10"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
