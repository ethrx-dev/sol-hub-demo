"use client";

import { useEffect } from "react";

interface ShapoFormProps {
  formId: string;
  className?: string;
}

export function ShapoForm({ formId, className }: ShapoFormProps) {
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
      id={`shapo-form-${formId}`}
      className={className}
    />
  );
}
