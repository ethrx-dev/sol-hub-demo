"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

export default function CreateAlbumPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", album_type: "photo" });
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return;
    setSending(true);
    try {
      const album: any = await api.post("/galleries/albums", {
        title: form.title.trim(),
        description: form.description.trim() || null,
        album_type: form.album_type,
      });
      toast.success("Album created!");
      router.push(`/hub/galleries/${album.id}`);
    } catch { toast.error("Failed to create album"); }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/galleries" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Galleries
      </Link>
      <h1 className="text-3xl font-bold mb-6">New Album</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select value={form.album_type} onChange={(e) => setForm({ ...form, album_type: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="photo">Photos</option>
              <option value="video">Videos</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={sending || !form.title.trim()}>
              {sending ? "Creating..." : "Create Album"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/hub/galleries")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
