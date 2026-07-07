"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Shield, Users, BarChart3 } from "lucide-react";
import { DynamicPage } from "@/src/components/admin/section-renderers";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const benefits = [
  { title: "Find a Project", desc: "Discover purpose-driven projects that align with your values. As a Conscious Investor, you gain curated access to vetted ideas focused on sustainability, collaboration, and global impact. From clean energy innovations to community-building initiatives, SOL connects you with opportunities to make a meaningful difference." },
  { title: "Support with Love", desc: "Invest in more than just financial returns—invest in regenerative change. At SOL, we prioritize heart-centered investments that amplify love, purpose, and innovation. By supporting projects with compassion and intention, you help create a ripple effect of positive impact." },
  { title: "Protected Ecosystem", desc: "Join a trusted network designed to foster transparency, collaboration, and long-term success. SOL's secure ecosystem ensures your investments are protected and aligned with projects that prioritize sustainability and ethical practices." },
];

const portalSteps = [
  { icon: Users, title: "Make a Match", desc: "Once matched with an innovator, engage through our secure private portal with confidence and protection." },
  { icon: Shield, title: "Join the Community", desc: "Collaborate with heart-centered innovators and mentors committed to creating lasting change." },
  { icon: BarChart3, title: "Watch it grow", desc: "Track project milestones, review progress updates, and access detailed financial reports through your secure portal." },
];

export default function InvestorsPage() {
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
    <>
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/investors-hero-bg.jpg)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(26,26,46,0.85) 100%)" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Conscious Investor</h2>
          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">Align Your Capital with Purpose</h2>
          <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">Turn dreams into reality by providing the support, resources, and guidance needed to bring visionary ideas to life.</p>
        </div>
      </section>



      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-accent">GIVE WITH LOVE</span>
              <h2 className="mt-4 text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Empowering Change</h2>
              <p className="mt-2 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Connecting conscious investors with visionary innovators to regenerate communities, cultures, and ecosystems.</p>
              <p className="mt-6 text-muted-foreground leading-relaxed">At SOL, we connect conscious investors like you with transformative ideas and visionary innovators. Our trusted network and transparent process ensure your capital creates meaningful impact while fostering innovation and regeneration.</p>
              <p className="mt-4 text-muted-foreground italic">Share your story with us and we will build trust with the right process.</p>
            </div>
            <div>
              <div className="aspect-[4/3] overflow-hidden shadow-lg" style={{ borderRadius: "0 40px 0 40px" }}>
                <img src="/investors-hero.jpg" alt="Conscious Investors" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#f9fafb" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto h-[74px] w-[74px] text-accent mb-6" />
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Why Invest with SOL?</h2>
          <p className="mt-3 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Align your capital with purpose-driven innovation.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((b, i) => (
              <div key={b.title} className={`p-10 ${i === 1 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ borderRadius: i % 2 === 0 ? "0 70px 0 70px" : "70px 0 70px 0" }}>
                <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent mb-4">{b.title}</h3>
                <p className="text-white leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {portalSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center p-10 bg-white" style={{ borderRadius: i % 2 === 0 ? "20px 0 20px 0" : "0 20px 0 20px", boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)" }}>
                  <Icon className="mx-auto h-[41px] w-[41px] text-accent mb-4" />
                  <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/investors-cta-bg.jpg)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(26,26,46,0.85) 100%)" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">Make a dream reality!</h2>
          <h2 className="mt-4 text-[2.6rem] font-bold font-heading leading-[1em] text-white">Ready to Join the SOL Ecosystem?</h2>
          <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">We'd love to learn more about you. Connect with us and start making an impact today.</p>
          <Link href="/register" className="btn-sol uppercase text-sm text-white mt-10 inline-block"
            style={{ background: "#729D64", borderRadius: "0 30px 0 30px", padding: "20px 40px" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}>
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}
