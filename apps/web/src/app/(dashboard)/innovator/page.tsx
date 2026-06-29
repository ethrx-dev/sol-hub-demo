"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/lib/auth";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";

export default function InnovatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeProjects: 0, matches: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/projects/?limit=100").catch(() => ({ items: [] })),
      api.get("/resources/?limit=100").catch(() => ({ items: [] })),
    ])
      .then(([projectsData, resourcesData]: any[]) => {
        const projects = projectsData.items || [];
        const resources = resourcesData.items || [];
        setStats({
          activeProjects: projects.filter((p: any) => p.status === "active" || p.status === "submitted").length,
          matches: projects.filter((p: any) => p.status === "funded" || p.status === "active").length,
          resources: resources.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
      </h1>
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
