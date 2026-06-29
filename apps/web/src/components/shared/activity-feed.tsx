"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

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
  const [localPosts, setLocalPosts] = useState(posts);
  const [commentOpen, setCommentOpen] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

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

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      await api.post(`/feed/posts/${postId}/like`, {});
    } catch {
      setLocalPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setSubmitting((prev) => ({ ...prev, [postId]: true }));
    try {
      await api.post(`/feed/posts/${postId}/comments`, { content: text });
      setLocalPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p))
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  if (loading && localPosts.length === 0) {
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

  if (localPosts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localPosts.map((post, index) => (
        <div
          key={post.id}
          ref={index === localPosts.length - 1 ? lastPostRef : null}
          className="rounded-lg border bg-background p-4"
        >
          <Link href={`/hub/feed/${post.id}`} className="block">
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
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={(e) => handleLike(e, post.id)}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                post.liked ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Heart className={cn("h-4 w-4", post.liked && "fill-current")} />
              {post.likes}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCommentOpen((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {commentOpen[post.id] && (
            <div className="mt-3 flex items-center gap-2 border-t pt-3">
              <input
                value={commentText[post.id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                placeholder="Write a comment..."
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleComment(post.id);
                }}
              />
              <button
                onClick={() => handleComment(post.id)}
                disabled={submitting[post.id] || !commentText[post.id]?.trim()}
                className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
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
