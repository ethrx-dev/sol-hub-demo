"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const resources: Record<string, { title: string; content: string; type: string; sectors: string[]; authorName: string; readTime: string }> = {
  "1": {
    title: "How to Write a Winning Pitch Deck",
    content:
      "A great pitch deck tells a compelling story about your business. Start with a clear problem statement, present your solution, show market opportunity, and demonstrate traction. Keep it under 15 slides and focus on what makes your venture unique. Use visuals, include your team, and end with a clear ask.",
    type: "Article",
    sectors: ["General"],
    authorName: "Laurel",
    readTime: "8 min read",
  },
};

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const resource = resources[id];

  if (!resource) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Resource not found</h1>
        <Link
          href="/resources"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4"
        >
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/resources"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Link>

      <article>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge>{resource.type}</Badge>
          {resource.sectors.map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold">{resource.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {resource.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {resource.readTime}
          </span>
        </div>

        <div className="mt-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {resource.content}
          </p>
        </div>
      </article>
    </div>
  );
}
