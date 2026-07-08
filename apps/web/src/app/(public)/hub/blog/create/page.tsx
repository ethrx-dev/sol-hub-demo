"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    cover_image: "",
    category_id: "",
    tags: "",
    status: "draft",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/blog/categories").then((data: any) => setCategories(data)).catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSending(true);
    try {
      const body: any = {
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt.trim() || null,
        cover_image: form.cover_image.trim() || null,
        tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        status: form.status,
      };
      if (form.category_id) body.category_id = form.category_id;
      const post: any = await api.post("/blog/posts", body);
      toast.success("Post created!");
      router.push(`/hub/blog/${post.id}`);
    } catch {
      toast.error("Failed to create post");
    }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>
      <h1 className="text-3xl font-bold mb-6">Create Blog Post</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Write your post content here (HTML supported)..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Short summary shown in card previews"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cover Image URL</label>
            <input
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">None</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. tutorial, react, guide"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={sending || !form.title.trim() || !form.content.trim()}>
              {sending ? "Creating..." : "Create Post"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/hub/blog")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
