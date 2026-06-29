"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface AdminGroup {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  member_count: number;
  creator_name: string | null;
  is_deleted: boolean;
  created_at: string | null;
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await api.get<{ items: AdminGroup[]; total: number }>("/admin/groups");
      setGroups(data.items);
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleDelete = async (groupId: string) => {
    if (!confirm("Delete this group? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/groups/${groupId}`);
      toast.success("Group deleted");
      fetchGroups();
    } catch {
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Groups</h1>
        <p className="mt-1 text-muted-foreground">Manage all community groups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Groups ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No groups found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Creator</th>
                    <th className="px-4 py-3 font-medium">Visibility</th>
                    <th className="px-4 py-3 font-medium">Members</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{group.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{group.creator_name || "—"}</td>
                      <td className="px-4 py-3 capitalize">{group.visibility}</td>
                      <td className="px-4 py-3">{group.member_count}</td>
                      <td className="px-4 py-3">
                        {group.is_deleted ? (
                          <span className="text-destructive">Deleted</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(group.id)}
                          disabled={group.is_deleted}
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
