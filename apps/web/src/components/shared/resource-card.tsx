"use client";

import Link from "next/link";
import { FileText, Video, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "guide" | "template";
  sectors: string[];
  authorName: string;
  readTime: string;
}

const typeConfig = {
  article: { icon: FileText, label: "Article" },
  video: { icon: Video, label: "Video" },
  guide: { icon: BookOpen, label: "Guide" },
  template: { icon: ExternalLink, label: "Template" },
};

export function ResourceCard({
  id,
  title,
  description,
  type,
  sectors,
  authorName,
  readTime,
}: ResourceCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Link href={`/resources/${id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {config.label}
            </span>
          </div>

          <h3 className="mt-3 font-semibold line-clamp-2">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {sectors.slice(0, 3).map((sector) => (
              <Badge key={sector} variant="secondary" className="text-xs">
                {sector}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{authorName}</span>
            <span>{readTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
