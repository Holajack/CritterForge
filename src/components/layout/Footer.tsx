import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Flame className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">ParallaxForge</span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              AI parallax scene generation for game developers. Upload a text file
              and get multi-layered parallax backgrounds &mdash; with depth metadata
              and ready for your engine.
            </p>

            {/* Newsletter */}
            <div>
              <p className="mb-2 text-sm font-medium">Stay in the loop</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-9 max-w-[220px] text-sm"
                />
                <Button size="sm" variant="outline">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#features" className="transition-colors hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a></li>
              <li><Link href="/gallery" className="transition-colors hover:text-foreground">Gallery</Link></li>
              <li><a href="#faq" className="transition-colors hover:text-foreground">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><span className="cursor-default">Documentation</span></li>
              <li><span className="cursor-default">API Reference</span></li>
              <li><span className="cursor-default">Changelog</span></li>
              <li><span className="cursor-default">Status</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ParallaxForge. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="cursor-default transition-colors hover:text-foreground">Twitter</span>
            <span className="cursor-default transition-colors hover:text-foreground">Discord</span>
            <span className="cursor-default transition-colors hover:text-foreground">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
