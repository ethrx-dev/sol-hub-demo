"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import VideoRecorder from "@/src/components/shared/VideoRecorder";
import { useTourStore } from "@/src/stores/tour-store";
import { Compass } from "lucide-react";

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

const PILLAR_LABELS: Record<string, string> = {
  innovator: "Innovator",
  mentor: "Mentor",
  investor: "Conscious Investor",
  participant: "Participant",
};

const PILLAR_MAP: Record<string, "innovators" | "mentors" | "investors"> = {
  innovator: "innovators",
  mentor: "mentors",
  investor: "investors",
};

const WELCOME_STEPS = [
  { title: "Explore the Hub", desc: "Connect with innovators, mentors, and investors in the community feed, groups, and forums." },
  { title: "Find Your Match", desc: "Get paired with the right people based on your goals and expertise." },
  { title: "Build & Grow", desc: "Access workspaces, track milestones, and bring your vision to life." },
];

export function OnboardingFlow() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      if (role === "innovator" && data.story) {
        await api.post("/blog/stories", { content: data.story }).catch(() => {});
      }
      await api.patch("/users/me", {
        onboarding_completed: true,
        skills: data.skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || undefined,
        sectors_of_interest: data.sector ? [data.sector] : undefined,
        bio: data.bio || undefined,
      });
      await refreshUser();
      toast.success("Welcome to SOL!");
      const dashboards: Record<string, string> = {
        innovator: "/innovator/projects",
        mentor: "/mentor/browse",
        investor: "/investor/browse",
        participant: "/participant",
        admin: "/admin",
      };
      router.push(dashboards[user?.role || ""] || "/");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const role = user.role;

  const totalSteps = role === "innovator" ? 6 : 5;

  return (
    <div className="mx-auto max-w-lg">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{(
            role === "innovator"
              ? ["Welcome", "Your Role", "Record Video", "Profile", "Your Story", "All Set"]
              : ["Welcome", "Your Role", "Record Video", "Profile", "All Set"]
          )[step - 1]}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-2">
                <img src="/sol-icon.svg" alt="SOL" className="h-14 w-14" />
              </div>
              <h2 className="text-2xl font-bold font-heading">Welcome to SOL!</h2>
              <p className="text-sm text-muted-foreground">
                You&apos;re now a Private Member of Spaces of Learning. Here&apos;s what you can do:
              </p>
              <div className="space-y-3 text-left mt-4">
                {WELCOME_STEPS.map((s, i) => (
                  <div key={s.title} className="flex items-start gap-3 rounded-lg border bg-sage-light/20 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Your Role */}
          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary font-heading">
                    {role === "innovator" ? "I" : role === "mentor" ? "M" : role === "investor" ? "CI" : "P"}
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold font-heading">You Joined as a {PILLAR_LABELS[role]}</h2>
              <p className="text-sm text-muted-foreground">
                {role === "innovator"
                  ? "You'll submit ideas, get matched with mentors and investors, and track your project milestones."
                  : role === "mentor"
                  ? "You'll browse projects, share your expertise, and guide the next generation of entrepreneurs."
                  : role === "investor"
                  ? "You'll discover vetted projects, invest consciously, and track your portfolio."
                  : "You'll explore the hub, connect with the community, and access SOL resources."}
              </p>
            </div>
          )}

          {/* Step 3: Record Video */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-heading">Introduce Yourself</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Record a 90-second video answering 3 questions about your journey.
                </p>
              </div>
              <VideoRecorder pillar={PILLAR_MAP[role] || "innovators"} />
            </div>
          )}

          {/* Step 4: Profile */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-heading">Complete Your Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Help others find and connect with you.
                </p>
              </div>
              {role === "innovator" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Primary Sector</label>
                    <Select value={data.sector || ""} onValueChange={(v) => update("sector", v)}>
                      <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Current Stage</label>
                    <Select value={data.stage || ""} onValueChange={(v) => update("stage", v)}>
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input label="Skills (comma separated)" value={data.skills || ""} onChange={(e) => update("skills", e.target.value)} placeholder="e.g., Product Management, UX Design, Python" />
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Business Plan</label>
                    <Select value={data.businessPlan || ""} onValueChange={(v) => update("businessPlan", v)}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Business Plan</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {role === "mentor" && (
                <>
                  <Input label="Years of Experience" type="number" value={data.yearsExperience || ""} onChange={(e) => update("yearsExperience", e.target.value)} placeholder="e.g., 10" />
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Mentorship Style</label>
                    <Select value={data.mentorshipStyle || ""} onValueChange={(v) => update("mentorshipStyle", v)}>
                      <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                      <SelectContent>
                        {MENTORSHIP_STYLES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input label="Expertise (comma separated)" value={data.expertise || ""} onChange={(e) => update("expertise", e.target.value)} placeholder="e.g., Fundraising, Product Strategy" />
                </>
              )}
              {role === "investor" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Investment Range</label>
                    <Select value={data.investmentRange || ""} onValueChange={(v) => update("investmentRange", v)}>
                      <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_RANGES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Impact Focus</label>
                    <Select value={data.impactFocus || ""} onValueChange={(v) => update("impactFocus", v)}>
                      <SelectTrigger><SelectValue placeholder="Select focus" /></SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Involvement Level</label>
                    <Select value={data.involvement || ""} onValueChange={(v) => update("involvement", v)}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {INVOLVEMENT_LEVELS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {role === "participant" && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  You can update your profile details later from your settings.
                </div>
              )}
            </div>
          )}

          {/* Step 5: Your Story (innovator only) */}
          {step === 5 && role === "innovator" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-heading">Share Your Story</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  What does regeneration mean to you? Tell us about your vision, your journey,
                  and what drives you to create change.
                </p>
              </div>
              <textarea
                className="w-full min-h-[200px] rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share your story..."
                value={data.story || ""}
                onChange={(e) => update("story", e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-center">
                Your story will be reviewed by the SOL team. This helps us match you with the right mentors and investors.
              </p>
            </div>
          )}

          {/* Step 5/6: All Set */}
          {((step === 5 && role !== "innovator") || (step === 6 && role === "innovator")) && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-3xl font-bold text-primary">&#10003;</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold font-heading">You&apos;re All Set!</h2>
              <p className="text-sm text-muted-foreground">
                Welcome to the SOL community. Here are some places to start:
              </p>
              <div className="space-y-2 text-left mt-4">
                <Link href="/hub" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-sage-light/20 transition-colors">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">H</span>
                  <div>
                    <p className="text-sm font-medium">Explore the Hub</p>
                    <p className="text-xs text-muted-foreground">Feeds, groups, forums, events, and more</p>
                  </div>
                </Link>
                <Link href={role === "innovator" ? "/innovator/projects" : role === "mentor" ? "/mentor/browse" : role === "investor" ? "/investor/browse" : "/participant"} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-sage-light/20 transition-colors">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">D</span>
                  <div>
                    <p className="text-sm font-medium">Visit Your Dashboard</p>
                    <p className="text-xs text-muted-foreground">Manage projects, matches, and settings</p>
                  </div>
                </Link>
                <Link href="/resources" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-sage-light/20 transition-colors">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">R</span>
                  <div>
                    <p className="text-sm font-medium">Browse Resources</p>
                    <p className="text-xs text-muted-foreground">Templates, guides, and learning materials</p>
                  </div>
                </Link>
                <button
                  onClick={() => useTourStore.getState().open()}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-sage-light/20 transition-colors text-left"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    <Compass className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Take a Product Tour</p>
                    <p className="text-xs text-muted-foreground">Explore all features with a guided walkthrough</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleComplete} loading={submitting}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
