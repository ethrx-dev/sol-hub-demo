"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Navbar } from "@/src/components/layout/navbar";
import { Menu, Sparkles, X } from "lucide-react";
import { useAuth, type UserRole } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";

const ROLE_PREFIXES: Record<UserRole, string[]> = {
  innovator: ["/innovator"],
  mentor: ["/mentor"],
  investor: ["/investor"],
  participant: ["/participant"],
  admin: ["/admin"],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resonanceDismissed, setResonanceDismissed] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !user.onboarding_completed) {
      router.push("/onboarding");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && user.onboarding_completed) {
      const role = user.role as UserRole;
      const prefixes = ROLE_PREFIXES[role] || [];
      const isOnRolePage = prefixes.some((p) => pathname.startsWith(p));
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
          participant: "/participant",
          admin: "/admin",
        };
        router.push(dashPaths[user.role] || "/");
      }
    }
  }, [user, isLoading, pathname, router]);

  const dismissResonance = async () => {
    setResonanceDismissed(true);
    try {
      await api.post("/users/me/engage-resonance");
    } catch {}
  };

  const showResonanceBanner =
    user &&
    user.onboarding_completed &&
    !resonanceDismissed &&
    user.role !== "admin";

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
          {showResonanceBanner && (
            <div className="border-b bg-sage-light/20">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link href="/resonance" className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity">
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <span>
                    <span className="font-medium">Meet Whitney</span>
                    <span className="text-muted-foreground ml-1 hidden sm:inline">
                      — Before anything is asked of you, you are invited to be met.
                    </span>
                  </span>
                </Link>
                <button
                  onClick={dismissResonance}
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
