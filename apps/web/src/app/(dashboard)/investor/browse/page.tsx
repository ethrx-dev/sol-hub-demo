"use client";

import { useState, useEffect } from "react";
import { Search, DollarSign } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { api } from "@/src/lib/api-client";

const SECTORS = ["CleanTech", "HealthTech", "FinTech", "EdTech", "AI/ML"];

export default function InvestorBrowsePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");

  useEffect(() => {
    api.get("/projects/?limit=50")
      .then((data: any) => setProjects(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    if (sector !== "all" && p.sector !== sector) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !(p.tagline || "").toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Vetted Projects</h1>
        <p className="mt-1 text-muted-foreground">
          Discover impact-driven ventures seeking investment
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
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
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-3 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No projects available.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((project) => {
            const goal = project.target_amount || 0;
            const raised = project.raised_amount || 0;
            const progress = goal > 0 ? (raised / goal) * 100 : 0;
            return (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{project.tagline}</p>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {project.title.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.sector && (
                      <Badge variant="secondary">{project.sector}</Badge>
                    )}
                    <Badge variant="outline">{project.stage}</Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding</span>
                      <span className="font-medium">
                        ${raised.toLocaleString()} / ${goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    onClick={async () => {
                      try {
                        await api.post("/matches/", { project_id: project.id, status: "pending" });
                        toast.success("Investment interest sent!");
                      } catch {
                        toast.error("Failed to send interest");
                      }
                    }}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Express Interest
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
