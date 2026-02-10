"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCredits() {
  const credits = useQuery(api.billing.getCredits);
  return { credits: credits ?? 0, isLoading: credits === undefined };
}
