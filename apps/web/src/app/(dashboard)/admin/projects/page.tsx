"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "sonner";

interface AdminProject {
  id: string;
  title: string;
  innovator_id: string;
  sector: string;
  stage: string;
  status: string;
  target_amount: number | null;
  created_at: string | null;
}

const STATUSES = ["draft", "submitted", "active", "funded", "completed", "cancelled"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await api.get<{ items: AdminProject[]; total: number }>("/admin/projects");
      setProjects(data.items);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const changeStatus = async (projectId: string, status: string) => {
    try {
      await api.patch(`/admin/projects/${projectId}/status`, { json: { status } });
      toast.success(`Status changed to ${status}`);
      fetchProjects();
    } catch {
      toast.error("Failed to change status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Projects</h1>
        <p className="mt-1 text-muted-foreground">Manage all project submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No projects found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Sector</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{project.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{project.sector}</td>
                      <td className="px-4 py-3 text-muted-foreground">{project.stage}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {project.target_amount ? `$${project.target_amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) changeStatus(project.id, e.target.value);
                            e.target.value = "";
                          }}
                          className="h-8 rounded border border-input bg-background px-2 text-xs"
                        >
                          <option value="" disabled>Change status...</option>
                          {STATUSES.filter((s) => s !== project.status).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
