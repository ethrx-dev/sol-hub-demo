"use client";

import { OnboardingFlow } from "@/src/components/forms/onboarding-flow";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
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
