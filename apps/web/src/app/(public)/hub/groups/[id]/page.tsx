"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

const group = {
  id: "1",
  name: "CleanTech Innovators",
  description:
    "A group for founders building in the clean technology space. Share resources, ask questions, and connect with fellow clean tech entrepreneurs.",
  members: 24,
  recentMembers: [
    { name: "Alex Rivera", role: "Innovator" },
    { name: "Sarah Chen", role: "Innovator" },
    { name: "Mike Johnson", role: "Mentor" },
  ],
};

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  use(params);
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post(`/groups/${group.id}/join`);
      setJoined(true);
    } catch {
      // already a member or error
      setJoined(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/hub/groups"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Groups
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="mt-2 text-muted-foreground">{group.description}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {group.members} members
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.recentMembers.map((member, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <Badge variant="secondary" className="capitalize">
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {user ? (
          <Button
            className="w-full"
            onClick={handleJoin}
            loading={loading}
            disabled={joined}
            variant={joined ? "secondary" : "default"}
          >
            {joined ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Joined
              </>
            ) : (
              "Join Group"
            )}
          </Button>
        ) : (
          <Link href="/login">
            <Button className="w-full" variant="outline">
              Sign in to join this group
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
