"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image, Video, Plus, ArrowLeft, Images } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function GalleriesPage() {
  const { isAuthenticated } = useAuth();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const params = tab !== "all" ? `?type=${tab}` : "";
    api.get(`/galleries/albums${params}&limit=50`).then((data: any) => setAlbums(data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  return (
    <FeatureGuard featureName="galleries" fallback="/hub">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/hub" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Galleries</h1>
              <p className="mt-1 text-muted-foreground">Photo and video albums</p>
            </div>
            {isAuthenticated && (
              <Link href="/hub/galleries/create">
                <Button><Plus className="mr-2 h-4 w-4" /> New Album</Button>
              </Link>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2"><Images className="h-4 w-4" /> All</TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center gap-2"><Image className="h-4 w-4" /> Photos</TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2"><Video className="h-4 w-4" /> Videos</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
              </div>
            ) : albums.length === 0 ? (
              <div className="rounded-lg border bg-card p-12 text-center">
                <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">No albums yet</h2>
                <p className="mt-2 text-muted-foreground">Create an album to start sharing photos and videos.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((a: any) => (
                  <Link key={a.id} href={`/hub/galleries/${a.id}`}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden group">
                      <div className="aspect-video bg-muted relative">
                        {a.cover_media_url ? (
                          <img src={a.cover_media_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground/50">
                            {a.album_type === "video" ? <Video className="h-12 w-12" /> : <Image className="h-12 w-12" />}
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2">{a.album_type}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.media_count} item{a.media_count !== 1 ? "s" : ""}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGuard>
  );
}
