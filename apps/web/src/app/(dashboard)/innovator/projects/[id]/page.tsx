"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const project = {
  id: "1",
  title: "GreenGrid AI",
  tagline: "AI-powered energy optimization for smart grids",
  description:
    "GreenGrid AI uses machine learning to optimize energy distribution in smart grids, reducing waste by up to 30%. Our platform integrates with existing grid infrastructure to provide real-time optimization recommendations.",
  sectors: ["CleanTech", "AI/ML"],
  stage: "Prototype",
  fundingGoal: 50000,
  fundingRaised: 15000,
  status: "approved",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <Link
        href="/innovator/projects"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{project.tagline}</p>
        </div>
        <Badge variant="success">{project.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.sectors.map((sector) => (
          <Badge key={sector} variant="secondary">{sector}</Badge>
        ))}
        <Badge variant="outline">{project.stage}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="mt-6 space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Funding Goal</span>
              <p className="text-2xl font-bold">${project.fundingGoal.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Raised</span>
              <p className="text-2xl font-bold">${project.fundingRaised.toLocaleString()}</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(project.fundingRaised / project.fundingGoal) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link
          href={`/projects/${id}/workspace`}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Go to Workspace
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
