"use client";

import { useCredits } from "@/hooks/useCredits";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, CreditCard, Zap } from "lucide-react";
import { CREDIT_PACKS, CREDIT_COSTS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { credits, isLoading } = useCredits();

  const handlePurchase = (packId: string) => {
    toast.info("Stripe integration coming soon");
  };

  return (
    <div className="container max-w-6xl mx-auto py-4 md:py-8 px-3 md:px-4 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Coins className="h-6 w-6 md:h-7 md:w-7 text-ember" />
          <h1 className="text-2xl md:text-3xl font-bold">Credits & Billing</h1>
        </div>
        <p className="text-muted-foreground">Purchase credits to generate animations</p>
      </div>

      {/* Current Balance */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono">
                  {isLoading ? "..." : credits.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">credits</span>
              </div>
            </div>
            <div className="bg-ember/10 p-4 rounded-lg">
              <Coins className="h-8 w-8 text-ember" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packs */}
      <div>
        <h2 className="text-xl font-bold mb-4">Purchase Credits</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKS.map((pack, index) => {
            const isPopular = pack.id === "pro";
            const pricePerCredit = pack.price / pack.credits;

            return (
              <Card
                key={pack.id}
                className={cn(
                  "relative border-border/60 transition-all hover:shadow-md",
                  isPopular && "border-ember"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-ember text-ember-foreground">Best Value</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{pack.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold font-mono">
                      ${(pack.price / 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-ember font-mono">{pack.credits}</span>
                    <span className="text-sm text-muted-foreground">credits</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    ${(pricePerCredit / 100).toFixed(2)}/credit
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handlePurchase(pack.id)}
                    variant={isPopular ? "default" : "outline"}
                    className={cn("w-full", isPopular && "bg-ember hover:bg-ember/90")}
                    size="sm"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Credit Costs */}
      <div>
        <h2 className="text-xl font-bold mb-4">Credit Costs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CostItem
            label="Background Removal"
            cost={CREDIT_COSTS.bgRemoval}
            description="Strip background from image"
          />
          <CostItem
            label="Style Transfer"
            cost={CREDIT_COSTS.styleTransfer}
            description="Apply style pack to character"
          />
          <CostItem
            label="Single Animation"
            cost={CREDIT_COSTS.singleAnimation}
            description="One action, one direction"
          />
          <CostItem
            label="8-Direction Set"
            cost={CREDIT_COSTS.eightDirSet}
            description="One action, all 8 directions"
          />
          <CostItem
            label="Full Character"
            cost={CREDIT_COSTS.fullCharacter}
            description="All actions, all directions"
          />
          <CostItem
            label="Parallax Scene"
            cost={CREDIT_COSTS.parallaxScene}
            description="Multi-layer background"
          />
          <CostItem
            label="Frame Regeneration"
            cost={CREDIT_COSTS.frameRegen}
            description="Re-generate single frame"
          />
          <CostItem
            label="Export Package"
            cost={CREDIT_COSTS.export}
            description="Download as ZIP"
          />
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Your transaction history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CostItem({
  label,
  cost,
  description,
}: {
  label: string;
  cost: number;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-card">
      <div className="bg-sky/10 p-2 rounded-md mt-0.5">
        <Zap className="h-4 w-4 text-sky" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm mb-0.5">{label}</div>
        <div className="text-xs text-muted-foreground mb-2">{description}</div>
        <div className="flex items-baseline gap-1">
          {cost === 0 ? (
            <Badge variant="secondary" className="text-xs font-mono">
              Free
            </Badge>
          ) : (
            <>
              <span className="text-sm font-bold font-mono text-ember">{cost}</span>
              <span className="text-xs text-muted-foreground">
                {cost === 1 ? "credit" : "credits"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
