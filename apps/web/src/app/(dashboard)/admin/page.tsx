"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";
import { Card, CardContent } from "@/src/components/ui/card";

interface Stats {
  total_users: number;
  total_projects: number;
  total_matches: number;
  active_projects: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="mt-1 text-3xl font-bold font-heading">{stats?.total_users ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="mt-1 text-3xl font-bold font-heading">{stats?.active_projects ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Matches</p>
            <p className="mt-1 text-3xl font-bold font-heading">{stats?.total_matches ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="mt-1 text-3xl font-bold font-heading">
              {stats ? `$${stats.revenue.toLocaleString()}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
