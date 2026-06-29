"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Users, Image, Video, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ActivityFeed } from "@/src/components/shared/activity-feed";
import { PostModal } from "@/src/components/shared/post-modal";
import { api } from "@/src/lib/api-client";

export default function HubPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 10;

  const fetchPosts = async (append = false) => {
    try {
      const data: any = await api.get(`/feed/?skip=${append ? skip : 0}&limit=${limit}`);
      const mapped = (data.items || []).map((p: any) => ({
        id: p.id,
        authorName: p.author_name,
        authorAvatar: p.author_avatar,
        content: p.content,
        media: p.media_urls,
        likes: p.like_count,
        comments: p.comment_count,
        liked: p.is_liked,
        createdAt: p.created_at,
      }));
      setPosts(append ? (prev) => [...prev, ...mapped] : mapped);
      setTotal(data.total || 0);
      setSkip(append ? skip + limit : limit);
    } catch {
      // fall back
    } finally {
      setLoadingFeed(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data: any = await api.get("/groups/?limit=20");
      setGroups(data.items || []);
    } catch {
      // fall back
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => { fetchPosts(); fetchGroups(); }, []);

  const loadMore = () => fetchPosts(true);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Hub</h1>
        <PostModal onCreated={() => fetchPosts()} />
      </div>

      <Tabs defaultValue="feed">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="feed">
            <MessageSquare className="mr-2 h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Image className="mr-2 h-4 w-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="mr-2 h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <ActivityFeed posts={posts} loadMore={loadMore} hasMore={posts.length < total} loading={loadingFeed} />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <div className="mb-4 flex justify-end">
            <Link href="/hub/groups">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Browse All Groups
              </Button>
            </Link>
          </div>
          {loadingGroups ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-2 h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.slice(0, 4).map((group) => (
                <Link key={group.id} href={`/hub/groups/${group.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {group.member_count} members
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="py-12 text-center text-muted-foreground">
            <Link
              href="/hub/members"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Browse Member Directory
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <div className="py-12 text-center text-muted-foreground">
            No photos shared yet.
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <div className="py-12 text-center text-muted-foreground">
            No videos shared yet.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
