"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/feed/posts/${id}`)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleLike = async () => {
    if (!post) return;
    try {
      const res: any = await api.post(`/feed/posts/${id}/like`, {});
      setPost({ ...post, is_liked: res.liked, like_count: post.like_count + (res.liked ? 1 : -1) });
    } catch {
      toast.error("Failed to toggle like");
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const newComment: any = await api.post(`/feed/posts/${id}/comments`, { content: commentText });
      setPost({
        ...post,
        comments: [...(post.comments || []), newComment],
        comment_count: (post.comment_count || 0) + 1,
      });
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground">Post not found.</p>
        <Link href="/hub" className="mt-4 block text-center text-sm text-primary hover:underline">
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/hub/feed"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Feed
      </Link>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback>
                {post.author_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap">{post.content}</p>

          {post.media_urls?.length > 0 && (
            <div className="mt-4 grid gap-2">
              {post.media_urls.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="max-h-96 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 transition-colors hover:text-primary ${
                post.is_liked ? "text-primary" : ""
              }`}
            >
              <Heart className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`} />
              {post.like_count || 0}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="mb-4 font-semibold">
          Comments ({post.comments?.length || 0})
        </h3>
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <Button size="sm" onClick={addComment} disabled={sending || !commentText.trim()}>
            {sending ? "Posting..." : "Post"}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {post.comments?.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            post.comments?.map((comment: any) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.author_avatar} />
                      <AvatarFallback className="text-xs">
                        {comment.author_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{comment.author_name}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
