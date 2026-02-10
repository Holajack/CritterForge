import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { DemoSection } from "@/components/landing/DemoSection";
import { ParallaxShowcase } from "@/components/landing/ParallaxShowcase";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TargetAudience } from "@/components/landing/TargetAudience";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <SocialProofBar />
        <DemoSection />
        <ParallaxShowcase />
        <FeatureGrid />
        <TargetAudience />
        <PricingSection />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
