"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { MentorSuggestionCard } from "@/src/components/shared/mentor-suggestion-card";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

export default function MentorSuggestionsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/projects/?limit=50")
      .then((data: any) => setProjects(data.items || []))
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  const loadSuggestions = (projectId: string) => {
    setSelectedProject(projectId);
    if (!projectId) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    api.get(`/matches/suggestions?project_id=${projectId}&role=mentor`)
      .then((data: any) => setSuggestions(data || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  };

  const requestMatch = async (mentorId: string) => {
    if (!selectedProject) return;
    setRequesting(mentorId);
    try {
      await api.post("/matches/", {
        project_id: selectedProject,
        mentor_id: mentorId,
      });
      toast.success("Match request sent!");
    } catch {
      toast.error("Failed to send match request");
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Your Mentor</h1>
        <p className="mt-1 text-muted-foreground">
          We suggest mentors based on your project, sector, and guided answers
        </p>
      </div>

      <div className="max-w-md">
        <label className="text-sm font-medium">Select a project</label>
        <Select value={selectedProject} onValueChange={loadSuggestions}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Choose a project"} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProject ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Lightbulb className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">Select a project to see suggestions</p>
          <p className="text-sm">We&apos;ll reflect the mentors whose contribution resonates with yours.</p>
        </div>
      ) : loadingSuggestions ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="mt-3 h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No mentor suggestions yet. Try a different project.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((s) => (
            <MentorSuggestionCard
              key={s.user_id}
              user={s}
              onRequestMatch={requestMatch}
              requesting={requesting === s.user_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
