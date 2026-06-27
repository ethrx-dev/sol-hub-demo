"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  membership_tier: string;
  created_at: string | null;
}

const ROLES = ["innovator", "mentor", "investor", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<{ items: AdminUser[]; total: number }>("/admin/users");
      setUsers(data.items);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { json: { role } });
      toast.success(`Role changed to ${role}`);
      fetchUsers();
    } catch {
      toast.error("Failed to change role");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Users</h1>
        <p className="mt-1 text-muted-foreground">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Tier</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{user.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.membership_tier}</td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-destructive">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) changeRole(user.id, e.target.value);
                            e.target.value = "";
                          }}
                          className="h-8 rounded border border-input bg-background px-2 text-xs"
                        >
                          <option value="" disabled>Change role...</option>
                          {ROLES.filter((r) => r !== user.role).map((r) => (
                            <option key={r} value={r}>{r}</option>
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
