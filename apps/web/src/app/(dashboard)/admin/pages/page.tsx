"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Input } from "@/src/components/ui/input";
import {
  Plus,
  FileText,
  Eye,
  ExternalLink,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface PageItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  layout: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPages = useCallback(async () => {
    try {
      const data = await api.get<{ items: PageItem[]; total: number }>("/admin/pages");
      setPages(data.items);
    } catch {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can be undone.`)) return;
    try {
      await api.delete(`/admin/pages/${id}`);
      toast.success("Page deleted");
      fetchPages();
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      published: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Pages</h1>
          <p className="mt-1 text-muted-foreground">
            Manage content pages for your site
          </p>
        </div>
        <Button onClick={() => router.push("/admin/pages/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No pages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Title</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Slug</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Updated</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((page) => (
                    <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{page.title}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{page.slug}</code>
                      </td>
                      <td className="px-4 py-3">{statusBadge(page.status)}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {page.updated_at
                          ? new Date(page.updated_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/${page.slug}`}
                            target="_blank"
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="View page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => router.push(`/admin/pages/${page.id}/edit`)}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="Edit page"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"
                            title="Delete page"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
