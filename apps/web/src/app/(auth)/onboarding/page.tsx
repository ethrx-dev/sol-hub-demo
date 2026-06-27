"use client";

import { OnboardingFlow } from "@/src/components/forms/onboarding-flow";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20 overflow-hidden">
      <div className="absolute -top-20 -right-20 opacity-[0.04] pointer-events-none">
        <img src="/sol-icon.svg" alt="" className="w-[250px]" />
      </div>
      <div className="absolute -bottom-20 -left-20 opacity-[0.04] pointer-events-none rotate-45">
        <img src="/sol-icon.svg" alt="" className="w-[250px]" />
      </div>
      <div className="w-full max-w-lg relative">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/sol-icon.svg" alt="SOL" className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold font-heading">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Tell us more about yourself so we can tailor your experience.
          </p>
        </div>
        <OnboardingFlow />
      </div>
    </div>
  );
}
