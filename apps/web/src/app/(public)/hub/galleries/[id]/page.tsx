"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image, Video, Trash2, Play, Upload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get(`/galleries/albums/${id}`).then(setAlbum).catch(() => router.push("/hub/galleries")).finally(() => setLoading(false));
  }, [id, router]);

  const deleteAlbum = async () => {
    try {
      await api.delete(`/galleries/albums/${id}`);
      toast.success("Album deleted");
      router.push("/hub/galleries");
    } catch { toast.error("Failed to delete album"); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/galleries/albums/${id}/media/upload`,
        { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      const media = await res.json();
      setAlbum((prev: any) => prev ? { ...prev, media: [...prev.media, media], media_count: prev.media_count + 1 } : prev);
      toast.success("Media added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="aspect-video w-full" />)}</div>
      </div>
    );
  }

  if (!album) return null;

  const isOwner = user?.id === album.author_id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/hub/galleries" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All Albums
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{album.title}</h1>
            {album.description && <p className="mt-1 text-muted-foreground">{album.description}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{album.media_count} item{album.media_count !== 1 ? "s" : ""} &middot; by {album.author_name}</p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Add Media
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteAlbum}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Album
              </Button>
            </div>
          )}
        </div>
      </div>

      {album.media?.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">No media yet</h2>
          <p className="mt-2 text-muted-foreground">{isOwner ? "Click Add Media to upload photos or videos." : "This album is empty."}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {album.media.map((m: any) => (
            <div key={m.id} className="group relative aspect-video overflow-hidden rounded-lg bg-muted">
              {m.media_type === "video" ? (
                <div className="relative h-full w-full">
                  <img src={m.thumb_url || m.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
              ) : (
                <img src={m.url} alt={m.caption || ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              )}
              {isOwner && (
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/galleries/media/${m.id}`);
                      setAlbum((prev: any) => prev ? { ...prev, media: prev.media.filter((x: any) => x.id !== m.id), media_count: prev.media_count - 1 } : prev);
                      toast.success("Media removed");
                    } catch { toast.error("Failed to remove media"); }
                  }}
                  className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {m.caption && <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm text-white">{m.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
