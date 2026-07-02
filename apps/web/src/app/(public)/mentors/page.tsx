"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/lib/auth";
import { DynamicPage } from "@/src/components/admin/section-renderers";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

export default function MentorsPage() {
  const { isAuthenticated } = useAuth();
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/pages/mentors`)
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
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
        <div className="absolute -top-10 -right-10 opacity-[0.07] pointer-events-none">
          <img src="/sol-icon-color.svg" alt="" className="w-[200px] sm:w-[300px] lg:w-[400px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[0_16px_0_16px] bg-accent/20">
                  <img src="/sol-icon-color.svg" alt="" className="h-6 w-6 opacity-60" />
                </div>
                <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Mentors</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-heading">
                Share Your Wisdom,{" "}
                <span className="text-primary">Shape the Future</span>
              </h1>
              <p className="mt-2 text-sm font-medium text-primary uppercase tracking-wider font-heading">
                The Guide, Teacher, or Healer
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Your experience is the catalyst someone needs. Guide the next generation of entrepreneurs and be part of something bigger.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={isAuthenticated ? "/mentor/browse" : "/register?pillar=mentors"}
                  className="btn-sol btn-sol-primary text-sm"
                >
                  Become a Mentor
                </Link>
                <Link href="/what-we-do" className="btn-sol btn-sol-outline text-sm">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] rounded-[0_40px_0_40px] overflow-hidden shadow-lg">
                <img src="/sol-mentors-team.jpg" alt="Mentors collaborating" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mentor */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Why Mentor</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Your Experience Matters</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Mentorship is at the heart of SOL. By sharing your knowledge, skills, and perspective, you help innovators avoid pitfalls, gain confidence, and bring their visions to life. In return, you gain fresh perspectives, meaningful connections, and the satisfaction of shaping the future.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Give Back", desc: "Share the lessons you've learned and help others navigate their entrepreneurial journey." },
              { title: "Stay Inspired", desc: "Working with innovators keeps you at the cutting edge of new ideas and emerging trends." },
              { title: "Build Legacy", desc: "Your guidance creates ripples that extend far beyond a single project or person." },
            ].map((item) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-sage-light/30 p-8 text-center">
                <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* You'll Gain */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">What You&apos;ll Gain</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Your Impact as a Mentor</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Access to Aligned Mentees", desc: "Connect with purpose-driven innovators who are actively seeking your expertise. Browse projects that match your background and interests." },
              { title: "Workshops & Think Tanks", desc: "Get invited to exclusive workshops, brainstorm sessions, and strategic think tanks where your voice shapes the direction of new ventures." },
              { title: "Co-Author Case Studies", desc: "Partner with innovators to document and publish regenerative case studies that showcase the real-world impact of your guidance." },
            ].map((item) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-sage-light/30 p-8 text-center">
                <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-sage-light/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading sm:text-4xl">How Mentoring Works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Flexible engagement that fits your schedule and expertise.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Browse Projects", desc: "Explore vetted innovator projects aligned with your expertise and interests." },
              { title: "Choose Your Level", desc: "From one-off advice sessions to long-term guidance — you decide your commitment." },
              { title: "Track Impact", desc: "See the difference you're making through project milestones and founder growth." },
            ].map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-accent/20 text-3xl font-bold text-accent-foreground font-heading">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <h3 className="mt-6 text-xl font-bold font-heading">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-sage-light/30">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading sm:text-4xl">Ready to Make a Difference?</h2>
          <p className="mt-3 text-muted-foreground">
            Your guidance could be the turning point for the next great innovator.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href={isAuthenticated ? "/mentor/browse" : "/register?pillar=mentors"}
              className="btn-sol btn-sol-primary uppercase text-sm"
            >
              Become a Mentor
            </Link>
            <Link href="/what-we-do" className="btn-sol btn-sol-outline uppercase text-sm">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
