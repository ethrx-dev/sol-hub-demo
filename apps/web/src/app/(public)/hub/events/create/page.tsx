"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    is_virtual: false,
    meeting_url: "",
    cover_image_url: "",
    max_attendees: "",
    status: "draft",
  });
  const [sending, setSending] = useState(false);

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.title.trim() || !form.start_time) return;
    setSending(true);
    try {
      const body: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        is_virtual: form.is_virtual,
        meeting_url: form.meeting_url.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
        status: form.status,
      };
      const event: any = await api.post("/events", body);
      toast.success("Event created!");
      router.push(`/hub/events/${event.id}`);
    } catch { toast.error("Failed to create event"); }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/events" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date/Time *</label>
              <input type="datetime-local" value={form.start_time} onChange={(e) => update("start_time", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium">End Date/Time</label>
              <input type="datetime-local" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. 123 Main St, City" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="virtual" checked={form.is_virtual} onChange={(e) => update("is_virtual", e.target.checked)} className="rounded border-input" />
            <label htmlFor="virtual" className="text-sm font-medium">Virtual event</label>
          </div>
          {form.is_virtual && (
            <div>
              <label className="text-sm font-medium">Meeting URL</label>
              <input value={form.meeting_url} onChange={(e) => update("meeting_url", e.target.value)} placeholder="https://zoom.us/j/..." className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Cover Image URL</label>
            <input value={form.cover_image_url} onChange={(e) => update("cover_image_url", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Max Attendees</label>
              <input type="number" value={form.max_attendees} onChange={(e) => update("max_attendees", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={sending || !form.title.trim() || !form.start_time}>
              {sending ? "Creating..." : "Create Event"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/hub/events")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
