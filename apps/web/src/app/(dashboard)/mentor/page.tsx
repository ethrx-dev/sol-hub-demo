"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/lib/auth";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";

export default function MentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeMatches: 0, projectsReviewed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/matches/?limit=100").catch(() => ({ items: [] })),
    ])
      .then(([matchesData]: any[]) => {
        const matches = matchesData.items || [];
        setStats({
          activeMatches: matches.filter((m: any) => m.status === "accepted").length,
          projectsReviewed: matches.length,
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
            <p className="text-sm text-muted-foreground">Active Matches</p>
            {loading ? (
              <Skeleton className="mt-1 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold font-heading">{stats.activeMatches}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Projects Reviewed</p>
            {loading ? (
              <Skeleton className="mt-1 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold font-heading">{stats.projectsReviewed}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
            {loading ? (
              <Skeleton className="mt-1 h-9 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-bold font-heading">0</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
