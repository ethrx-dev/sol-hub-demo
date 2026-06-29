"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Check, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

interface GroupMember {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  visibility: string;
  member_count: number;
  members: GroupMember[];
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<GroupData>(`/groups/${id}`)
      .then((data) => {
        setGroup(data);
        if (user && data.members?.some((m) => m.user_id === user.id)) {
          setJoined(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleJoin = async () => {
    if (!user || !id) return;
    setJoining(true);
    try {
      await api.post(`/groups/${id}/join`);
      setJoined(true);
    } catch {
      setJoined(false);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-32" />
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-8 h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="py-12 text-center text-muted-foreground">Group not found.</p>
      </div>
    );
  }

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
            {group.member_count} members
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            {group.members?.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/users/${member.user_id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.full_name}</p>
                      <Badge variant="secondary" className="capitalize">
                        {member.role}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No members yet.</p>
            )}
          </CardContent>
        </Card>

        {user ? (
          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={joined || joining}
            variant={joined ? "secondary" : "default"}
          >
            {joining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : joined ? (
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
