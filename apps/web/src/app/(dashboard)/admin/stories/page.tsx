"use client";

import { useState, useEffect } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  author_name: string;
  review_status: string;
  review_notes: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: "outline" | "secondary" | "default" | "destructive" }> = {
  pending_review: { label: "Pending Review", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const fetchStories = () => {
    const params = filter ? `?review_status=${filter}` : "";
    api.get(`/admin/stories${params}`).then((data: any) => {
      setStories(data.items || []);
    }).catch(() => {
      toast.error("Failed to load stories");
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStories(); }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/stories/${id}/approve`);
      toast.success("Story approved!");
      setExpandedId(null);
      fetchStories();
    } catch {
      toast.error("Failed to approve story");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNote.trim()) {
      toast.error("Please provide feedback notes");
      return;
    }
    try {
      await api.post(`/admin/stories/${id}/reject`, { notes: rejectNote.trim() });
      toast.success("Feedback sent to innovator");
      setExpandedId(null);
      setRejectNote("");
      fetchStories();
    } catch {
      toast.error("Failed to reject story");
    }
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">Story Reviews</h1>
        <div className="flex gap-2">
          {[null, "pending_review", "approved", "rejected"].map((f) => (
            <Button
              key={f || "all"}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f ? f.replace("_", " ") : "All"}
            </Button>
          ))}
        </div>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No stories found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => {
            const statusInfo = STATUS_BADGE[story.review_status] || STATUS_BADGE.pending_review;
            const isExpanded = expandedId === story.id;
            return (
              <Card key={story.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-bold font-heading text-lg truncate">{story.title}</p>
                      <p className="text-sm text-muted-foreground">by {story.author_name}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : story.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {story.review_status === "pending_review" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(story.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setExpandedId(story.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                        {story.content}
                      </div>

                      {story.review_notes && (
                        <div className="p-3 rounded-lg bg-muted/30 text-sm">
                          <p className="font-medium mb-1">Review Notes:</p>
                          <p className="text-muted-foreground">{story.review_notes}</p>
                        </div>
                      )}

                      {story.review_status === "pending_review" && (
                        <div className="space-y-2">
                          <textarea
                            className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Feedback notes for the innovator..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(story.id)}
                            >
                              Send Feedback & Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(story.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
