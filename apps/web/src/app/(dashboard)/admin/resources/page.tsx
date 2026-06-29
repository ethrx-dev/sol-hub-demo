"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface AdminResource {
  id: string;
  title: string;
  resource_type: string;
  author_name: string | null;
  is_published: boolean;
  created_at: string | null;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    try {
      const data = await api.get<{ items: AdminResource[]; total: number }>("/admin/resources");
      setResources(data.items);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Delete this resource? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/resources/${resourceId}`);
      toast.success("Resource deleted");
      fetchResources();
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Resources</h1>
        <p className="mt-1 text-muted-foreground">Manage all platform resources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Resources ({resources.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : resources.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No resources found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Published</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{resource.title}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                          {resource.resource_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {resource.author_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {resource.is_published ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
