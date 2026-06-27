"use client";

import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Card, CardContent } from "@/src/components/ui/card";

interface ProjectCardProps {
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

const statusColors: Record<string, "default" | "secondary" | "warning" | "success" | "outline"> = {
  draft: "secondary",
  submitted: "outline",
  reviewing: "warning",
  approved: "success",
  matched: "default",
  funded: "success",
};

export function ProjectCard({
  id,
  title,
  tagline,
  innovatorName,
  innovatorAvatar,
  sectors,
  fundingGoal,
  fundingRaised,
  status,
  stage,
}: ProjectCardProps) {
  const progress = Math.min((fundingRaised / fundingGoal) * 100, 100);

  return (
    <Link href={`/innovator/projects/${id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold leading-tight">{title}</h3>
                <Badge variant={statusColors[status] || "secondary"}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{tagline}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {sectors.map((sector) => (
              <Badge key={sector} variant="secondary" className="text-xs">
                {sector}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              {stage}
            </Badge>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Funding</span>
              <span className="font-medium">
                ${fundingRaised.toLocaleString()} / ${fundingGoal.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={innovatorAvatar} />
              <AvatarFallback className="text-[10px]">
                {innovatorName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{innovatorName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
