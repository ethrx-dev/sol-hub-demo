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
import { useAuth } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

const SECTORS = [
  "CleanTech", "HealthTech", "FinTech", "EdTech",
  "AgriTech", "AI/ML", "Blockchain", "SaaS",
];

const STAGES = ["Idea", "Prototype", "Early Traction", "Growth", "Scale"];

const MENTORSHIP_STYLES = ["One-on-One", "Group", "Asynchronous", "Mixed"];
const INVOLVEMENT_LEVELS = ["Passive", "Advisory", "Active", "Lead"];

const INVESTMENT_RANGES = [
  "Under $10k", "$10k - $50k", "$50k - $100k",
  "$100k - $500k", "$500k+",
];

export function OnboardingFlow() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.patch("/users/me", {
        onboarding_completed: true,
        skills: data.skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || undefined,
        sectors_of_interest: data.sector ? [data.sector] : undefined,
        bio: data.bio || undefined,
      });
      toast.success("Profile completed!");
      const dashboards: Record<string, string> = {
        innovator: "/innovator/projects",
        mentor: "/mentor/browse",
        investor: "/investor/browse",
        admin: "/admin",
      };
      router.push(dashboards[user?.role || ""] || "/");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const role = user.role;

  const renderRoleStep = () => {
    switch (role) {
      case "innovator":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Innovator Profile</h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">Primary Sector</label>
              <Select value={data.sector || ""} onValueChange={(v) => update("sector", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Current Stage</label>
              <Select value={data.stage || ""} onValueChange={(v) => update("stage", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Skills (comma separated)</label>
              <Input
                value={data.skills || ""}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="e.g., Product Management, UX Design, Python"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Business Plan Status</label>
              <Select
                value={data.businessPlan || ""}
                onValueChange={(v) => update("businessPlan", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Business Plan</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "mentor":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mentor Profile</h2>
            <Input
              label="Years of Experience"
              type="number"
              value={data.yearsExperience || ""}
              onChange={(e) => update("yearsExperience", e.target.value)}
              placeholder="e.g., 10"
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Mentorship Style</label>
              <Select
                value={data.mentorshipStyle || ""}
                onValueChange={(v) => update("mentorshipStyle", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {MENTORSHIP_STYLES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Availability</label>
              <Select
                value={data.availability || ""}
                onValueChange={(v) => update("availability", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">1-2 hours/month</SelectItem>
                  <SelectItem value="3-5">3-5 hours/month</SelectItem>
                  <SelectItem value="5-10">5-10 hours/month</SelectItem>
                  <SelectItem value="10+">10+ hours/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Expertise Areas (comma separated)"
              value={data.expertise || ""}
              onChange={(e) => update("expertise", e.target.value)}
              placeholder="e.g., Fundraising, Product Strategy, Marketing"
            />
          </div>
        );

      case "investor":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Investor Profile</h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">Investment Range</label>
              <Select
                value={data.investmentRange || ""}
                onValueChange={(v) => update("investmentRange", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_RANGES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Impact Focus</label>
              <Select
                value={data.impactFocus || ""}
                onValueChange={(v) => update("impactFocus", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Involvement Level</label>
              <Select
                value={data.involvement || ""}
                onValueChange={(v) => update("involvement", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {INVOLVEMENT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardContent className="p-6">
          {step === 1 && renderRoleStep()}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Video Introduction</h2>
              <p className="text-sm text-muted-foreground">
                Record or upload a short video introducing yourself and your interest in SOL Hub.
              </p>
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <Button variant="outline" className="mt-2" type="button">
                  Upload Video
                </Button>
              </div>
              <Input
                label="Or paste a video URL"
                value={data.videoUrl || ""}
                onChange={(e) => update("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep(2)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting}>
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
