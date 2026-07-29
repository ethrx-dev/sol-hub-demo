"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

interface AssessmentResult {
  innovator_type: number;
  label: string;
  description: string;
  problem: string;
  solution: string;
  assistance: string;
}

const QUESTIONS = [
  {
    id: "problem_clarity",
    question: "How clearly can you describe the problem you want to solve?",
    options: [
      { value: 1, label: "I just feel something is wrong, but can't name it yet" },
      { value: 2, label: "I have a general sense of the problem area" },
      { value: 3, label: "I can describe the problem clearly" },
      { value: 4, label: "I know the exact problem and its root causes" },
    ],
  },
  {
    id: "solution_clarity",
    question: "How clear is your solution?",
    options: [
      { value: 1, label: "I have a vague idea of what might help" },
      { value: 2, label: "I have a general direction but no specifics" },
      { value: 3, label: "I have a specific solution in mind" },
      { value: 4, label: "I have a fully-developed solution ready" },
    ],
  },
  {
    id: "assistance_needed",
    question: "What kind of help do you need most right now?",
    options: [
      { value: "focus", label: "Help me focus and identify what the real problem is" },
      { value: "research", label: "Help me research possible solutions and approaches" },
      { value: "define", label: "Help me define and describe my solution clearly" },
      { value: "feasibility", label: "Help me build a feasibility study and business plan" },
      { value: "financing", label: "Help me find financing and funding options" },
    ],
  },
];

const TYPE_PROGRESSION = [
  { type: 1, label: "Explorer" },
  { type: 2, label: "Definer" },
  { type: 3, label: "Resolver" },
  { type: 4, label: "Implementer" },
];

export default function AssessPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role !== "innovator") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">This assessment is for innovators only.</p>
      </div>
    );
  }

  const currentQ = QUESTIONS[step];
  const isLastQuestion = step === QUESTIONS.length - 1;

  const handleAnswer = (value: number | string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await api.post<AssessmentResult>("/innovator/assess", {
        problem_clarity: answers.problem_clarity || 0,
        solution_clarity: answers.solution_clarity || 0,
        assistance_needed: answers.assistance_needed || "",
      });
      setResult(data);
      await refreshUser();
    } catch {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sage-light/40 via-background to-sage-light/20 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-heading">You Are a {result.label}</h1>
            <p className="text-muted-foreground">{result.description}</p>
            <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm space-y-1">
              <p><span className="font-medium">Problem:</span> {result.problem}</p>
              <p><span className="font-medium">Solution:</span> {result.solution}</p>
              <p><span className="font-medium">Assistance needed:</span> {result.assistance}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your journey</p>
              <div className="flex items-center justify-center gap-1 text-sm">
                {TYPE_PROGRESSION.map((t, i) => (
                  <div key={t.type} className="flex items-center gap-1">
                    <span className={`rounded-full px-3 py-1 ${
                      t.type === result.innovator_type
                        ? "bg-primary text-white font-bold"
                        : t.type < result.innovator_type
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {t.label}
                    </span>
                    {i < TYPE_PROGRESSION.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={() => router.push("/onboarding")}
              className="w-full"
              size="lg"
            >
              Continue to Onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sage-light/40 via-background to-sage-light/20 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {QUESTIONS.length}
            </span>
            <div className="flex gap-1">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="mt-6 text-xl font-bold font-heading">{currentQ.question}</h2>

          <div className="mt-6 space-y-2">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full rounded-lg border p-4 text-left text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined || submitting}
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting</>
              ) : isLastQuestion ? (
                "See My Type"
              ) : (
                <><span>Next</span> <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
