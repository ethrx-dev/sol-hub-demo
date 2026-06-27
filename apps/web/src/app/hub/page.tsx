"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Users, Image, Video, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ActivityFeed } from "@/src/components/shared/activity-feed";

const mockPosts = [
  {
    id: "1",
    authorName: "Alex Rivera",
    authorAvatar: "",
    content: "Just hit our first milestone on GreenGrid AI! Thanks to our mentor for the guidance.",
    likes: 12,
    comments: 4,
    liked: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    authorName: "Sarah Chen",
    authorAvatar: "",
    content: "Looking for a co-founder with experience in healthcare regulation. Anyone interested?",
    likes: 8,
    comments: 6,
    liked: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const mockGroups = [
  { id: "1", name: "CleanTech Innovators", members: 24, description: "For founders building in clean technology" },
  { id: "2", name: "Women in Tech", members: 18, description: "Supporting women entrepreneurs" },
  { id: "3", name: "AI/ML Founders", members: 31, description: "AI and machine learning startups" },
];

export default function HubPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [hasMore, setHasMore] = useState(false);

  const loadMore = () => {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Hub</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
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
          <ActivityFeed posts={posts} loadMore={loadMore} hasMore={hasMore} />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <div className="mb-4 flex justify-end">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mockGroups.map((group) => (
              <Link key={group.id} href={`/hub/groups/${group.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {group.members} members
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
