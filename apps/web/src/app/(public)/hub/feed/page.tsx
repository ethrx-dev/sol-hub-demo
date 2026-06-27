"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActivityFeed } from "@/src/components/shared/activity-feed";
import { api } from "@/src/lib/api-client";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 20;

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
      // fall back to empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const loadMore = () => fetchPosts(true);

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
      <ActivityFeed posts={posts} loadMore={loadMore} hasMore={posts.length < total} loading={loading} />
    </div>
  );
}
