"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth";
import { Badge } from "@/src/components/ui/badge";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (user?.role !== "admin") {
    router.push("/");
    return null;
  }

  return (
    <div className="space-y-1">
      {user?.is_super_admin && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 border border-amber-200">
          <span className="font-semibold">Super Admin</span>
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            Full Access
          </Badge>
          <span className="text-amber-600 ml-2">
            You have full permissions to manage all platform features.
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
