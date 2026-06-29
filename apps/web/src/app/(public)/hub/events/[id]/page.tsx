"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Video, Users, Clock, ExternalLink, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}`).then(setEvent).catch(() => router.push("/hub/events")).finally(() => setLoading(false));
  }, [id, router]);

  const rsvp = async (status: string) => {
    try {
      await api.post(`/events/${id}/rsvp`, { status });
      const updated: any = await api.get(`/events/${id}`);
      setEvent(updated);
      toast.success(status === "not_going" ? "RSVP updated" : "You're going!");
    } catch { toast.error("Failed to RSVP"); }
  };

  const deleteEvent = async () => {
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      router.push("/hub/events");
    } catch { toast.error("Failed to delete event"); }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  if (!event) return null;

  const isOrganizer = user?.id === event.organizer_id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/hub/events" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All Events
      </Link>

      {event.cover_image_url && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <img src={event.cover_image_url} alt="" className="w-full max-h-72 object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <Badge>{event.status}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />
              {new Date(event.start_time).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
            {event.end_time && (
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />
                {new Date(event.end_time).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>}
            {event.is_virtual && <span className="flex items-center gap-1.5"><Video className="h-4 w-4" /> Virtual</span>}
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {event.attendee_count} going</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOrganizer && (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push(`/hub/events/${id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteEvent}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {event.description && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {event.meeting_url && (
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <Video className="h-5 w-5 text-primary" />
            <span className="flex-1 text-sm font-medium">Join virtually</span>
            <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Join Meeting</Button>
            </a>
          </CardContent>
        </Card>
      )}

      {event.status === "published" && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">RSVP</h3>
            <div className="flex gap-2">
              <Button
                variant={event.my_status === "going" ? "default" : "outline"}
                onClick={() => rsvp("going")}
              >
                Going
              </Button>
              <Button
                variant={event.my_status === "maybe" ? "default" : "outline"}
                onClick={() => rsvp("maybe")}
              >
                Maybe
              </Button>
              <Button
                variant={event.my_status === "not_going" ? "default" : "outline"}
                onClick={() => rsvp("not_going")}
              >
                Not Going
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {event.attendees?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Attendees ({event.attendees.length})</h3>
            <div className="space-y-3">
              {event.attendees.map((a: any) => (
                <Link key={a.id} href={`/users/${a.user_id}`} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={a.user_avatar} />
                    <AvatarFallback className="text-xs">{a.user_name?.split(" ").map((n: string) => n[0]).join("") || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{a.user_name}</span>
                  <Badge variant="outline" className="ml-auto">{a.status}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
