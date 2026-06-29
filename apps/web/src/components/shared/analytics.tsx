"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PLAUSIBLE_URL = process.env.NEXT_PUBLIC_PLAUSIBLE_URL || "";
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PLAUSIBLE_URL || !PLAUSIBLE_DOMAIN) return;
    const script = document.createElement("script");
    script.src = PLAUSIBLE_URL;
    script.setAttribute("data-domain", PLAUSIBLE_DOMAIN);
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!PLAUSIBLE_URL || !PLAUSIBLE_DOMAIN) return;
    try {
      (window as any).plausible?.("pageview", { u: window.location.href });
    } catch {
      // silent
    }
  }, [pathname]);

  return null;
}
