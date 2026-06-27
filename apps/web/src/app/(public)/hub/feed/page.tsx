"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  {
    id: "3",
    authorName: "James Wilson",
    authorAvatar: "",
    content: "Excited to announce that EduFuture has been accepted into the SOL Hub program!",
    likes: 24,
    comments: 10,
    liked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function FeedPage() {
  const [posts] = useState(mockPosts);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/hub"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Hub
      </Link>

      <h1 className="text-3xl font-bold mb-6">Feed</h1>
      <ActivityFeed posts={posts} loadMore={() => {}} hasMore={false} />
    </div>
  );
}
