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
  "2": {
    title: "Fundraising 101 for Early-Stage Startups",
    content:
      "Raising your first round of funding is a milestone every founder faces. Start by understanding the difference between bootstrapping, friends-and-family rounds, angel investors, and venture capital. Prepare a data room with your financial projections, cap table, market analysis, and pitch deck. Network strategically — warm introductions from trusted connections convert at ten times the rate of cold outreach. Know your numbers inside out: burn rate, runway, unit economics, and lifetime value. Be transparent about risks and realistic about valuation. Most importantly, build relationships before you need the money.",
    type: "Guide",
    sectors: ["General", "FinTech"],
    authorName: "Tom",
    readTime: "15 min read",
  },
  "3": {
    title: "Building a Prototype on a Budget",
    content:
      "You don't need six figures to build a working prototype. Start with paper sketches and wireframes using free tools like Figma or Penpot. Use no-code platforms such as Bubble, Adalo, or Glide to create functional MVPs without writing code. For hardware prototypes, leverage Arduino or Raspberry Pi combined with off-the-shelf components. Focus on the core feature that solves your primary problem — everything else is distraction. Validate with real users early, iterate fast, and resist the urge to polish before you have product-market fit signals.",
    type: "Video",
    sectors: ["General", "SaaS"],
    authorName: "Laurel",
    readTime: "12 min watch",
  },
  "4": {
    title: "CleanTech Market Analysis Template",
    content:
      "This template walks you through a complete clean technology market analysis. Sections include: regulatory landscape (tax incentives, carbon credits, emission standards), total addressable market sizing by geography and segment, competitive analysis of incumbent and emerging solutions, technology readiness assessment, and go-to-market channel identification. Use this template alongside the latest IRENA and IEA reports to validate your assumptions. Update quarterly as policy and market conditions in clean energy evolve rapidly.",
    type: "Template",
    sectors: ["CleanTech"],
    authorName: "Tom",
    readTime: "Template",
  },
  "5": {
    title: "Legal Considerations for HealthTech Startups",
    content:
      "HealthTech is one of the most regulated startup sectors. You must understand HIPAA compliance in the US, GDPR for European users, and emerging frameworks like the EU AI Act. Key areas: patient data privacy, medical device classification (FDA 510(k) vs. PMA), clinical validation requirements, telemedicine licensing across state lines, and intellectual property protection for algorithms. Engage a regulatory attorney early — retroactive compliance is orders of magnitude more expensive than building it in from day one. Plan for audits, breach notification procedures, and patient consent workflows.",
    type: "Article",
    sectors: ["HealthTech"],
    authorName: "Laurel",
    readTime: "10 min read",
  },
  "6": {
    title: "AI Ethics and Responsible Development",
    content:
      "Building AI responsibly is both an ethical imperative and a competitive advantage. Start with a clear AI ethics framework covering fairness (bias detection and mitigation), transparency (explainable AI), accountability (human-in-the-loop oversight), and privacy (data minimization). Conduct regular algorithm audits using tools like IBM AI Fairness 360 or Google's What-If Tool. Document your training data sources, labeling practices, and model limitations. Publish a responsible AI statement on your website. As regulations like the EU AI Act take effect, early adopters of ethical practices will face fewer compliance hurdles.",
    type: "Guide",
    sectors: ["AI/ML"],
    authorName: "Tom",
    readTime: "20 min read",
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
