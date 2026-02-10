"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimateIn } from "@/components/shared/AnimateIn";

export function CTABanner() {
  return (
    <section className="border-t border-border/40">
      <AnimateIn>
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-ember/5 to-moss/5 py-24 md:py-32">
          <div className="pixel-grid absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to generate parallax scenes?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Upload your first text file and generate multi-layered parallax backgrounds
              in minutes. 5 free credits to start &mdash; no card required.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 px-8">
                  Start Creating &mdash; It&apos;s Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
