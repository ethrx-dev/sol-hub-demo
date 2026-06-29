"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, Users, FolderOpen, BookOpen, Calendar, UserSquare2, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api-client";

const TYPE_CONFIG: Record<string, { icon: any; label: string }> = {
  user: { icon: Users, label: "Users" },
  project: { icon: FolderOpen, label: "Projects" },
  resource: { icon: BookOpen, label: "Resources" },
  event: { icon: Calendar, label: "Events" },
  group: { icon: UserSquare2, label: "Groups" },
  blog_post: { icon: FileText, label: "Blog Posts" },
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const grouped = results.reduce<Record<string, any[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data: any = await api.get(`/search?q=${encodeURIComponent(q)}&limit=5`);
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-xs md:inline-block">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%] max-w-2xl translate-y-0 sm:rounded-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, projects, events, groups, resources, blog posts..."
              className="w-full border-0 border-b border-border bg-transparent py-4 pl-10 pr-4 text-lg outline-none placeholder:text-muted-foreground/50"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-1 pb-2">
            {Object.entries(grouped).map(([type, items]) => {
              const config = TYPE_CONFIG[type] || { icon: Search, label: type };
              const Icon = config.icon;
              return (
                <div key={type} className="mb-4">
                  <h4 className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </h4>
                  <div className="space-y-1">
                    {items.map((item: any) => (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
                        ) : (
                          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          {item.description && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            {!loading && query && results.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
