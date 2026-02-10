"use client";

import { useParams } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const hasProject = !!params?.id;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        {hasProject && <Sidebar />}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
