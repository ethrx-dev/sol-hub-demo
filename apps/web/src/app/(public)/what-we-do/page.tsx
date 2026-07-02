"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { DynamicPage } from "@/src/components/admin/section-renderers";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const PILLARS = [
  {
    id: "innovators",
    title: "Innovators",
    subtitle: "Build Your Idea",
    description:
      "We help innovators refine, fund, and ground their projects. From inspiration to implementation, our guided proposal portal and community support turn your vision into a thriving business.",
    benefits: [
      "Guided project proposal portal with structured templates",
      "AI-powered matching with relevant mentors and investors",
      "Milestone tracking and budget management tools",
      "Access to a supportive community of fellow founders",
      "Pitch feedback and preparation resources",
    ],
    cta: "Submit Your Idea",
    href: "/register",
    icon: "/sol-icon-color.svg",
  },
  {
    id: "mentors",
    title: "Mentors",
    subtitle: "Help Others Grow",
    description:
      "We connect experienced mentors, land stewards, and conscious investors with innovators who need their guidance. Share your expertise, shape the next generation of entrepreneurs, and be part of something bigger.",
    benefits: [
      "Browse vetted innovator projects aligned with your expertise",
      "Flexible mentorship — from one-off advice to long-term guidance",
      "Track impact through project milestones and founder growth",
      "Connect with a network of like-minded mentors and investors",
      "Earn recognition and rewards for your contributions",
    ],
    cta: "Become a Mentor",
    href: "/register",
    icon: "/sol-icon-color.svg",
  },
  {
    id: "investors",
    title: "Conscious Investors",
    subtitle: "Support Ideas That Matter",
    description:
      "Conscious Investors provide capital, resources, and bring ideas to life. Discover impact-driven startups vetted by our community and invest in ventures that align with your values and financial goals.",
    benefits: [
      "Curated deal flow of vetted, impact-driven projects",
      "Detailed financials, budgets, and milestone-based funding triggers",
      "Portfolio tracking with real-time project updates",
      "Co-invest alongside other conscious investors",
      "Direct communication with founding teams",
    ],
    cta: "Start Investing",
    href: "/register",
    icon: "/sol-icon-color.svg",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Submit an Idea",
    description:
      "Innovators pitch their projects through our guided proposal portal with structured templates for budgets, milestones, and team details.",
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "Our AI-powered platform matches innovators with mentors and investors based on sector expertise, interest alignment, and project stage.",
  },
  {
    number: "03",
    title: "Co-Create",
    description:
      "Projects receive funding, mentorship, and community support. Track progress through milestones, release funds on triggers, and grow together.",
  },
];

const HUB_FEATURES = [
  {
    title: "See Projects",
    description: "Browse all active projects in the community and follow their progress.",
  },
  {
    title: "Be Paired",
    description: "Get matched with the right people — whether you need funding, guidance, or both.",
  },
  {
    title: "Connect",
    description: "Engage with members through feeds, groups, forums, events, and direct messaging.",
  },
];

