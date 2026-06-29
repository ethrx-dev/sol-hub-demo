"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Video, Plus, ArrowLeft, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { FeatureGuard } from "@/src/components/shared/feature-guard";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  const fetchEvents = (upcoming: boolean, past: boolean) => {
    setLoading(true);
    const params = upcoming ? "upcoming=true" : past ? "past=true" : "";
    api.get(`/events?limit=50&${params}`).then((data: any) => setEvents(data.items || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents(true, false);
  }, []);

  const switchTab = (v: string) => {
    setTab(v);
    fetchEvents(v === "upcoming", v === "past");
  };

  return (
    <FeatureGuard featureName="events" fallback="/hub">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/hub" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Events</h1>
              <p className="mt-1 text-muted-foreground">Discover and join community events</p>
            </div>
            {isAuthenticated && (
              <Link href="/hub/events/create">
                <Button><Plus className="mr-2 h-4 w-4" /> New Event</Button>
              </Link>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={switchTab}>
          <TabsList>
            <TabsTrigger value="upcoming" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Past</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
            ) : events.length === 0 ? (
              <div className="rounded-lg border bg-card p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">No {tab} events</h2>
                <p className="mt-2 text-muted-foreground">Check back later for events.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event: any) => (
                  <Link key={event.id} href={`/hub/events/${event.id}`}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          {event.cover_image_url && (
                            <div className="hidden sm:block w-48 shrink-0 bg-muted">
                              <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                              </div>
                              <Badge variant={event.status === "published" ? "default" : "secondary"}>{event.status}</Badge>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.start_time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </span>
                              )}
                              {event.is_virtual && (
                                <span className="flex items-center gap-1.5">
                                  <Video className="h-4 w-4" />
                                  Virtual
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {event.attendee_count} going
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGuard>
  );
}
