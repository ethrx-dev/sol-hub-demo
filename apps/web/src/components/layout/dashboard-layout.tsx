"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Navbar } from "@/src/components/layout/navbar";
import { Menu } from "lucide-react";
import { useAuth, type UserRole } from "@/src/lib/auth";

const ROLE_PREFIXES: Record<UserRole, string[]> = {
  innovator: ["/innovator"],
  mentor: ["/mentor"],
  investor: ["/investor"],
  admin: ["/admin"],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !user.onboarding_completed) {
      router.push("/onboarding");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isLoading || !user) return;

    const allowedPrefixes = ROLE_PREFIXES[user.role] || [];
    const isOnRolePage = allowedPrefixes.some((p) => pathname.startsWith(p));
    const isOnSharedPage =
      pathname.startsWith("/workspaces") ||
      pathname.startsWith("/notifications") ||
      pathname.startsWith("/hub") ||
      pathname.startsWith("/resources");

    if (!isOnRolePage && !isOnSharedPage && pathname.startsWith("/")) {
      const dashPaths: Record<string, string> = {
        innovator: "/innovator",
        mentor: "/mentor",
        investor: "/investor",
        admin: "/admin",
      };
      router.push(dashPaths[user.role] || "/");
    }
  }, [user, isLoading, pathname, router]);

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
