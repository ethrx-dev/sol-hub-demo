"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { ArrowRight, BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_review: { label: "Under Review", color: "text-yellow-600", icon: Clock },
  approved: { label: "Approved", color: "text-green-600", icon: CheckCircle },
  rejected: { label: "Needs Revision", color: "text-red-600", icon: XCircle },
};

export default function InnovatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeProjects: 0, matches: 0, resources: 0 });
  const [story, setStory] = useState<{ review_status: string; review_notes: string | null } | null | "loading">("loading");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.get(`/projects/?limit=100&innovator_id=${user.id}`).catch(() => ({ items: [] })),
      api.get("/resources/?limit=100").catch(() => ({ items: [] })),
      api.get("/blog/stories/my").catch(() => null),
    ])
      .then(([projectsData, resourcesData, storyData]: any[]) => {
        const projects = projectsData.items || [];
        const resources = resourcesData.items || [];
        setStats({
          activeProjects: projects.filter((p: any) => p.status === "active" || p.status === "submitted").length,
          matches: projects.filter((p: any) => p.status === "funded" || p.status === "active").length,
          resources: resources.length,
        });
        setStory(storyData || null);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
      </h1>

      {/* Story prompt card */}
      {!loading && (
        <Card className={`border-l-4 ${!story ? "border-l-accent" : story.review_status === "approved" ? "border-l-green-500" : story.review_status === "rejected" ? "border-l-red-500" : "border-l-yellow-500"}`}>
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${!story ? "bg-accent/10" : "bg-muted"}`}>
                <BookOpen className={`h-6 w-6 ${!story ? "text-accent" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-bold font-heading">
                  {!story ? "Share Your Story" : STATUS_MAP[story.review_status]?.label || "Story"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {!story
                    ? "Tell us about your vision for regeneration. Your story helps us match you with the right mentors and investors."
                    : story.review_status === "pending_review"
                    ? "Your story is being reviewed by the SOL team."
                    : story.review_status === "approved"
                    ? "Your story was approved! You're now visible to potential mentors and investors."
                    : story.review_status === "rejected"
                    ? `Revision needed: ${story.review_notes || "Please revise and resubmit."}`
                    : "Complete your story to get started."}
                </p>
              </div>
            </div>
            <Link href="/innovator/story">
              <Button variant={!story ? "default" : "outline"} size="sm">
                {!story ? "Write Your Story" : "View Story"} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            {loading ? (
              <Skeleton className="mt-1 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold font-heading">{stats.activeProjects}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Matches</p>
            {loading ? (
              <Skeleton className="mt-1 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold font-heading">{stats.matches}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Resources</p>
            {loading ? (
              <Skeleton className="mt-1 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold font-heading">{stats.resources}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
