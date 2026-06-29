"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isFeatureEnabled } from "@/src/lib/features";

export function FeatureGuard({
  featureName,
  fallback = "/hub",
  children,
}: {
  featureName: string;
  fallback?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isFeatureEnabled(featureName)) {
      router.replace(fallback);
    }
  }, [featureName, fallback, router]);

  if (!isFeatureEnabled(featureName)) {
    return null;
  }

  return <>{children}</>;
}
