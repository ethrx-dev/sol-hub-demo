"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ProjectCard } from "@/src/components/shared/project-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const mockProjects = [
  {
    id: "1",
    title: "GreenGrid AI",
    tagline: "AI-powered energy optimization for smart grids",
    innovatorName: "Alex Rivera",
    sectors: ["CleanTech", "AI/ML"],
    fundingGoal: 50000,
    fundingRaised: 15000,
    status: "approved" as const,
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
    status: "approved" as const,
    stage: "Early Traction",
  },
  {
    id: "3",
    title: "EduFuture",
    tagline: "Personalized learning paths powered by AI",
    innovatorName: "James Wilson",
    sectors: ["EdTech", "AI/ML"],
    fundingGoal: 30000,
    fundingRaised: 5000,
    status: "approved" as const,
    stage: "Prototype",
  },
];

const SECTORS = ["CleanTech", "HealthTech", "FinTech", "EdTech", "AI/ML"];
const STAGES = ["Idea", "Prototype", "Early Traction", "Growth", "Scale"];

export default function MentorBrowsePage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [stage, setStage] = useState("all");

  const filtered = mockProjects.filter((p) => {
    if (sector !== "all" && !p.sectors.includes(sector)) return false;
    if (stage !== "all" && p.stage !== stage) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.tagline.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Projects</h1>
        <p className="mt-1 text-muted-foreground">
          Find projects that align with your expertise
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
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No projects match your filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      )}
    </div>
  );
}
