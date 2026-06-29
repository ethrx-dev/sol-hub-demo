"use client";

import { useEffect, useRef } from "react";

interface ShapoWidgetProps {
  widgetId: string;
  className?: string;
}

export function ShapoWidget({ widgetId, className }: ShapoWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById("shapo-embed-js")) {
      const script = document.createElement("script");
      script.id = "shapo-embed-js";
      script.src = "https://cdn.shapo.io/js/embed.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id={`shapo-widget-${widgetId}`}
      className={className}
    />
  );
}
