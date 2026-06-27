"use client";

import { useState } from "react";
import { MatchCard } from "@/src/components/shared/match-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { toast } from "sonner";

interface Match {
  id: string;
  projectTitle: string;
  projectTagline: string;
  matchedUserName: string;
  matchedUserAvatar?: string;
  matchedUserRole: string;
  status: "pending" | "accepted" | "declined" | "active";
}

const mockMatches: Match[] = [
  {
    id: "1",
    projectTitle: "GreenGrid AI",
    projectTagline: "AI-powered energy optimization for smart grids",
    matchedUserName: "Alex Rivera",
    matchedUserRole: "innovator",
    status: "pending",
  },
  {
    id: "2",
    projectTitle: "HealthBridge",
    projectTagline: "Telemedicine platform for rural communities",
    matchedUserName: "Sarah Chen",
    matchedUserRole: "innovator",
    status: "active",
  },
  {
    id: "3",
    projectTitle: "EduFuture",
    projectTagline: "Personalized learning paths powered by AI",
    matchedUserName: "James Wilson",
    matchedUserRole: "innovator",
    status: "accepted",
  },
];

export default function MentorMatchesPage() {
  const [matches, setMatches] = useState<Match[]>(mockMatches);

  const handleAccept = (id: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "accepted" as const } : m))
    );
    toast.success("Match accepted!");
  };

  const handleDecline = (id: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "declined" as const } : m))
    );
    toast.info("Match declined");
  };

  const filterByStatus = (status: string) =>
    status === "all" ? matches : matches.filter((m) => m.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Matches</h1>
        <p className="mt-1 text-muted-foreground">
          Review and manage your mentorship matches
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>
        {["all", "pending", "active", "accepted"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filterByStatus(tab).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No {tab === "all" ? "" : tab} matches.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filterByStatus(tab).map((match) => (
                  <MatchCard
                    key={match.id}
                    {...match}
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
