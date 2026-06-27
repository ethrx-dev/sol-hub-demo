"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

const SECTORS = [
  "CleanTech",
  "HealthTech",
  "FinTech",
  "EdTech",
  "AgriTech",
  "AI/ML",
  "Blockchain",
  "SaaS",
];

const STAGES = [
  "Idea",
  "Prototype",
  "Early Traction",
  "Growth",
  "Scale",
];

const STEPS = [
  { number: 1, title: "Basic Info" },
  { number: 2, title: "Stage & Funding" },
  { number: 3, title: "Video Pitch" },
  { number: 4, title: "Review & Submit" },
];

interface FormData {
  title: string;
  tagline: string;
  description: string;
  sector: string;
  stage: string;
  fundingGoal: string;
  videoUrl: string;
}

export function SubmissionWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<FormData>({
    title: "",
    tagline: "",
    description: "",
    sector: "",
    stage: "",
    fundingGoal: "",
    videoUrl: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (s === 1) {
      if (!data.title.trim()) newErrors.title = "Title is required";
      if (!data.tagline.trim()) newErrors.tagline = "Tagline is required";
      if (!data.description.trim()) newErrors.description = "Description is required";
      if (!data.sector) newErrors.sector = "Select a sector";
    }
    if (s === 2) {
      if (!data.stage) newErrors.stage = "Select a stage";
      if (!data.fundingGoal || Number(data.fundingGoal) <= 0)
        newErrors.fundingGoal = "Enter a valid funding goal";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const stageMap: Record<string, string> = {
    "Idea": "idea",
    "Prototype": "prototype",
    "Early Traction": "early_traction",
    "Growth": "growth",
    "Scale": "scale",
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/projects/", {
        json: {
          title: data.title,
          tagline: data.tagline,
          description: data.description,
          sector: data.sector,
          stage: stageMap[data.stage] || data.stage.toLowerCase().replace(/\s+/g, "_"),
          target_amount: Number(data.fundingGoal) || null,
          video_url: data.videoUrl || null,
          team_members: [],
          budget_breakdown: {},
        },
      });
      toast.success("Project submitted for review!");
      router.push("/innovator/projects");
    } catch {
      toast.error("Failed to submit project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  step > s.number
                    ? "bg-primary text-primary-foreground"
                    : step === s.number
                    ? "border-2 border-primary text-primary"
                    : "border-2 border-muted text-muted-foreground"
                )}
              >
                {step > s.number ? "✓" : s.number}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden h-0.5 w-16 sm:block sm:w-24",
                    step > s.number ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 hidden justify-between sm:flex">
          {STEPS.map((s) => (
            <span
              key={s.number}
              className={cn(
                "text-xs",
                step === s.number
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {s.title}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <Input
                label="Project Title"
                value={data.title}
                onChange={(e) => update("title", e.target.value)}
                error={errors.title}
                placeholder="Enter your project name"
              />
              <Input
                label="Tagline"
                value={data.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                error={errors.tagline}
                placeholder="One-line summary of your project"
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe your project..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Sector</label>
                <Select
                  value={data.sector}
                  onValueChange={(v) => update("sector", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sector && (
                  <p className="text-sm text-destructive">{errors.sector}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Stage & Funding</h2>
              <div className="space-y-1">
                <label className="text-sm font-medium">Current Stage</label>
                <Select
                  value={data.stage}
                  onValueChange={(v) => update("stage", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stage && (
                  <p className="text-sm text-destructive">{errors.stage}</p>
                )}
              </div>
              <Input
                label="Funding Goal ($)"
                type="number"
                min={0}
                value={data.fundingGoal}
                onChange={(e) => update("fundingGoal", e.target.value)}
                error={errors.fundingGoal}
                placeholder="e.g., 50000"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Video Pitch</h2>
              <p className="text-sm text-muted-foreground">
                Upload a video pitch (YouTube or Vimeo link) or record one directly.
              </p>
              <Input
                label="Video URL"
                value={data.videoUrl}
                onChange={(e) => update("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Or drag and drop a video file here
                </p>
                <Button variant="outline" className="mt-2" type="button">
                  Upload Video
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Review & Submit</h2>
              <div className="space-y-3 rounded-lg bg-secondary/50 p-4">
                <div>
                  <span className="text-xs text-muted-foreground">Title</span>
                  <p className="text-sm font-medium">{data.title}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Tagline</span>
                  <p className="text-sm">{data.tagline}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Description</span>
                  <p className="text-sm">{data.description}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Sector</span>
                  <p className="text-sm">{data.sector}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Stage</span>
                  <p className="text-sm">{data.stage}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Funding Goal</span>
                  <p className="text-sm">
                    ${Number(data.fundingGoal).toLocaleString()}
                  </p>
                </div>
                {data.videoUrl && (
                  <div>
                    <span className="text-xs text-muted-foreground">Video Pitch</span>
                    <p className="text-sm truncate">{data.videoUrl}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prev}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={next}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting}>
                {submitting ? "Submitting..." : "Submit Project"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
