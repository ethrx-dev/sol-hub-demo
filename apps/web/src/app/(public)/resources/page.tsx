"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ResourceCard } from "@/src/components/shared/resource-card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { api } from "@/src/lib/api-client";

const fallbackResources = [
  {
    id: "1",
    title: "How to Write a Winning Pitch Deck",
    description: "Learn the key elements of a pitch deck that investors love.",
    type: "article" as const,
    sectors: ["General"],
    authorName: "Laurel",
    readTime: "8 min read",
  },
  {
    id: "2",
    title: "Fundraising 101 for Early-Stage Startups",
    description: "A comprehensive guide to raising your first round of funding.",
    type: "guide" as const,
    sectors: ["General", "FinTech"],
    authorName: "Tom",
    readTime: "15 min read",
  },
  {
    id: "3",
    title: "Building a Prototype on a Budget",
    description: "Tips and tools for building your MVP with limited resources.",
    type: "video" as const,
    sectors: ["General", "SaaS"],
    authorName: "Laurel",
    readTime: "12 min watch",
  },
  {
    id: "4",
    title: "CleanTech Market Analysis Template",
    description: "A ready-to-use template for analyzing your clean tech market.",
    type: "template" as const,
    sectors: ["CleanTech"],
    authorName: "Tom",
    readTime: "Template",
  },
  {
    id: "5",
    title: "Legal Considerations for HealthTech Startups",
    description: "Navigate regulatory compliance and legal requirements.",
    type: "article" as const,
    sectors: ["HealthTech"],
    authorName: "Laurel",
    readTime: "10 min read",
  },
  {
    id: "6",
    title: "AI Ethics and Responsible Development",
    description: "Guidelines for building AI solutions responsibly.",
    type: "guide" as const,
    sectors: ["AI/ML"],
    authorName: "Tom",
    readTime: "20 min read",
  },
];

const SECTORS = ["CleanTech", "HealthTech", "FinTech", "EdTech", "AI/ML", "SaaS", "General"];
const TYPES = ["article", "video", "guide", "template"];

const typeLabels: Record<string, string> = {
  article: "Article",
  guide: "Guide",
  video: "Video",
  template: "Template",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    api.get("/resources/?limit=50")
      .then((data: any) => setResources(data.items || []))
      .catch(() => setResources(fallbackResources))
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter((r) => {
    if (sector !== "all" && r.sector && r.sector !== sector && !(r.sectors || []).includes(sector)) return false;
    if (type !== "all" && r.resource_type !== type && r.type !== type) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.title.toLowerCase().includes(q) &&
        !r.description.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resource Library</h1>
        <p className="mt-2 text-muted-foreground">
          Guides, articles, templates, and videos to help you on your journey.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-3 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No resources found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              id={resource.id}
              title={resource.title}
              description={resource.description || ""}
              type={resource.resource_type || resource.type || "article"}
              sectors={resource.sector ? [resource.sector] : resource.sectors || []}
              authorName={resource.author_name || "SOL Hub"}
              readTime={resource.read_time || resource.readTime || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
