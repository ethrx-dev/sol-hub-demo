"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ActivityFeed } from "@/src/components/shared/activity-feed";
import { PostModal } from "@/src/components/shared/post-modal";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function HubPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
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
          authorId: p.author_id,
          content: p.content,
          media: p.media_urls,
          likes: p.like_count,
          comments: p.comment_count,
          liked: p.is_liked,
          createdAt: p.created_at,
          privacy: p.privacy,
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

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoadingFeed(false);
      return;
    }
    fetchPosts();
  }, [isAuthenticated, authLoading]);

  const loadMore = () => fetchPosts(true);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold">Community Hub</h1>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold">Community Hub</h1>
        <div className="rounded-lg border bg-card p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">Sign in to access the hub</h2>
          <p className="mb-6 text-muted-foreground">Join the SOL Hub community to see posts, groups, and more.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Hub</h1>
        <PostModal onCreated={() => fetchPosts()} />
      </div>

      <ActivityFeed posts={posts} loadMore={loadMore} hasMore={posts.length < total} loading={loadingFeed} />
    </div>
  );
}
