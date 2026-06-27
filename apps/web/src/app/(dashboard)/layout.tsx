"use client";

import { DashboardLayout } from "@/src/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/src/lib/auth";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
