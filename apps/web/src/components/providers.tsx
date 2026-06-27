"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/src/lib/auth";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
