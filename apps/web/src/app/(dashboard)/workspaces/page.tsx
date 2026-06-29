"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/matches/?limit=100").catch(() => ({ items: [] })),
      api.get("/projects/?limit=100").catch(() => ({ items: [] })),
    ])
      .then(([matchesData, projectsData]: any[]) => {
        const matches = matchesData.items || [];
        const projects = projectsData.items || [];

        const acceptedMatchIds = new Set(
          matches
            .filter((m: any) => m.status === "accepted")
            .map((m: any) => m.project_id)
        );

        const userProjects = projects.filter(
          (p: any) =>
            p.innovator_id === user?.id || acceptedMatchIds.has(p.id)
        );

        const unique = Array.from(
          new Map(userProjects.map((p: any) => [p.id, p])).values()
        );

        setWorkspaces(unique);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Workspaces</h1>
        <p className="mt-1 text-muted-foreground">
          Access your active project workspaces
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No workspaces yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Accept a match to access a project workspace.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}/workspace`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.title}</h3>
                      {project.tagline && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {project.tagline}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="ml-2 mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary">{project.stage}</Badge>
                    <Badge
                      variant={
                        project.status === "active"
                          ? "success"
                          : project.status === "funded"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
