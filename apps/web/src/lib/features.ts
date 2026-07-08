const DEFAULT_FEATURES = ["connections"];

function getEnvFeatures(): string[] {
  if (typeof process === "undefined") return DEFAULT_FEATURES;
  const raw = process.env.NEXT_PUBLIC_ENABLED_FEATURES;
  if (!raw) return DEFAULT_FEATURES;
  return raw.split(",").map((f) => f.trim()).filter(Boolean);
}

const ENABLED_FEATURES = new Set(getEnvFeatures());

export function isFeatureEnabled(name: string): boolean {
  return ENABLED_FEATURES.has(name);
}

export function getEnabledFeatures(): string[] {
  return [...ENABLED_FEATURES];
}
