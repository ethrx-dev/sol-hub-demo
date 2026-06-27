"use client";

import { useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";

const mockProjects = [
  {
    id: "1",
    title: "GreenGrid AI",
    tagline: "AI-powered energy optimization for smart grids",
    innovatorName: "Alex Rivera",
    sectors: ["CleanTech", "AI/ML"],
    fundingGoal: 50000,
    fundingRaised: 15000,
    stage: "Prototype",
  },
  {
    id: "2",
    title: "HealthBridge",
    tagline: "Telemedicine platform for rural communities",
    innovatorName: "Sarah Chen",
    sectors: ["HealthTech"],
    fundingGoal: 75000,
    fundingRaised: 25000,
    stage: "Early Traction",
  },
];

const SECTORS = ["CleanTech", "HealthTech", "FinTech", "EdTech", "AI/ML"];

export default function InvestorBrowsePage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");

  const filtered = mockProjects.filter((p) => {
    if (sector !== "all" && !p.sectors.includes(sector)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.tagline.toLowerCase().includes(q))
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

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No projects available.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((project) => {
            const progress = (project.fundingRaised / project.fundingGoal) * 100;
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
                        {project.innovatorName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.sectors.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                    <Badge variant="outline">{project.stage}</Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding</span>
                      <span className="font-medium">
                        ${project.fundingRaised.toLocaleString()} / ${project.fundingGoal.toLocaleString()}
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
                    onClick={() =>
                      toast.success("Investment interest sent!")
                    }
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
