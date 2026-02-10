"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Layers,
  Sparkles,
  FileDown,
} from "lucide-react";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string | undefined;

  if (!projectId) return null;

  const basePath = `/project/${projectId}`;

  const items = [
    { href: basePath, label: "Parallax Scenes", icon: Layers, exact: true },
    { href: `${basePath}/parallax`, label: "New Scene", icon: Sparkles },
    { href: `${basePath}/export`, label: "Export", icon: FileDown },
  ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30">
      <div className="p-3">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Projects
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-4">
        {items.map((item) => {
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
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
