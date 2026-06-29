"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, User, Clock, Tag, BookOpen, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blog/posts/${id}`)
      .then(setPost)
      .catch(() => router.push("/hub/blog"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const deletePost = async () => {
    try {
      await api.delete(`/blog/posts/${id}`);
      toast.success("Post deleted");
      router.push("/hub/blog");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-64 w-full" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const isOwner = user?.id === post.author_id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <article>
        {post.cover_image ? (
          <div className="mb-6 overflow-hidden rounded-[0_20px_0_20px]">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full object-cover max-h-96"
            />
          </div>
        ) : (
          <div className="mb-6 flex h-48 items-center justify-center rounded-[0_20px_0_20px] bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author_name}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{new Date(post.created_at).toLocaleDateString()}</span>
              {post.view_count > 0 && (
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{post.view_count} views</span>
              )}
              {post.category_name && <Badge variant="outline">{post.category_name}</Badge>}
            </div>
          </div>
          {isOwner && (
            <Button variant="destructive" size="sm" onClick={deletePost}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div
            className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  );
}
