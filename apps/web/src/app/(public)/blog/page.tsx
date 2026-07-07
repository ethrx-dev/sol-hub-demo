"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  published_at: string | null;
  created_at: string;
  tags: string;
  category_name: string | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/blog/posts?status=published&limit=50`)
      .then((r) => r.json())
      .then((data) => setPosts(data.items || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const displayPosts = posts;

  return (
    <>
      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <img src="/about-icon.svg" alt="" className="h-16 w-16" />
          </div>
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
            Our Blog
          </h2>
          <h2 className="mt-4 text-[2.6rem] font-bold font-heading leading-[1.1em] text-foreground">
            Stories &amp; Ideas
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Thoughts on entrepreneurship, regeneration, and building a better future.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-muted-foreground py-20">Loading posts...</div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              No posts published yet. Check back soon!
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white shadow-lg overflow-hidden transition-shadow hover:shadow-xl"
                  style={{ borderRadius: "0 30px 0 30px" }}
                >
                  {post.cover_image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Calendar className="h-3 w-3" />
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })
                        : new Date(post.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })}
                    </p>
                    <h3 className="text-lg font-bold font-heading leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read More <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
