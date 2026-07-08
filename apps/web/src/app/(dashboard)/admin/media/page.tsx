"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Image,
  FileType,
  Copy,
  ExternalLink,
  Search,
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  alt_text: string | null;
  caption: string | null;
  url: string;
  created_at: string | null;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const data = await api.get<{ items: MediaItem[]; total: number }>("/admin/media");
      setItems(data.items);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/media/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      toast.success("Uploaded");
      fetchMedia();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/media/${id}`);
      toast.success("Deleted");
      fetchMedia();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const filtered = items.filter(
    (m) =>
      m.original_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.alt_text || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const isImage = (mime: string) => mime.startsWith("image/");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Media Library</h1>
          <p className="mt-1 text-muted-foreground">
            Upload and manage images and files
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Image className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>No media found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((media) => (
            <Card key={media.id} className="group overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {isImage(media.mime_type) ? (
                  <img
                    src={media.url}
                    alt={media.alt_text || media.original_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileType className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(media.url)}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(media.id, media.original_name)}
                    className="p-1.5 bg-white rounded-full hover:bg-red-100 transition-colors text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-2 text-xs truncate">
                <p className="font-medium truncate">{media.original_name}</p>
                <p className="text-muted-foreground">{formatSize(media.size)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
