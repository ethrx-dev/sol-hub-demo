"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, ArrowLeft, Search, Download, Filter, File } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function DocumentsPage() {
  const { isAuthenticated } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    Promise.all([
      api.get("/documents?limit=50"),
      api.get("/documents/categories"),
    ]).then(([d, c]: any) => {
      setDocs(d.items || []);
      setCategories(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter((d) => {
    if (categoryFilter && d.category_id !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || (d.description || "").toLowerCase().includes(q) || d.tags.toLowerCase().includes(q);
    }
    return true;
  });

  const fileIcon = (type: string) => {
    if (type.startsWith("pdf")) return "PDF";
    if (type.startsWith("image")) return "IMG";
    if (type.startsWith("video")) return "VID";
    if (type.startsWith("text") || type.includes("document")) return "DOC";
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("sheet")) return "XLS";
    if (type.includes("presentation") || type.includes("powerpoint") || type.includes("slides")) return "PPT";
    return "FILE";
  };

  return (
    <FeatureGuard featureName="document_library" fallback="/hub">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/hub" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Document Library</h1>
              <p className="mt-1 text-muted-foreground">Browse shared documents and resources</p>
            </div>
            {isAuthenticated && (
              <Link href="/hub/documents/create">
                <Button><Plus className="mr-2 h-4 w-4" /> Upload Document</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select
            value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.doc_count})</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Downloaded</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">No documents found</h2>
            <p className="mt-2 text-muted-foreground">Upload a document to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc: any) => (
              <Link key={doc.id} href={`/hub/documents/${doc.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {fileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      {doc.description && <p className="text-sm text-muted-foreground line-clamp-1">{doc.description}</p>}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{doc.author_name}</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        {doc.download_count > 0 && <span className="flex items-center gap-1"><Download className="h-3 w-3" />{doc.download_count}</span>}
                        {doc.category_name && <Badge variant="outline" className="text-[10px]">{doc.category_name}</Badge>}
                      </div>
                    </div>
                    <File className="h-5 w-5 text-muted-foreground shrink-0" />
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
