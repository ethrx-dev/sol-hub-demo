"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserCheck, ArrowLeft } from "lucide-react";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { FollowButton } from "@/src/components/shared/follow-button";
import { api } from "@/src/lib/api-client";

export default function ConnectionsPage() {
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ following: 0, followers: 0 });

  return (
    <FeatureGuard featureName="connections" fallback="/hub">
      <ConnectionsInner
        following={following}
        followers={followers}
        loading={loading}
        counts={counts}
        setFollowing={setFollowing}
        setFollowers={setFollowers}
        setLoading={setLoading}
        setCounts={setCounts}
      />
    </FeatureGuard>
  );
}

function ConnectionsInner({
  following,
  followers,
  loading,
  counts,
  setFollowing,
  setFollowers,
  setLoading,
  setCounts,
}: {
  following: any[];
  followers: any[];
  loading: boolean;
  counts: { following: number; followers: number };
  setFollowing: (v: any[]) => void;
  setFollowers: (v: any[]) => void;
  setLoading: (v: boolean) => void;
  setCounts: (v: { following: number; followers: number }) => void;
}) {

  useEffect(() => {
    Promise.all([
      api.get("/connections/following?limit=100"),
      api.get("/connections/followers?limit=100"),
      api.get("/connections/counts"),
    ]).then(([followingData, followersData, countsData]: any[]) => {
      setFollowing(followingData.items || []);
      setFollowers(followersData.items || []);
      setCounts(countsData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/hub"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hub
        </Link>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="mt-1 text-muted-foreground">
          {counts.following} following &middot; {counts.followers} followers
        </p>
      </div>

      <Tabs defaultValue="following">
        <TabsList>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Following ({counts.following})
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Followers ({counts.followers})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : following.length === 0 ? (
            <div className="py-12 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Not following anyone yet.</p>
              <Link href="/hub/members">
                <Button variant="outline" className="mt-4">
                  Find Members
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {following.map((user: any) => (
                <Link key={user.id} href={`/users/${user.id}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.bio || user.role}</p>
                      </div>
                      <FollowButton userId={user.id} initialFollowing={true} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : followers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No followers yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((user: any) => (
                <Link key={user.id} href={`/users/${user.id}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.bio || user.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
