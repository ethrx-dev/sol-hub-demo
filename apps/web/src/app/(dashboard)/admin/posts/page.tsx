"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { Trash2, Heart, MessageSquare } from "lucide-react";

interface AdminPost {
  id: string;
  author_name: string | null;
  content: string;
  like_count: number;
  comment_count: number;
  is_deleted: boolean;
  created_at: string | null;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.get<{ items: AdminPost[]; total: number }>("/admin/posts");
      setPosts(data.items);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      toast.success("Post deleted");
      fetchPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Posts</h1>
        <p className="mt-1 text-muted-foreground">Manage all community feed posts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No posts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Content</th>
                    <th className="px-4 py-3 font-medium">
                      <Heart className="h-3 w-3 inline" />
                    </th>
                    <th className="px-4 py-3 font-medium">
                      <MessageSquare className="h-3 w-3 inline" />
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{post.author_name || "Anonymous"}</td>
                      <td className="max-w-[300px] truncate px-4 py-3 text-muted-foreground">
                        {post.content}
                      </td>
                      <td className="px-4 py-3">{post.like_count}</td>
                      <td className="px-4 py-3">{post.comment_count}</td>
                      <td className="px-4 py-3">
                        {post.is_deleted ? (
                          <span className="text-destructive">Deleted</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(post.id)}
                          disabled={post.is_deleted}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
