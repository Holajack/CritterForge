"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { toast } from "sonner";

const PACKS = [
  {
    packId: "starter",
    name: "Starter",
    credits: 15,
    price: 9,
    perCredit: "0.60",
    description: "Try it out on a scene or two.",
    features: [
      "~3 parallax scenes",
      "All 7 art styles",
      "All export formats",
      "Seamless tiling included",
    ],
  },
  {
    packId: "standard",
    name: "Standard",
    credits: 40,
    price: 19,
    perCredit: "0.48",
    description: "Enough for multiple game levels.",
    features: [
      "~10 parallax scenes",
      "Priority processing",
      "Batch generation",
      "Layer customization",
    ],
    highlighted: true,
  },
  {
    packId: "pro",
    name: "Pro",
    credits: 120,
    price: 49,
    perCredit: "0.41",
    description: "Full game's worth of backgrounds.",
    features: [
      "~30 parallax scenes",
      "Priority processing",
      "Multi-device export",
      "Individual layer regen",
    ],
  },
  {
    packId: "studio",
    name: "Studio",
    credits: 280,
    price: 99,
    perCredit: "0.35",
    description: "For teams shipping multiple games.",
    features: [
      "~70 parallax scenes",
      "Highest priority queue",
      "API access (coming soon)",
      "Dedicated support",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border/40 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Pay for what you generate
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Buy credits in packs. One parallax scene costs 4 credits. Layer regeneration
              and exports are always free.
            </p>
          </div>
        </AnimateIn>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((pack) => (
            <StaggerItem key={pack.name}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md ${
                  pack.highlighted
                    ? "border-primary/40 bg-primary/[0.03] shadow-sm"
                    : "border-border/60 bg-card"
                }`}
              >
                {pack.highlighted && (
                  <div className="absolute -top-3 left-6 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1">
                    <Zap className="h-3 w-3 text-primary-foreground" />
                    <span className="text-xs font-semibold text-primary-foreground">Popular</span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-base font-semibold">{pack.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{pack.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${pack.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pack.credits} credits &middot; ${pack.perCredit}/credit
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-2.5">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <PricingButton packId={pack.packId} name={pack.name} highlighted={pack.highlighted} />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimateIn delay={0.3}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Credits never expire. Monthly subscription ($19/mo for 200 credits) coming soon.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}

function PricingButton({ packId, name, highlighted }: { packId: string; name: string; highlighted?: boolean }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    try {
      const { url } = await createCheckout({ packId });
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      variant={highlighted ? "default" : "outline"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Loading..." : `Get ${name}`}
    </Button>
  );
}
