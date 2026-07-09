"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MatchCard } from "@/src/components/shared/match-card";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/src/lib/api-client";

export default function InnovatorMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = () => {
    api.get("/matches/?limit=50")
      .then((data: any) => setMatches(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, []);

  const filterByStatus = (status: string) =>
    status === "all" ? matches : matches.filter((m) => m.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Matches</h1>
        <p className="mt-1 text-muted-foreground">
          See who is interested in your projects
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
                    viewerRole="innovator"
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
