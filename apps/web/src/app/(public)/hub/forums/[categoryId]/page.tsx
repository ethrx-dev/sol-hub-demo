"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Pin, Lock, Plus, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { useAuth } from "@/src/lib/auth";

export default function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = use(params);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/forums/categories"),
      api.get(`/forums/categories/${categoryId}/threads?limit=50`),
    ]).then((results: any) => {
      const cats: any[] = results[0];
      const data: any = results[1];
      setCategory(cats.find((c: any) => c.id === categoryId));
      setThreads(data.items || []);
      setTotal(data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [categoryId]);

  const createThread = async () => {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    try {
      const thread: any = await api.post(`/forums/categories/${categoryId}/threads`, { title: title.trim(), content: content.trim() });
      setThreads((prev) => [thread, ...prev]);
      setTotal((p) => p + 1);
      setShowCreate(false);
      setTitle("");
      setContent("");
    } catch { /* ignore */ }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </div>
    );
  }

  return (
    <FeatureGuard featureName="forums" fallback="/hub">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/hub/forums" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            All Forums
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{category?.name || "Forum"}</h1>
              {category?.description && <p className="mt-1 text-muted-foreground">{category.description}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{total} thread{total !== 1 ? "s" : ""}</p>
            </div>
            {isAuthenticated && (
              <Button onClick={() => setShowCreate(!showCreate)}>
                <Plus className="mr-2 h-4 w-4" /> New Thread
              </Button>
            )}
          </div>
        </div>

        {showCreate && (
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Thread title"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to discuss?"
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={createThread} disabled={sending || !title.trim() || !content.trim()}>
                  {sending ? "Posting..." : "Create Thread"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {threads.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">No threads yet</h2>
            <p className="mt-2 text-muted-foreground">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((t: any) => (
              <Link key={t.id} href={`/hub/forums/${categoryId}/${t.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {t.is_pinned && <Pin className="h-4 w-4 shrink-0 text-muted-foreground" />}
                        {t.is_locked && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
                        <h3 className="font-medium truncate">{t.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{t.author_name}</span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        <span>{t.reply_count} repl{t.reply_count === 1 ? "y" : "ies"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FeatureGuard>
  );
}
