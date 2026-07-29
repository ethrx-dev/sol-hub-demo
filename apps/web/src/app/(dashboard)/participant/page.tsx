"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Users, BookOpen, Bell, ArrowRight, Camera, Sparkles, Lightbulb } from "lucide-react";
import VideoRecorder from "@/src/components/shared/VideoRecorder";

export default function ParticipantDashboard() {
  const { user, refreshUser } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  const [converting, setConverting] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">Welcome, {user?.full_name}</h1>
      <p className="text-muted-foreground">
        Explore the SOL community — connect, learn, and grow.
      </p>

      <Link href="/resonance">
        <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Meet Whitney — Resonance Steward</p>
              <p className="text-sm text-muted-foreground">
                Before anything is asked of you, you are invited to be met.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!showVideo && (
          <button onClick={() => setShowVideo(true)} className="text-left">
            <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
              <CardHeader>
                <Camera className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Record Your Intro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record a short video introducing yourself to the community.
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                  Start Recording <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </button>
        )}

        <Link href="/hub">
          <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Community Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse feeds, groups, forums, and events.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                Explore <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resources">
          <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access templates, guides, and learning materials.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                Browse <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications">
          <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
            <CardHeader>
              <Bell className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay up to date with community activity.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                View <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {showVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Record Your Intro</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoRecorder pillar="participants" />
            <button
              onClick={() => setShowVideo(false)}
              className="mt-3 text-sm text-muted-foreground hover:text-primary"
            >
              Done — back to dashboard
            </button>
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold font-heading">Ready for More?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to Innovator — submit a project, get matched with a mentor, and bring your idea to life.
            </p>
          </div>
          <button
            onClick={async () => {
              setConverting(true);
              try {
                await api.post("/users/me/change-role", { role: "innovator" });
                await refreshUser();
                window.location.href = "/assess";
              } catch {
                setConverting(false);
              }
            }}
            disabled={converting}
            className="btn-sol btn-sol-primary shrink-0 text-sm"
          >
            {converting ? "Upgrading..." : "Become an Innovator"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
