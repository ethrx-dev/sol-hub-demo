"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UserPlus, MessageSquare, CalendarCheck, FileText, BookOpen,
  Users, UserSquare2, Loader2, Activity,
} from "lucide-react";
import { api } from "@/src/lib/api-client";

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  connection_made: { icon: UserPlus, color: "text-blue-500" },
  forum_thread_created: { icon: MessageSquare, color: "text-green-500" },
  event_rsvped: { icon: CalendarCheck, color: "text-purple-500" },
  document_uploaded: { icon: FileText, color: "text-yellow-500" },
  blog_published: { icon: BookOpen, color: "text-orange-500" },
  group_joined: { icon: UserSquare2, color: "text-pink-500" },
};

export function ActivityStream() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetch = async (append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const data: any = await api.get(`/activity?skip=${append ? skip : 0}&limit=${limit}`);
      if (append) {
        setActivities((prev) => [...prev, ...(data.items || [])]);
      } else {
        setActivities(data.items || []);
      }
      setTotal(data.total || 0);
      setSkip((append ? skip : 0) + (data.items?.length || 0));
    } catch {
      // silent
    }
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && activities.length < total && !loadingMore) fetch(true); },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [activities.length, total, loadingMore]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse items-start gap-3 rounded-lg bg-gray-800 p-4">
            <div className="h-10 w-10 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-700" />
              <div className="h-3 w-1/4 rounded bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Activity className="mb-4 h-12 w-12" />
        <p className="text-lg font-medium">No activity yet</p>
        <p className="text-sm">Activities will appear here as you and others interact on the platform.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => {
        const config = TYPE_CONFIG[a.activity_type] || { icon: Activity, color: "text-gray-400" };
        const Icon = config.icon;
        return (
          <div key={a.id} className="flex items-start gap-3 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-750">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {a.user_avatar ? (
                  <img src={a.user_avatar} alt="" className="h-5 w-5 rounded-full" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-xs font-medium text-gray-300">
                    {a.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-100">{a.user_name}</span>
              </div>
              <p className="mt-1 text-sm text-gray-300">{a.description}</p>
              <p className="mt-0.5 text-xs text-gray-500">{timeAgo(a.created_at)}</p>
            </div>
          </div>
        );
      })}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
