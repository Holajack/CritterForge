"use client";

import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Flame, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#parallax", label: "Parallax" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Flame className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">ParallaxForge</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
          <Link href="/gallery" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Gallery
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </SignedIn>
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Gallery
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </nav>
      )}
    </header>
  );
}
