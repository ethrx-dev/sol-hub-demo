"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/src/components/shared/project-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";

interface Project {
  id: string;
  title: string;
  tagline: string;
  innovatorName: string;
  innovatorAvatar?: string;
  sectors: string[];
  fundingGoal: number;
  fundingRaised: number;
  status: "draft" | "submitted" | "reviewing" | "approved" | "matched" | "funded";
  stage: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "GreenGrid AI",
    tagline: "AI-powered energy optimization for smart grids",
    innovatorName: "Alex Rivera",
    sectors: ["CleanTech", "AI/ML"],
    fundingGoal: 50000,
    fundingRaised: 15000,
    status: "approved",
    stage: "Prototype",
  },
  {
    id: "2",
    title: "HealthBridge",
    tagline: "Telemedicine platform for rural communities",
    innovatorName: "Alex Rivera",
    sectors: ["HealthTech"],
    fundingGoal: 75000,
    fundingRaised: 0,
    status: "draft",
    stage: "Idea",
  },
];

export default function ProjectsPage() {
  const [projects] = useState<Project[]>(mockProjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your project submissions
          </p>
        </div>
        <Link
          href="/innovator/projects/new"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {projects.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No projects yet.</p>
              <Link
                href="/innovator/projects/new"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
              >
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="draft" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {projects.filter((p) => p.status === "draft").map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="submitted" className="mt-6">
          <div className="py-12 text-center text-muted-foreground">
            No submitted projects.
          </div>
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {projects.filter((p) => p.status === "approved").map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
