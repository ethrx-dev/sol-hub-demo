"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  author_avatar: string | null;
  published_at: string | null;
  created_at: string;
  tags: string | string[];
  category_name: string | null;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/blog/posts/by-slug/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold font-heading">Post not found</h1>
        <p className="mt-2 text-muted-foreground">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/blog" className="mt-6 text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {post.cover_image && (
          <div className="mt-6 aspect-[16/9] overflow-hidden rounded-[0_30px_0_30px]">
            <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author_name}
          </span>
          {post.category_name && (
            <span className="bg-accent/20 text-accent-foreground px-2 py-0.5 rounded text-xs">
              {post.category_name}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-[2.2rem] font-bold font-heading leading-[1.1em] text-foreground">
          {post.title}
        </h1>

        {post.tags && (() => {
          const tagList = Array.isArray(post.tags) ? post.tags : post.tags.split(",").filter(Boolean);
          return (
            <div className="mt-4 flex flex-wrap gap-2">
              {tagList.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          );
        })()}

        <div
          className="mt-8 prose prose-lg max-w-none text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </section>
  );
}
