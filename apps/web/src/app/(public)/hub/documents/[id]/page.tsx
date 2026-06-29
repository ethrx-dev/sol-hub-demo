"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Trash2, Pencil, ExternalLink, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/documents/${id}`).then(setDoc).catch(() => router.push("/hub/documents")).finally(() => setLoading(false));
  }, [id, router]);

  const handleDownload = async () => {
    try {
      const data: any = await api.post(`/documents/${id}/download`);
      window.open(data.download_url, "_blank");
      setDoc((prev: any) => prev ? { ...prev, download_count: data.download_count } : prev);
    } catch { window.open(doc.file_url, "_blank"); }
  };

  const deleteDoc = async () => {
    try {
      await api.delete(`/documents/${id}`);
      toast.success("Document deleted");
      router.push("/hub/documents");
    } catch { toast.error("Failed to delete document"); }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-48 w-full" />
      </div>
    );
  }

  if (!doc) return null;

  const isOwner = user?.id === doc.author_id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/documents" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Document Library
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary shrink-0">
                {doc.file_type?.startsWith("pdf") ? "PDF" : "DOC"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{doc.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{doc.author_name}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(doc.created_at).toLocaleDateString()}</span>
                  {doc.category_name && <Badge variant="outline">{doc.category_name}</Badge>}
                  <Badge variant="secondary">{doc.file_type}</Badge>
                </div>
              </div>
            </div>
            {isOwner && (
              <Button variant="destructive" size="sm" onClick={deleteDoc}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </div>

          {doc.description && (
            <p className="mt-6 text-muted-foreground whitespace-pre-wrap">{doc.description}</p>
          )}

          {doc.tags && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {doc.tags.split(",").filter(Boolean).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag.trim()}</Badge>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download ({doc.download_count})
            </Button>
            <Button variant="outline" onClick={() => window.open(doc.file_url, "_blank")}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
