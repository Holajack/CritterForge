"use client";

import { AnimateIn } from "@/components/shared/AnimateIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QUESTIONS = [
  {
    q: "What text file formats are supported?",
    a: "Any plain text format works - .txt, .md, pasted text, or even Word documents. Describe your scene naturally and ParallaxForge's AI will parse it into distinct depth layers. The more descriptive, the better the results.",
  },
  {
    q: "How does the AI parse my text into scenes?",
    a: "The AI analyzes your description for depth cues, identifying foreground, midground, and background elements. It separates these into 3-8 distinct layers, each with appropriate depth and parallax speed. You can preview and adjust before finalizing.",
  },
  {
    q: "How do parallax scenes work?",
    a: "ParallaxForge generates layered backgrounds where each layer scrolls at a different speed to create depth. Each layer tiles seamlessly for infinite horizontal scrolling. You get individual PNG layers with depth metadata for your game engine.",
  },
  {
    q: "Can I customize individual layers?",
    a: "Yes. After generation, you can regenerate or adjust individual depth layers without redoing the entire scene. Layer-specific adjustments cost 1 credit per layer, regardless of the original scene cost.",
  },
  {
    q: "What devices are supported?",
    a: "ParallaxForge works on desktop and mobile browsers. Export at any resolution optimized for mobile games, desktop games, or high-DPI displays. All layers are generated as high-quality PNGs.",
  },
  {
    q: "How many credits does one generation cost?",
    a: "A parallax scene generation costs 4 credits per scene. This includes 3-8 depth layers with seamless tiling and parallax metadata. Layer regeneration costs 1 credit. Exports are always free.",
  },
  {
    q: "Which game engines are supported?",
    a: "Unity, Godot, and Generic ZIP. Unity exports include layer ordering and parallax speed metadata. Godot exports include .tres resource files. Generic ZIP works with any custom engine or framework.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits purchased through credit packs never expire. Use them at your own pace across any number of projects.",
  },
  {
    q: "Is there an API for batch processing?",
    a: "API access is coming soon with the Studio plan. It will support batch generation, webhook callbacks, and direct integration with CI/CD pipelines for automated asset generation.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border/40 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <AnimateIn>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Everything you need to know about ParallaxForge.
            </p>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {QUESTIONS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateIn>
      </div>
    </section>
  );
}
