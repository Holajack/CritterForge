"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Folder,
  Image,
  Clock,
  Paintbrush,
  LayoutTemplate,
  BarChart3,
} from "lucide-react";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: Folder },
  { href: "/dashboard/assets", label: "Assets", icon: Image },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/styles", label: "Styles", icon: Paintbrush },
];

const COMING_SOON_ITEMS = [
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  const renderItem = (
    item: { href: string; label: string; icon: React.ElementType; exact?: boolean },
    comingSoon = false
  ) => {
    const Icon = item.icon;
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="dashboard-sidebar-active"
            className="absolute inset-0 rounded-lg bg-primary/10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2.5">
          <Icon className="h-4 w-4" />
          {item.label}
        </span>
        {comingSoon && (
          <Badge
            variant="secondary"
            className="relative ml-auto text-[10px] px-1.5 py-0 h-4 font-normal"
          >
            Soon
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30 h-full">
      <div className="p-3 pb-1">
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Dashboard
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-4">
        {NAV_ITEMS.map((item) => renderItem(item))}

        <div className="my-3 border-t border-border/40" />

        {COMING_SOON_ITEMS.map((item) => renderItem(item, true))}
      </nav>
    </aside>
  );
}
