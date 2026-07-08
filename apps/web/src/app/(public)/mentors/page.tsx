"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Handshake, Share2, TrendingUp, MessageCircle, Check } from "lucide-react";
import { DynamicPage } from "@/src/components/admin/section-renderers";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const benefits = [
  { icon: Share2, title: "Share Your Experiences", desc: "Bring your unique perspective to the table. Share lived experiences and insights that inspire and guide innovators on their journey." },
  { icon: TrendingUp, title: "Commit to Long-Term Impact", desc: "Join us in creating meaningful, sustainable change. Focus on impact and regeneration, not just short-term gains." },
  { icon: MessageCircle, title: "Be a Catalyst for Growth", desc: "Your guidance can be the turning point for a young innovator. Help shape the next generation of entrepreneurs." },
];

const gains = ["Access to aligned mentees and co-creators", "Invitation to workshops and think tanks", "The chance to co-author regenerative case studies"];

export default function MentorsPage() {
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
    <>
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/mentors-hero-bg.jpg)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(26,26,46,0.85) 100%)" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Mentors</h2>
          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">Empower Innovators, Shape the Future</h2>
          <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">Join SOL as a mentor and guide visionaries through challenges, growth, and meaningful impact.</p>
        </div>
      </section>



      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-accent">GET INVOLVED</span>
              <h2 className="mt-4 text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">How You Can Make a Difference</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">At SOL, mentors are the backbone of innovation. Your experience, wisdom, and unique perspective can shape the next generation of ideas. By joining us, you'll guide innovators through challenges, growth, and meaningful impact.</p>
              <p className="mt-4 text-muted-foreground font-bold">You'll gain:</p>
              <ul className="mt-2 space-y-2">
                {gains.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="h-5 w-5 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="aspect-[4/3] overflow-hidden shadow-lg" style={{ borderRadius: "0 40px 0 40px" }}>
                <img src="/mentors-hero.jpg" alt="Mentors" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#f9fafb" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Handshake className="mx-auto h-[74px] w-[74px] text-accent mb-6" />
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">Benefits to our Network</h2>
          <p className="mt-3 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Give back &amp; Find a Purpose</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="p-10 bg-white text-center" style={{ borderRadius: i % 2 === 0 ? "20px 0 20px 0" : "0 20px 0 20px", boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)" }}>
                  <Icon className="mx-auto h-[41px] w-[41px] text-accent mb-4" />
                  <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{b.title}</h3>
                  <p className="mt-3 text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/mentors-cta-bg.jpg)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(26,26,46,0.85) 100%)" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">Team UP with SOL</h2>
          <h2 className="mt-4 text-[2.6rem] font-bold font-heading leading-[1em] text-white">Ready to Make a Difference?</h2>
          <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">We're excited to hear from you. Share your story and let's work together to shape the future of innovation.</p>
          <Link href="/register" className="btn-sol uppercase text-sm text-white mt-10 inline-block"
            style={{ background: "#729D64", borderRadius: "0 30px 0 30px", padding: "20px 40px" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}>
            Join Today
          </Link>
        </div>
      </section>
    </>
  );
}
