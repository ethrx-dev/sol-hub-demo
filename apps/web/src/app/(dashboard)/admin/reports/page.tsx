"use client";

import { useState, useEffect } from "react";
import { Shield, Check, X, Clock, Flag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { api } from "@/src/lib/api-client";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewed: "bg-green-500/10 text-green-500 border-green-500/20",
  dismissed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetch = async (status?: string) => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const data: any = await api.get(`/reports${params}`);
      setReports(data.items || []);
    } catch {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/reports/${id}`, { status });
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      // silent
    }
  };

  return (
    <FeatureGuard featureName="reporting" fallback="/dashboard">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <div className="flex gap-2">
            {["", "pending", "reviewed", "dismissed"].map((s) => (
              <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => { setFilter(s); fetch(s || undefined); }}>
                {s || "All"}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-800" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Flag className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No reports</p>
            <p className="text-sm">No content has been reported yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-100">{r.reporter_name}</span>
                      <span className="text-xs text-gray-500">reported</span>
                      <Badge variant="outline" className="text-xs">{r.target_type}</Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[r.status] || ""}`}>{r.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">
                      <strong>Reason:</strong> {r.reason}
                    </p>
                    {r.description && (
                      <p className="mt-1 text-sm text-gray-400">{r.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "reviewed")} title="Mark reviewed">
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "dismissed")} title="Dismiss">
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FeatureGuard>
  );
}
