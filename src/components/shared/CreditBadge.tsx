"use client";

import Link from "next/link";
import { useCredits } from "@/hooks/useCredits";
import { Coins } from "lucide-react";

export function CreditBadge() {
  const { credits, isLoading } = useCredits();

  return (
    <Link
      href="/billing"
      className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <Coins className="h-3.5 w-3.5 text-primary" />
      <span className="font-medium tabular-nums">
        {isLoading ? "—" : credits}
      </span>
    </Link>
  );
}
