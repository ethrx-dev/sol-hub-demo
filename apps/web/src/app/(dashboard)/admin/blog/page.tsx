"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  post_count: number;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    cover_image: "",
    status: "draft" as string,
    is_featured: false,
    category_id: "",
    tags: "",
  });

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "50");
      const data = await api.get<{ items: BlogPost[]; total: number }>(`/blog/posts?${params}`);
      setPosts(data.items);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get<Category[]>("/blog/categories");
      setCategories(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchPosts(); fetchCategories(); }, [fetchPosts, fetchCategories]);

  const resetForm = () => {
    setForm({ title: "", content: "", excerpt: "", cover_image: "", status: "draft", is_featured: false, category_id: "", tags: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const editPost = (post: BlogPost) => {
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      cover_image: post.cover_image || "",
      status: post.status,
      is_featured: post.is_featured,
      category_id: "",
      tags: "",
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    try {
      if (editingId) {
        await api.patch(`/blog/posts/${editingId}`, {
          title: form.title,
          content: form.content,
          excerpt: form.excerpt || null,
          cover_image: form.cover_image || null,
          status: form.status,
          is_featured: form.is_featured,
        });
        toast.success("Post updated");
      } else {
        await api.post("/blog/posts", {
          title: form.title,
          content: form.content,
          excerpt: form.excerpt || null,
          cover_image: form.cover_image || null,
          status: form.status,
          is_featured: form.is_featured,
        });
        toast.success("Post created");
      }
      resetForm();
      fetchPosts();
    } catch {
      toast.error("Failed to save post");
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/blog/posts/${postId}`);
      toast.success("Post deleted");
      fetchPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Blog Posts</h1>
          <p className="mt-1 text-muted-foreground">Create and manage blog content</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-1 h-4 w-4" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Post" : "New Post"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Content (HTML)</label>
              <Textarea className="min-h-[200px] font-mono text-xs" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cover Image URL</label>
                <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="featured" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                <label htmlFor="featured" className="text-sm">Featured</label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No posts yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium max-w-[300px] truncate">{post.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{post.author_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => editPost(post)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                          {post.status === "published" && (
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
