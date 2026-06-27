"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth";

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

  return <>{children}</>;
}
