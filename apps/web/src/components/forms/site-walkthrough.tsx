"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTourStore } from "@/src/stores/tour-store";

const SECTION_ICONS: Record<string, string> = {
  "Platform Overview": "🌐",
  "Getting Started": "🚀",
  "Using the Platform": "💡",
  "Next Steps": "🎯",
};

export function SiteWalkthrough() {
  const { isOpen, currentStep, steps, close, next, prev, goTo } =
    useTourStore();
  const [imgFailed, setImgFailed] = useState(false);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const section = step?.section || "";

  const sectionSteps = steps.filter((s) => s.section === section);
  const sectionIndex = sectionSteps.findIndex((s) => s.id === step?.id);
  const sectionTotal = sectionSteps.length;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && !isLast) next();
      if (e.key === "ArrowLeft" && !isFirst) prev();
    },
    [close, next, prev, isFirst, isLast]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setImgFailed(false);
  }, [currentStep]);

  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative mx-4 w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-2 flex gap-1 px-1">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep
                  ? "bg-primary shadow-sm"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                {step.icon && !imgFailed ? (
                  <img
                    src={step.icon}
                    alt=""
                    className="h-6 w-6"
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  SECTION_ICONS[section] || "✨"
                )}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {section}
                  <span className="text-muted-foreground">
                    {" "}
 &middot; {sectionIndex + 1}/{sectionTotal}
                  </span>
                </p>
                <h2 className="text-xl font-bold font-heading text-foreground">
                  {step.title}
                </h2>
              </div>
            </div>
            <button
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-8 min-h-[120px]">
            <p className="text-base leading-relaxed text-muted-foreground">
              {step.description}
            </p>

            {/* Pillars visual */}
            {step.id === "three-pillars" && (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  {
                    role: "Innovators",
                    desc: "Submit ideas, build ventures, track milestones",
                    color: "bg-amber-50 border-amber-200",
                    text: "text-amber-700",
                  },
                  {
                    role: "Mentors",
                    desc: "Share expertise, guide founders, review projects",
                    color: "bg-emerald-50 border-emerald-200",
                    text: "text-emerald-700",
                  },
                  {
                    role: "Investors",
                    desc: "Discover vetted projects, fund consciously",
                    color: "bg-indigo-50 border-indigo-200",
                    text: "text-indigo-700",
                  },
                ].map((pillar) => (
                  <div
                    key={pillar.role}
                    className={`rounded-lg border p-3 text-center ${pillar.color}`}
                  >
                    <p className={`text-xs font-bold uppercase ${pillar.text}`}>
                      {pillar.role}
                    </p>
                    <p className={`mt-1 text-xs ${pillar.text}`}>
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Feature icons for community step */}
            {step.id === "community" && (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {["Feed", "Groups", "Forums", "Events", "Galleries", "Workspaces"].map(
                  (feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {feature}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={close}>
                <SkipForward className="mr-1 h-3 w-3" />
                Skip
              </Button>
              {!isFirst && (
                <Button variant="outline" size="sm" onClick={prev}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              {isLast ? (
                <Button size="sm" onClick={close}>
                  Done
                </Button>
              ) : (
                <Button size="sm" onClick={next}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
