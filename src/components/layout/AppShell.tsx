"use client";

import { useParams } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const hasProject = !!params?.id;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        showMenuButton={hasProject}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar - fixed */}
        {hasProject && (
          <div className="hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
            <Sidebar />
          </div>
        )}

        {/* Mobile sidebar drawer */}
        {hasProject && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
