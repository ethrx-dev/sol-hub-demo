"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/lib/auth";
import { DynamicPage } from "@/src/components/admin/section-renderers";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

export default function InvestorsPage() {
  const { isAuthenticated } = useAuth();
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/pages/investors`)
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
                <div className="flex h-12 w-12 items-center justify-center rounded-[0_16px_0_16px] bg-primary/10">
                  <img src="/sol-icon-color.svg" alt="" className="h-6 w-6 opacity-60" />
                </div>
                <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Conscious Investors</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-heading">
                Invest with{" "}
                <span className="text-primary">Purpose</span>
              </h1>
              <p className="mt-2 text-sm font-medium text-primary uppercase tracking-wider font-heading">
                AdVenture Capitalist &mdash; The Conscious Investor
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover vetted, impact-driven startups and invest in ventures that align with your values and financial goals.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={isAuthenticated ? "/investor/browse" : "/register?pillar=investors"}
                  className="btn-sol btn-sol-primary text-sm"
                >
                  Start Investing
                </Link>
                <Link href="/what-we-do" className="btn-sol btn-sol-outline text-sm">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] rounded-[0_40px_0_40px] overflow-hidden shadow-lg">
                <img src="/sol-investors-team.jpg" alt="Conscious Investors" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Conscious Capital</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Align Your Capital with Your Values</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Conscious investing means looking beyond financial returns to consider the impact your capital has on people and the planet. At SOL, we connect you with vetted, impact-driven ventures that are building regenerative solutions for the New Earth.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Curated Deal Flow", desc: "Access a carefully vetted pipeline of impact-driven projects ready for funding." },
              { title: "Full Transparency", desc: "Detailed financials, budgets, milestone-based funding triggers, and direct founder communication." },
              { title: "Portfolio Tracking", desc: "Real-time project updates, impact metrics, and co-investment opportunities." },
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
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Invest with Confidence</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Curated Access to Vetted Projects", desc: "Gain exclusive access to a carefully vetted pipeline of purpose-driven ideas aligned with your values and impact goals." },
              { title: "Transparent Funding Pathways", desc: "Ensure clarity on where your investments go with detailed financials, milestone-based funding triggers, and regular ROI reports." },
              { title: "Co-Creation Opportunities", desc: "Collaborate directly with innovators to build enterprises that leave a lasting legacy. Co-own and co-create ventures that matter." },
            ].map((item) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-sage-light/30 p-8 text-center">
                <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Be an AdVenture Capitalist */}
      <section className="relative py-20 bg-sage-light/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Why Be an AdVenture Capitalist</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Invest in More Than Returns</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              AdVenture Capitalists don&apos;t just invest in ROI — they invest in <strong>regenerative return</strong>: projects that yield impact, education, and long-term legacy.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Regenerative Returns", desc: "Invest in projects that deliver more than financial ROI — impact, education, and long-term sustainability that multiplies over time." },
              { title: "Shape the Future", desc: "Be part of a movement redefining success through love, purpose, and innovation. Your capital powers the solutions of tomorrow." },
              { title: "Empower Visionaries", desc: "Help bring groundbreaking ideas to life and drive meaningful global change by supporting the next generation of changemakers." },
            ].map((item) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How They Help Innovators */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">How You Help Innovators</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Your Role in the Ecosystem</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Turn dreams into reality by providing the support, resources, and guidance needed to bring visionary ideas to life. Champion projects that prioritize sustainability, collaboration, and global impact.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Curated Access to Projects", desc: "Gain exclusive access to vetted, purpose-driven ideas aligned with your values. From clean energy to community-building, find projects that inspire." },
              { title: "Transparent Funding Pathways", desc: "Ensure clarity on where your investments go and how they create change. Every dollar is tracked against milestones and impact metrics." },
              { title: "Co-Creation Opportunities", desc: "Collaborate directly with innovators to build enterprises that leave a lasting legacy. Your expertise is as valuable as your capital." },
            ].map((item) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-sage-light/30 p-8 text-center">
                <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Cards: Find, Support, Secure */}
      <section className="relative py-20 bg-sage-light/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold font-heading">Find a Project</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Discover purpose-driven projects that align with your values. As an AdVenture Capitalist, you gain curated access to vetted ideas focused on sustainability, collaboration, and global impact.
              </p>
            </div>
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold font-heading">Support with Love</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Invest in more than just financial returns — invest in regenerative change. We prioritize heart-centered investments that amplify love, purpose, and innovation.
              </p>
            </div>
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold font-heading">Secure Ecosystem</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Join a trusted network designed to foster transparency, collaboration, and long-term success. Your investments are protected and aligned with projects that prioritize sustainability and ethical practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              From discovery to deployment — a transparent, values-aligned process.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Discover", desc: "Browse curated projects aligned with your impact areas and investment criteria." },
              { title: "Evaluate", desc: "Access detailed financials, team backgrounds, and milestone-based funding plans." },
              { title: "Invest & Track", desc: "Fund projects, release capital on milestones, and track real-time impact." },
            ].map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary font-heading">
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
          <h2 className="text-3xl font-bold font-heading sm:text-4xl">Ready to Invest in the Future?</h2>
          <p className="mt-3 text-muted-foreground">
            Join a community of conscious investors building a better world.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href={isAuthenticated ? "/investor/browse" : "/register?pillar=investors"}
              className="btn-sol btn-sol-primary uppercase text-sm"
            >
              Start Investing
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
