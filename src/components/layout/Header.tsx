"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CreditBadge } from "../shared/CreditBadge";
import { Flame, LayoutDashboard, Image, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: LayoutDashboard },
  { href: "/gallery", label: "Gallery", icon: Image },
];

interface HeaderProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

export function Header({ showMenuButton, onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-3 md:px-5 gap-2 md:gap-4">
        {/* Mobile menu button for project sidebar */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight hidden sm:inline">ParallaxForge</span>
        </Link>

        <nav className="ml-2 md:ml-6 flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className={cn(
                  "relative h-9 px-2 md:px-3",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 md:mr-1.5" />
                  <span className="hidden md:inline">{item.label}</span>
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

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <CreditBadge />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
