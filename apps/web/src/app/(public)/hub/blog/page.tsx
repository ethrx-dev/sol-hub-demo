"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Plus, Eye, User, Clock, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { api } from "@/src/lib/api-client";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 12;

  const fetchPosts = async (append = false) => {
    try {
      const params = new URLSearchParams({ skip: append ? String(skip) : "0", limit: String(limit) });
      if (categoryFilter) params.set("category_id", categoryFilter);
      if (search) params.set("search", search);
      const data: any = await api.get(`/blog/posts?${params}`);
      if (append) {
        setPosts((prev) => [...prev, ...(data.items || [])]);
      } else {
        setPosts(data.items || []);
      }
      setTotal(data.total || 0);
      setSkip(append ? skip + limit : limit);
    } catch {
      // fall back
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchPosts(),
      api.get("/blog/categories").then((data: any) => setCategories(data)).catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    setLoading(true);
    setSkip(0);
    fetchPosts();
  }, [categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSkip(0);
    fetchPosts();
  };

  const loadMore = () => {
    setLoadingMore(true);
    fetchPosts(true);
  };

  return (
    <FeatureGuard featureName="blog" fallback="/hub">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Blog</h1>
              <p className="mt-1 text-muted-foreground">Read articles and tutorials</p>
            </div>
            <Link href="/hub/blog/create">
              <Button><Plus className="mr-2 h-4 w-4" /> New Post</Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
          <select
            value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-[0_20px_0_0]" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">No posts found</h2>
            <p className="mt-2 text-muted-foreground">Create a blog post to get started.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/hub/blog/${post.id}`}>
                  <Card className="h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                    {post.cover_image ? (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted">
                        <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {post.category_name && (
                          <Badge variant="outline" className="text-[10px]">{post.category_name}</Badge>
                        )}
                        {post.status === "draft" && (
                          <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                      {post.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author_name}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(post.created_at).toLocaleDateString()}</span>
                        {post.view_count > 0 && (
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {posts.length < total && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "Loading..." : "Load More"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </FeatureGuard>
  );
}
