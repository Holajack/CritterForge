"use client";

import { useParams, usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const hasProject = !!params?.id;
  const isDashboard = pathname.startsWith("/dashboard");
  const showSidebar = isDashboard || hasProject;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        showMenuButton={showSidebar}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar - fixed */}
        {showSidebar && (
          <div className="hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
            {isDashboard ? <DashboardSidebar /> : <Sidebar />}
          </div>
        )}

        {/* Mobile sidebar drawer */}
        {showSidebar && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0">
              {isDashboard ? (
                <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
              ) : (
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              )}
            </SheetContent>
          </Sheet>
        )}

        <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
