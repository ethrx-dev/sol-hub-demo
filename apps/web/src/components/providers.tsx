"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/src/lib/auth";
import { SiteWalkthrough } from "@/src/components/forms/site-walkthrough";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <SiteWalkthrough />
    </AuthProvider>
  );
}
