"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CreditBadge } from "../shared/CreditBadge";
import { Flame, LayoutDashboard, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: LayoutDashboard },
  { href: "/gallery", label: "Gallery", icon: Image },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-5 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight">ParallaxForge</span>
        </Link>

        <nav className="ml-6 flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className={cn(
                  "relative",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="header-nav-active"
                      className="absolute -bottom-[1px] left-2 right-2 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <CreditBadge />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
