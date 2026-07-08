"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

export default function UploadDocumentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", file_url: "", file_type: "", tags: "", category_id: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/documents/categories").then((data: any) => setCategories(data)).catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.file_url.trim() || !form.file_type.trim()) return;
    setSending(true);
    try {
      const body: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        file_url: form.file_url.trim(),
        file_type: form.file_type.trim(),
        tags: form.tags.trim(),
      };
      if (form.category_id) body.category_id = form.category_id;
      const doc: any = await api.post("/documents", body);
      toast.success("Document uploaded!");
      router.push(`/hub/documents/${doc.id}`);
    } catch { toast.error("Failed to upload document"); }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/documents" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Documents
      </Link>
      <h1 className="text-3xl font-bold mb-6">Upload Document</h1>

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
            <label className="text-sm font-medium">File URL *</label>
            <input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">File Type *</label>
            <select value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select type...</option>
              <option value="pdf">PDF</option>
              <option value="application/msword">Word Document</option>
              <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Spreadsheet</option>
              <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">Presentation</option>
              <option value="text/plain">Text</option>
              <option value="text/csv">CSV</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">None</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. report, annual, finance" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={sending || !form.title.trim() || !form.file_url.trim() || !form.file_type.trim()}>
              {sending ? "Uploading..." : "Upload Document"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/hub/documents")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
