"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Rocket, FileText, Check } from "lucide-react";
import { DynamicPage } from "@/src/components/admin/section-renderers";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const helpItems = [
  "AdVenture Capital: Access funding to bring your idea to life.",
  "Mentorship: Work with an experienced mentor to refine your idea.",
  "Conscious Investors: Partner with investors who share your values.",
];

const portalItems = [
  "Classes: Learn from experts to build your skills.",
  "Solution Bank: Explore a library of innovative ideas.",
  "Forums: Engage in discussions with other changemakers.",
  "Networking: Connect with people who share your vision.",
];

const processSteps = [
  { icon: FileText, title: "Present Your Purpose", desc: "Share your vision with us by submitting your idea through our guided proposal portal. Clearly outline your purpose and how it aligns with SOL\u2019s mission to create sustainable and regenerative solutions." },
  { icon: Rocket, title: "Join the Community", desc: "Become a member of our global network of innovators, mentors, and investors. Gain access to exclusive resources, mentorship opportunities, and a supportive ecosystem designed to help you thrive." },
  { icon: FileText, title: "Co-Create and Grow", desc: "Collaborate with like-minded individuals, receive funding, and bring your idea to life. Together, we\u2019ll build impactful projects that regenerate Earth and create lasting change." },
];

export default function InnovatorsPage() {
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/pages/innovators`)
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
      {/* ===== 1. HERO ===== */}
      <section className="px-5 sm:px-10 pt-5">
        <div
          className="relative overflow-hidden flex items-center min-h-[78vh]"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/innovators-hero-bg.jpg)" }}
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
              <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Innovators</h2>
              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">Turn Your Idea into Reality with SOL</h2>
              <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">We empower innovators to transform their ideas into impactful solutions.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ===== 2. HERE TO HELP / CONTENT ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-start">
            <div>
              <span
                className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
                style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
              >
                HERE TO HELP
              </span>
              <h2 className="mt-4 text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">We Build The Future</h2>
              <h3 className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">Tools, resources, and connections to help you launch transformative ideas</h3>
              <p className="mt-6 text-muted-foreground leading-relaxed">Whether you&apos;ve spotted a problem, envisioned a solution, or already mapped out a plan, we&apos;re here to guide you every step of the way. Our mission is to help you bring your vision to life, no matter where you are in your journey.</p>
              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1">
                {["wellness", "education", "housing", "elder care", "climate adaptation", "mental health"].map((tag) => (
                  <span key={tag} className="text-muted-foreground italic">*{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="overflow-hidden shadow-lg" style={{ borderRadius: "0 100px 0 100px" }}>
                <img src="/innovators-hero.jpg" alt="Innovators" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. TAGLINE ===== */}
      <section className="py-16" style={{ background: "#f9fafb" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="shrink-0 text-accent" style={{ fontSize: "107px", lineHeight: "1", marginTop: "-20px" }}>
              <Rocket className="h-[107px] w-[107px]" />
            </div>
            <div>
              <span
                className="inline-block px-[15px] py-[5px] text-[12px] font-sans font-normal uppercase tracking-[3px] text-dark mb-6"
                style={{ background: "#EFC89A", borderRadius: "0 10px 0 10px" }}
              >
                INNOVATORS START YOUR ENGINE
              </span>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">The Dreamer, Builder, Visionary.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">Innovators bring forward regenerative ideas — from micro-farms and eco-domes to learning ecosystems and conscious tech.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. CONTENT SECTIONS (alternating dark/green cards) ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Recognize the Opportunity */}
          <div className="p-[70px]" style={{ background: "#5C6E56", borderRadius: "0 70px 0 70px" }}>
            <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Recognize the Opportunity</h2>
            <p className="mt-4 text-white leading-relaxed">
              Do you feel something&apos;s missing or know there&apos;s a better way? Maybe you&apos;ve already
              crafted a solution or have an idea that could make a real difference. At SOL, we believe
              every great innovation starts with recognizing a need or an opportunity. Whether it&apos;s a
              small improvement or a groundbreaking idea, we&apos;re here to help you take the next step.
            </p>
          </div>

          {/* Connect with the Right People */}
          <div className="p-[70px]" style={{ background: "#729D64", borderRadius: "70px 0 70px 0" }}>
            <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Connect with the Right People</h2>
            <p className="mt-4 text-white leading-relaxed">
              Innovation thrives when you have the right support. After reviewing your submission,
              we&apos;ll connect you with the resources you need to succeed. Here&apos;s how we can help:
            </p>
            <ul className="mt-4 space-y-2">
              {helpItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Share Your Vision */}
          <div className="p-[70px]" style={{ background: "#729D64", borderRadius: "70px 0 70px 0" }}>
            <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Share Your Vision</h2>
            <p className="mt-4 text-white leading-relaxed">
              Your ideas matter, and we want to hear them. Submit your concept by recording a short
              video. Answer a few simple prompts to explain your idea, why it&apos;s important, and how
              it could create positive change. Don&apos;t worry about making it perfect — just focus on
              sharing your passion and vision. Once you&apos;ve submitted your video, we&apos;ll take it from
              there.
            </p>
          </div>

          {/* Access the SOL Portal */}
          <div className="p-[70px]" style={{ background: "#5C6E56", borderRadius: "0 70px 0 70px" }}>
            <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">Access the SOL Portal</h2>
            <p className="mt-4 text-white leading-relaxed">
              Join a thriving community of like-minded innovators. The SOL Portal is your gateway to
              resources, tools, and connections that can help you succeed. Here&apos;s what you&apos;ll find:
            </p>
            <ul className="mt-4 space-y-2">
              {portalItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== 5. ARE YOU READY? CTA ===== */}
      <section className="py-24 text-center bg-footer">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">Are you ready?</h2>
          <h2 className="mt-4 text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">Kickstart your vision!</h2>
        </div>
      </section>

      {/* ===== 6. PROCESS STEPS ===== */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="p-10 bg-white"
                  style={{
                    borderRadius: i === 0 || i === 2 ? "20px 0 20px 0" : "0 20px 0 20px",
                    boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)",
                  }}
                >
                  <div
                    className="inline-flex items-center justify-center mb-6"
                    style={{
                      width: "91px",
                      height: "91px",
                      borderRadius: "50%",
                      background: "#EFC89A",
                    }}
                  >
                    <Icon className="h-[41px] w-[41px] text-dark" />
                  </div>
                  <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 7. FINAL CTA ===== */}
      <section className="px-5 sm:px-10 pb-5">
        <div
          className="relative overflow-hidden flex items-center min-h-[84vh]"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/innovators-cta-bg.jpg)" }}
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
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">Innovators Unite</h2>
              <h2 className="mt-4 text-[2.6rem] font-bold font-heading leading-[1em] text-white">Ready to Make an Impact?</h2>
              <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">The world needs your ideas, and we&apos;re here to help you bring them to life. Take the first step today by submitting your video.</p>
              <Link
                href="/register"
                className="btn-sol uppercase text-sm text-white mt-10 inline-block"
                style={{
                  background: "#729D64",
                  borderRadius: "0 30px 0 30px",
                  padding: "20px 40px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#EFC89A"; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#729D64"; e.currentTarget.style.color = "#fff"; }}
              >
                What&apos;s Your Idea?
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
