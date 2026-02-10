"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, MoveHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const LAYER_COLORS = [
  { name: "Sky", color: "#1a1a2e", speed: 0 },
  { name: "Mountains", color: "#16213e", speed: 0.2 },
  { name: "Trees", color: "#0f3460", speed: 0.5 },
  { name: "Ground", color: "#533483", speed: 1.0 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      setScrollOffset((prev) => (prev + 0.5) % 200);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="pixel-grid absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6 pb-16 pt-12 md:pb-32 md:pt-28">
        <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-primary">Now in Early Access</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            >
              One text file.{" "}
              <span className="text-primary">Every parallax scene</span>{" "}
              your game needs.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-4 md:mt-6 max-w-lg text-base md:text-lg leading-relaxed text-muted-foreground"
            >
              Upload a script, story, or scene list. ParallaxForge uses AI to parse your
              content and generate multi-layered parallax backgrounds &mdash; ready to drop
              into Unity, Godot, or any engine.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4"
            >
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 px-8">
                  Start Creating
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 md:mt-10 flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-moss" />
                3-8 depth layers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-sky" />
                Seamless tiling
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-ember" />
                Device-optimized
              </span>
            </motion.div>
          </motion.div>

          {/* Right: Interactive parallax layer preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
              {/* Title bar */}
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-moss/60" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">parallax_preview</span>
                <div className="w-14" />
              </div>

              {/* Parallax canvas */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a1a]">
                {LAYER_COLORS.map((layer, i) => (
                  <motion.div
                    key={layer.name}
                    className="absolute inset-0"
                    style={{
                      backgroundColor: layer.color,
                      opacity: i === 0 ? 1 : 0.85,
                      top: `${i * 20}%`,
                      zIndex: i,
                    }}
                    animate={{
                      x: -(scrollOffset * layer.speed),
                    }}
                    transition={{ duration: 0, ease: "linear" }}
                  >
                    <div
                      className="absolute inset-0 rounded-t-lg"
                      style={{
                        background: `linear-gradient(180deg, transparent 0%, ${layer.color} 30%)`,
                        borderTop: i === activeLayer ? "2px solid hsl(var(--primary))" : "none",
                      }}
                    />
                  </motion.div>
                ))}
                {/* Depth indicator */}
                <div className="absolute bottom-4 right-4 z-10 rounded-md bg-background/90 px-2.5 py-1 text-xs font-mono tabular-nums text-muted-foreground backdrop-blur">
                  {LAYER_COLORS.length} layers
                </div>
              </div>

              {/* Layer selector */}
              <div className="border-t border-border/40 px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Depth Layers
                  </span>
                  <MoveHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LAYER_COLORS.map((layer, i) => (
                    <button
                      key={layer.name}
                      onClick={() => setActiveLayer(i)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        activeLayer === i
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      {layer.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating metadata card */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="hidden sm:block absolute -bottom-6 -left-6 rounded-xl border border-border/60 bg-card p-4 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky/10">
                  <Layers className="h-5 w-5 text-sky" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Forest Scene</p>
                  <p className="text-xs text-muted-foreground">4 layers &middot; 1920&times;1080</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
