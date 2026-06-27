"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Navbar } from "@/src/components/layout/navbar";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-16 z-30 border-b bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
