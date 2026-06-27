"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "sonner";

interface AdminMatch {
  id: string;
  project_id: string;
  mentor_id: string | null;
  investor_id: string | null;
  status: string;
  notes: string | null;
  created_at: string | null;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await api.get<{ items: AdminMatch[]; total: number }>("/admin/matches");
      setMatches(data.items);
    } catch {
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Matches</h1>
        <p className="mt-1 text-muted-foreground">View all mentor/investor matches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Matches ({matches.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : matches.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No matches found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Project ID</th>
                    <th className="px-4 py-3 font-medium">Mentor ID</th>
                    <th className="px-4 py-3 font-medium">Investor ID</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{match.project_id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {match.mentor_id ? `${match.mentor_id.slice(0, 8)}...` : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {match.investor_id ? `${match.investor_id.slice(0, 8)}...` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {match.status}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                        {match.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {match.created_at ? new Date(match.created_at).toLocaleDateString() : "—"}
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