export default function WhatWeDoPage() {
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/pages/what-we-do`)
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
      {/* ============ HERO ============ */}
      <section className="relative bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
        <div className="absolute -top-10 -right-10 opacity-[0.07] pointer-events-none">
          <img src="/sol-asset-3.svg" alt="" className="w-[200px] sm:w-[300px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <img src="/sol-icon.svg" alt="SOL" className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-[5rem] leading-[1.1] font-heading">
              What We Do
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
              SOL Hub is a private membership platform where innovators, mentors, and conscious
              investors come together to incubate, fund, and scale impact-driven ventures.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register" className="btn-sol btn-sol-primary uppercase text-sm">
                Join SOL Today
              </Link>
              <Link href="#how-it-works" className="btn-sol btn-sol-outline uppercase text-sm">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TOOLS & RESOURCES ============ */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="absolute -right-10 bottom-0 opacity-[0.04] pointer-events-none rotate-12">
          <img src="/sol-asset-3.svg" alt="" className="w-[180px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">One Step for Everyone</h2>
            <p className="mt-2 text-lg font-heading text-primary">Create solutions with us</p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h3 className="text-2xl font-bold font-heading">Tools, resources, and connections to help you launch transformative ideas</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                At Spaces of Learning (SOL), we are building the foundation for a New Earth through <strong>AdVenture Capitalism</strong>&mdash;a heart-centered approach to entrepreneurship that blends visionary ideas with experienced guidance and conscious capital. SOL is a hub for spiritual entrepreneurs, mentors, and investors dedicated to building meaningful, values-driven livelihoods that make a real impact.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                There are big gaps with unmet needs that mean opportunity for business creation in:
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {["Wellness", "Education", "Housing", "Elder Care", "Climate Adaptation", "Mental Health"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-[0_40px_0_40px] overflow-hidden shadow-lg">
                <img
                  src="/sol-team-tomlaurel.jpg"
                  alt="SOL Hub founders"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PILLARS OVERVIEW ============ */}
      <section className="py-20 bg-sage-light/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">Three Pillars, One Mission</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              SOL Hub brings together the essential ingredients for venture success — visionary
              ideas, experienced guidance, and conscious capital.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <Card key={pillar.id} className="border-0 shadow-md bg-white relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] pointer-events-none">
                  <img src={pillar.icon} alt="" className="w-full h-full" />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold font-heading">{pillar.title}</h3>
                  <p className="mt-1 text-sm font-medium text-primary font-heading">{pillar.subtitle}</p>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                  <Link
                    href={`/${pillar.id}`}
                    className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline mt-4"
                  >
                    Learn More &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IT WORKS BECAUSE (DIAGRAM) ============ */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">It Works Because</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Each pillar brings something essential. Together they form an unbroken cycle of creation, guidance, and support.
            </p>
          </div>
          <div className="mt-16 grid gap-6 lg:grid-cols-3 items-start">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <span className="text-4xl font-black text-primary font-heading">I</span>
              </div>
              <h3 className="mt-6 text-xl font-bold font-heading">Innovators</h3>
              <p className="mt-2 text-muted-foreground">Bring the vision, passion, and drive to create something new.</p>
            </div>
            <div className="flex items-center justify-center text-3xl text-muted-foreground/40 font-heading max-lg:hidden">
              +
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <span className="text-4xl font-black text-primary font-heading">M</span>
              </div>
              <h3 className="mt-6 text-xl font-bold font-heading">Mentors</h3>
              <p className="mt-2 text-muted-foreground">Bring the wisdom, experience, and guidance to navigate the way.</p>
            </div>
            <div className="flex items-center justify-center text-3xl text-muted-foreground/40 font-heading max-lg:hidden">
              +
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <span className="text-4xl font-black text-primary font-heading">C</span>
              </div>
              <h3 className="mt-6 text-xl font-bold font-heading">Conscious Investors</h3>
              <p className="mt-2 text-muted-foreground">Bring the capital, resources, and trust to bring ideas to life.</p>
            </div>
          </div>
          <div className="mt-12 mx-auto max-w-2xl text-center">
            <div className="rounded-[0_30px_0_30px] bg-primary/5 p-8">
              <p className="text-lg font-heading font-bold text-primary">
                Innovators &times; Mentors &times; Conscious Investors ={" "}
                <span className="text-foreground">Regenerative Impact</span>
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Each piece is essential. When all three converge, ideas become enterprises, guidance becomes legacy, and capital becomes lasting change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ INNOVATORS DEEP DIVE ============ */}
      <section id="innovators" className="relative py-20 bg-sage-light/30">
        <div className="absolute left-0 top-0 opacity-[0.04] pointer-events-none">
          <img src="/sol-asset-3.svg" alt="" className="w-[180px]" />
        </div>
        <div className="absolute -right-10 bottom-0 opacity-[0.04] pointer-events-none rotate-180">
          <img src="/sol-icon.svg" alt="" className="w-[180px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative">
          <div className="flex justify-center mb-6">
            <img src="/sol-shape-gardenie.png" alt="" className="h-12 w-auto opacity-30" />
          </div>
          <h2 className="text-4xl font-bold font-heading">Our Mission</h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            We believe that the most impactful businesses are built at the intersection of visionary
            ideas, experienced guidance, and conscious capital. SOL Hub is where that convergence
            happens. Any age, any person can start a business becoming the architect of your life.
          </p>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-20 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.04] pointer-events-none">
          <img src="/sol-asset-5.svg" alt="" className="w-[400px] sm:w-[600px]" />
        </div>
        <div className="absolute -bottom-10 left-0 opacity-[0.04] pointer-events-none rotate-45">
          <img src="/sol-asset-3.svg" alt="" className="w-[150px]" />
        </div>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8 relative">
          <div className="flex justify-center gap-2 mb-6">
            <img src="/sol-icon-color.svg" alt="" className="h-8 w-8 opacity-30" />
            <img src="/sol-icon-color.svg" alt="" className="h-8 w-8 opacity-50" />
            <img src="/sol-icon-color.svg" alt="" className="h-8 w-8 opacity-70" />
            <img src="/sol-icon-color.svg" alt="" className="h-8 w-8 opacity-50" />
            <img src="/sol-icon-color.svg" alt="" className="h-8 w-8 opacity-30" />
          </div>
          <h2 className="text-4xl font-bold font-heading">Ready to Make an Impact?</h2>
          <p className="mt-3 text-muted-foreground">
            Whether you&apos;re an innovator, mentor, or conscious investor — there&apos;s a place
            for you at SOL Hub.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn-sol btn-sol-primary uppercase text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
