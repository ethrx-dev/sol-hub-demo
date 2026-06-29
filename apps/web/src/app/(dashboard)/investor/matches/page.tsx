"use client";

import { useState, useEffect } from "react";
import { MatchCard } from "@/src/components/shared/match-card";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/src/lib/api-client";

export default function InvestorMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = () => {
    api.get("/matches/?limit=50")
      .then((data: any) => setMatches(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.patch(`/matches/${id}`, { status: "accepted" });
      setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status: "accepted" } : m)));
      toast.success("Match accepted!");
    } catch {
      toast.error("Failed to accept match");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.patch(`/matches/${id}`, { status: "declined" });
      setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status: "declined" } : m)));
      toast.info("Match declined");
    } catch {
      toast.error("Failed to decline match");
    }
  };

  const filterByStatus = (status: string) =>
    status === "all" ? matches : matches.filter((m) => m.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Matches</h1>
        <p className="mt-1 text-muted-foreground">
          Review and manage your investment matches
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>
        {["all", "pending", "accepted"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="mt-2 h-4 w-full" />
                      <Skeleton className="mt-3 h-10 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filterByStatus(tab).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No {tab === "all" ? "" : tab} matches.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filterByStatus(tab).map((match) => (
                  <MatchCard
                    key={match.id}
                    id={match.id}
                    projectTitle={match.project_title || "Unknown Project"}
                    projectTagline=""
                    matchedUserName={match.matched_user_name || "Unknown"}
                    matchedUserAvatar={match.matched_user_avatar}
                    matchedUserRole={match.matched_user_role || ""}
                    status={match.status}
                    onAccept={() => handleAccept(match.id)}
                    onDecline={() => handleDecline(match.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
