"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Plus, ArrowLeft, Hash, Lock, Pin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function ForumsPage() {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/forums/categories").then((data: any) => setCategories(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <FeatureGuard featureName="forums" fallback="/hub">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/hub" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Link>
          <h1 className="text-3xl font-bold">Forums</h1>
          <p className="mt-1 text-muted-foreground">Discuss ideas, ask questions, and share knowledge</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">No forums yet</h2>
            <p className="mt-2 text-muted-foreground">Check back later for discussion categories.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/hub/forums/${cat.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl">
                      {cat.icon || <Hash className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{cat.name}</h3>
                      {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
                    </div>
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {cat.thread_count} thread{cat.thread_count !== 1 ? "s" : ""}
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
