"use client";

import { useState, useEffect } from "react";
import { FolderKanban, Video, Users, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { getMentorTypeLabel } from "@/src/lib/mentor/types";

const PILLAR_LABELS: Record<string, string> = {
  innovators: "Innovator",
  mentors: "Mentor",
  investors: "Conscious Investor",
};

const PILLAR_COLORS: Record<string, string> = {
  innovators: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mentors: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  investors: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function AdminPillarSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetch = async (pillar?: string) => {
    setLoading(true);
    try {
      const params = pillar ? `?pillar=${pillar}` : "";
      const data: any = await api.get(`/pillars/submissions${params}`);
      setSubmissions(data.items || []);
      const statsData: any = await api.get("/pillars/stats");
      setStats(statsData);
    } catch {
      setSubmissions([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Pillar Submissions</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Video introductions submitted by innovators, mentors, and investors
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {Object.entries(PILLAR_LABELS).map(([key, label]) => (
          <div key={key} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats[key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        {["", ...Object.keys(PILLAR_LABELS)].map((p) => (
          <Button
            key={p}
            variant={filter === p ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(p); setPlaying(null); fetch(p || undefined); }}
          >
            {p ? PILLAR_LABELS[p] : "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Video className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No submissions</p>
          <p className="text-sm">No video introductions have been submitted yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((s) => {
            const mentorLabel = s.mentorType ? getMentorTypeLabel(s.mentorType) : null;
            const guidedAnswers =
              s.onboardingResponses?.guided_answers ||
              s.roleSpecificData?.guided_answers ||
              null;
            const isExpanded = expanded === s.id;

            return (
              <div key={s.id} className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="relative bg-black">
                  {playing === s.id && s.storageUrl ? (
                    <video
                      src={s.storageUrl}
                      controls
                      playsInline
                      className="w-full aspect-[4/3] object-contain"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted relative">
                      <Video className="h-12 w-12 text-muted-foreground/40" />
                      {s.storageUrl && (
                        <button
                          onClick={() => setPlaying(s.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 shadow-lg group-hover:bg-primary transition-colors">
                            <Play className="h-6 w-6 text-white ml-0.5" />
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${PILLAR_COLORS[s.pillar] || ""}`}>
                      {PILLAR_LABELS[s.pillar] || s.pillar}
                    </Badge>
                    {mentorLabel && (
                      <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
                        {mentorLabel}
                      </Badge>
                    )}
                    {s.userName && (
                      <span className="text-sm font-medium">{s.userName}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A"}
                    {" · "}
                    {(s.videoSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {s.userEmail && (
                    <p className="text-xs text-muted-foreground truncate">{s.userEmail}</p>
                  )}

                  {mentorLabel && guidedAnswers && Object.keys(guidedAnswers).length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleExpand(s.id)}
                        className="flex w-full items-center justify-between rounded-md border bg-secondary/30 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <span>View Guided Answers ({Object.keys(guidedAnswers).length})</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 space-y-2 rounded-md border bg-secondary/20 p-3">
                          {Object.entries(guidedAnswers).map(([key, val], i) => (
                            <div key={key} className="text-xs">
                              <p className="font-medium text-foreground">Q{i + 1}</p>
                              <p className="text-muted-foreground whitespace-pre-wrap">{String(val)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
