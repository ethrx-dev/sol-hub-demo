"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";

interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  media?: string[];
  likes: number;
  comments: number;
  liked: boolean;
  createdAt: string;
}

interface ActivityFeedProps {
  posts: Post[];
  loadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
}

export function ActivityFeed({ posts, loadMore, hasMore, loading }: ActivityFeedProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-3 h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <Link
          key={post.id}
          href={`/hub/feed/${post.id}`}
          ref={index === posts.length - 1 ? lastPostRef : null}
          className="block rounded-lg border bg-background p-4 transition-colors hover:border-primary/50"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback>
                {post.authorName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm">{post.content}</p>

          {post.media && post.media.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.media.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="rounded-md object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 border-t pt-3">
            <button
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                post.liked ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Heart className={cn("h-4 w-4", post.liked && "fill-current")} />
              {post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </button>
            <button className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </Link>
      ))}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}
