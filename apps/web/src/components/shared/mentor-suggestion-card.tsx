"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { getMentorTypeLabel, MentorType } from "@/src/lib/mentor/types";

interface MentorSuggestionCardProps {
  user: {
    user_id: string;
    full_name: string;
    avatar_url?: string | null;
    bio?: string | null;
    skills?: string[];
    sectors_of_interest?: string[];
    score: number;
    mentor_type?: string | null;
    onboarding_responses?: Record<string, unknown> | null;
  };
  onRequestMatch?: (userId: string) => void;
  requesting?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-green-500/10 text-green-600 border-green-500/20";
  if (score >= 40) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-gray-500/10 text-gray-600 border-gray-500/20";
}

export function MentorSuggestionCard({
  user,
  onRequestMatch,
  requesting,
}: MentorSuggestionCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const mentorLabel = user.mentor_type ? getMentorTypeLabel(user.mentor_type as MentorType) : null;

  // Build a human-readable "why" breakdown from available signals.
  const whyReasons: string[] = [];
  if (user.mentor_type) whyReasons.push(`Mentor type: ${mentorLabel}`);
  if (user.sectors_of_interest?.length)
    whyReasons.push(`Sector interest: ${user.sectors_of_interest.join(", ")}`);
  if (user.skills?.length) whyReasons.push(`Skills: ${user.skills.slice(0, 4).join(", ")}`);
  if (user.onboarding_responses?.guided_answers)
    whyReasons.push("Guided Q&A completed");

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>
              {user.full_name?.split(" ").map((n) => n[0]).join("") ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{user.full_name}</h3>
              {mentorLabel && (
                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {mentorLabel}
                </Badge>
              )}
            </div>
            {user.bio && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
            )}
            {user.sectors_of_interest?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {user.sectors_of_interest.slice(0, 4).map((s: string) => (
                  <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-center shrink-0">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold ${scoreColor(user.score)}`}>
              {user.score}
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground">match</span>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => setShowWhy((p) => !p)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Info className="h-3.5 w-3.5" />
            {showWhy ? "Hide" : "Why this match?"}
            {showWhy ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showWhy && (
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside rounded-md border bg-secondary/20 p-3">
              {whyReasons.length ? (
                whyReasons.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <li>Basic profile compatibility</li>
              )}
            </ul>
          )}
        </div>

        {onRequestMatch && (
          <Button
            size="sm"
            className="mt-4 w-full"
            onClick={() => onRequestMatch(user.user_id)}
            disabled={requesting}
          >
            {requesting ? "Requesting..." : "Request Match"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
