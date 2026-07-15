"use client";

import { useState, useEffect } from "react";
import { DynamicPage } from "@/src/components/admin/section-renderers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Lightbulb, Users, HandshakeIcon, Leaf, ArrowRight } from "lucide-react";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const offerings = [
  {
    title: "Discovery & Coaching",
    description: "Guided self-discovery to help individuals identify their skills, passions, and strengths — then map them to meaningful work.",
    icon: Lightbulb,
  },
  {
    title: "Mentorship Matching",
    description: "Connect with experienced mentors who support both personal growth and project development through one-on-one guidance.",
    icon: Users,
  },
  {
    title: "Community & Collaboration",
    description: "Join a vibrant community of purpose-driven individuals for collaboration, accountability, and shared learning.",
    icon: HandshakeIcon,
  },
  {
    title: "Conscious Capital",
    description: "Access funding connections for projects aligned with regenerative and social good values — from grants to impact investors.",
    icon: Leaf,
  },
];

const process = [
  { step: "01", title: "Explore", description: "Discover your strengths and what matters to you." },
  { step: "02", title: "Connect", description: "Find mentors, collaborators, and community." },
  { step: "03", title: "Build", description: "Develop your project with guidance and support." },
  { step: "04", title: "Launch", description: "Bring your solution to the world with funding and partnerships." },
];

export default function ServicesPage() {
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/pages/services`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setCmsPage(data))
      .catch(() => setCmsPage(null));
  }, []);

  if (cmsPage && cmsPage !== "loading" && cmsPage.sections && cmsPage.sections.length > 0) {
    return <DynamicPage sections={cmsPage.sections} />;
  }

  return (
    <>
      <section className="px-5 sm:px-10 pt-5">
        <div
          className="relative overflow-hidden flex items-center min-h-[50vh]"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/about-hero-bg.jpg)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)",
              opacity: 0.5,
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Spaces Of Learning</h2>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">Our Services</h1>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                We provide the tools, community, and capital to turn purpose-driven ideas into thriving realities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black font-heading">What We Offer</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover your path, develop your skills, and make an impact.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {offerings.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-l-4 border-l-primary">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="mt-1 rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="mt-1 text-base">{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black font-heading">How It Works</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple path from where you are to where you want to be.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {process.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black font-heading">Ready to Get Started?</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Whether you&apos;re exploring your path, building a project, or looking to support purpose-driven work — there&apos;s a place for you here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Join Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
