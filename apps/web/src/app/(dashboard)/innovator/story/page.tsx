"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_review: { label: "Under Review", color: "text-yellow-600", icon: Clock },
  approved: { label: "Approved", color: "text-green-600", icon: CheckCircle },
  rejected: { label: "Needs Revision", color: "text-red-600", icon: XCircle },
};

export default function InnovatorStoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<{ id: string; content: string; review_status: string; review_notes: string | null } | null | "loading">("loading");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/blog/stories/my").then((data: any) => {
      if (data) {
        setStory(data);
        setContent(data.content);
      } else {
        setStory(null);
      }
    }).catch(() => setStory(null));
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please write your story before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.post<{ id: string; content: string; review_status: string; review_notes: string | null }>("/blog/stories", { content: content.trim() });
      setStory(data);
      toast.success("Story submitted for review!");
    } catch (e: any) {
      toast.error(e?.detail || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (story === "loading") {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-3xl font-bold font-heading">Your Story</h1>

      {story && STATUS_MAP[story.review_status] && (
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          {(() => {
            const status = STATUS_MAP[story.review_status];
            const Icon = status.icon;
            return (
              <>
                <Icon className={`h-6 w-6 ${status.color}`} />
                <div>
                  <p className={`font-medium ${status.color}`}>{status.label}</p>
                  {story.review_notes && (
                    <p className="text-sm text-muted-foreground mt-1">{story.review_notes}</p>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">What does regeneration mean to you?</label>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Share your vision, your journey, and what drives you to create change.
            </p>
            <textarea
              className="w-full min-h-[300px] rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell us your story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={story?.review_status === "pending_review" || story?.review_status === "approved"}
            />
          </div>

          {!story && (
            <Button onClick={handleSubmit} loading={submitting} className="w-full">
              Submit for Review
            </Button>
          )}

          {story?.review_status === "rejected" && (
            <Button onClick={handleSubmit} loading={submitting} className="w-full">
              Resubmit Story
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
