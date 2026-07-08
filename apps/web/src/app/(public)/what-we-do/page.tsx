"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DynamicPage } from "@/src/components/admin/section-renderers";
import { Rocket, GraduationCap, Handshake, Check, ArrowRight } from "lucide-react";

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

const slides = [
  "/hero-1.jpg",
  "/hero-2.jpg",
  "/hero-3.jpg",
  "/hero-4.jpg",
];

const pillars = [
  {
    title: "Innovators",
    desc: "We help innovators refine, fund, and ground their projects.",
    cta: "Build your idea",
    href: "/innovators",
    icon: Rocket,
    isAccent: false,
  },
  {
    title: "Mentors",
    desc: "We connect mentors, land stewards, and conscious investors to support projects.",
    cta: "Help Others",
    href: "/mentors",
    icon: GraduationCap,
    isAccent: true,
  },
  {
    title: "Conscious Investors",
    desc: "Conscious\u00a0Investors provide capital, resources, and bring ideas to life.",
    cta: "Support Ideas",
    href: "/investors",
    icon: Handshake,
    isAccent: false,
  },
];

const features = [
  {
    icon: "clipboard",
    title: "Plan Ahead",
    desc: "At SOL, we help you turn your vision into a structured, actionable plan. With guided proposal frameworks and access to resources, you\u2019ll have the tools to map out your idea and prepare for success. Planning ahead ensures your project is built on a solid foundation.",
  },
  {
    icon: "users",
    title: "Start-Up Mentor",
    desc: "Every innovator at SOL is paired with a mentor who aligns with their vision. These experienced guides provide personalized advice, share practical knowledge, and help you navigate challenges. With a mentor by your side, you\u2019ll have the support needed to bring your idea to life.",
  },
  {
    icon: "dollar",
    title: "Financial Support",
    desc: "SOL connects you with heart-centered investors who believe in your mission. Gain access to aligned capital, and opportunities to co-create enterprises. Financial support from SOL ensures you have the resources to execute your vision.",
  },
  {
    icon: "shield",
    title: "Future Proof",
    desc: "We focus on sustainability and long-term impact. By joining SOL, you\u2019ll learn how to future-proof your project through regenerative practices and innovative strategies. Build something that not only thrives today but also creates a legacy for tomorrow.",
  },
];

const benefits = [
  {
    title: "Find a Project",
    desc: "Discover purpose-driven projects that align with your values. As an Conscious Investor, you gain curated access to vetted ideas focused on sustainability, collaboration, and global impact. From clean energy innovations to community-building initiatives, SOL connects you with opportunities to make a meaningful difference.",
  },
  {
    title: "Support with Love",
    desc: "Invest in more than just financial returns\u2014invest in regenerative change. At SOL, we prioritize heart-centered investments that amplify love, purpose, and innovation. By supporting projects with compassion and intention, you help create a ripple effect of positive impact that transforms lives and communities.",
  },
  {
    title: "Protected Ecosystem",
    desc: "Join a trusted network designed to foster transparency, collaboration, and long-term success. SOL\u2019s secure ecosystem ensures your investments are protected and aligned with projects that prioritize sustainability and ethical practices. Together, we build enterprises that thrive today and leave a legacy for tomorrow.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Present Your Purpose",
    desc: "Share your vision with us by submitting your idea through our guided proposal portal. Clearly outline your purpose and how it aligns with SOL\u2019s mission to create sustainable and regenerative solutions.",
  },
  {
    number: "02",
    title: "Join the Community",
    desc: "Become a member of our global network of innovators, mentors, and investors. Gain access to exclusive resources, mentorship opportunities, and a supportive ecosystem designed to help you thrive.",
  },
  {
    number: "03",
    title: "Co-Create and Grow",
    desc: "Collaborate with like-minded individuals, receive funding, and bring your idea to life. Together, we\u2019ll build impactful projects that regenerate Earth and create lasting change.",
  },
];

export default function WhatWeDoPage() {
  const [cmsPage, setCmsPage] = useState<CMSPage | null | "loading">("loading");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden px-5 sm:px-10 pb-[50px] pt-5">
        <div
          className="relative min-h-[84vh] overflow-hidden flex items-center"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          {slides.map((src, idx) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: idx === activeSlide ? 1 : 0 }}
            >
              <div
                className="h-full w-full bg-cover bg-center scale-110 transition-transform duration-[8000ms]"
                style={{
                  backgroundImage: `url(${src})`,
                  transform: idx === activeSlide ? "scale(1)" : "scale(1.15)",
                }}
              />
            </div>
          ))}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)",
              opacity: 0.5,
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
                Spaces Of Learning
              </h2>
              <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">
                What we do
              </h2>
              <p className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
                Guide and nurture first time entrepreneurs
              </p>
              <p className="mt-2 text-[1.4rem] text-white font-sans">
                We get you over the hurdle of how to start
              </p>
              <p className="mt-6 text-[1.4rem] text-white max-w-3xl mx-auto font-sans">
                SOL Empowers innovators to turn their visions into reality
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ONE STEP FOR EVERYONE ===== */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-muted-foreground">
            One Step for everyone
          </h2>
          <h2 className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
            Create solutions with us
          </h2>
        </div>
      </section>

      {/* ===== TOOLS & RESOURCES ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">
                Tools, resources, and connections to help you launch transformative ideas
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                At Spaces of Learning (SOL), we are building the foundation for a New Earth
                through <strong>AdVenture Capitalism</strong>&mdash;a heart-centered approach to
                entrepreneurship that blends youthful innovation with elder wisdom and conscious
                capital. SOL is a hub for spiritual entrepreneurs, mentors, and investors dedicated
                to building meaningful, values-driven livelihoods that make a real impact.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                There are big gaps with unmet needs that mean opportunity for business creation in
              </p>
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                {["wellness", "education", "housing", "elder care", "climate adaptation", "mental health"].map((item) => (
                  <span key={item} className="text-muted-foreground italic">
                    *{item}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden shadow-lg" style={{ borderRadius: "0 40px 0 40px" }}>
                <img
                  src="/wwd-tools.jpg"
                  alt="Tools and resources"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 PILLAR CARDS ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={p.title}
                  className={`relative flex flex-col items-center text-center min-h-[380px] px-5 py-[70px] ${
                    p.isAccent ? "bg-primary text-white" : "bg-secondary text-white"
                  }`}
                  style={{ borderRadius: isEven ? "0 70px 0 70px" : "70px 0 70px 0" }}
                >
                  <Icon className="h-[74px] w-[74px] mb-6 text-accent" />
                  <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent mb-4">{p.title}</h2>
                  <p className="text-base text-white max-w-xs">{p.desc}</p>
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-2 mt-8 text-sm font-medium uppercase tracking-wider text-accent hover:text-white"
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 4 FEATURE CARDS ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-10 bg-white"
                style={{
                  borderRadius: "20px 0 20px 0",
                  boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 text-accent" style={{ fontSize: "41px" }}>
                    {f.icon === "clipboard" && <Rocket className="h-[41px] w-[41px]" />}
                    {f.icon === "users" && <GraduationCap className="h-[41px] w-[41px]" />}
                    {f.icon === "dollar" && <Handshake className="h-[41px] w-[41px]" />}
                    {f.icon === "shield" && <Rocket className="h-[41px] w-[41px]" />}
                  </div>
                  <div>
                    <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{f.title}</h3>
                    <p className="mt-3 text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENTORS SECTION ===== */}
      <section className="relative py-20 overflow-hidden" style={{ background: "#000000" }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/wwd-mentors-bg.jpg)" }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
                Business &amp; SOL Guidance
              </h2>
              <h3 className="mt-2 text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">
                Mentors with a purpose
              </h3>
              <p className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
                The Guide, Teacher, or Muse that will propel your idea!
              </p>
              <p className="mt-6 text-white leading-relaxed">
                Mentors share wisdom, frameworks, and practical experience with innovators and
                builders.
              </p>
              <p className="mt-4 text-white leading-relaxed">
                They act as stabilizing anchors in the ecosystem, bridging knowledge and embodiment.
              </p>
              <p className="mt-4 text-white font-bold">You&apos;ll gain:</p>
              <ul className="mt-2 space-y-2">
                {["Access to aligned mentees and co-creators", "Invitation to workshops and think tanks", "The chance to co-author regenerative case studies"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <Check className="h-5 w-5 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-white italic">
                Submit your video today and tell us about what skills you have to share.
              </p>
              <Link
                href="/mentors"
                className="btn-sol uppercase text-sm text-white mt-8 inline-block"
                style={{
                  background: "#729D64",
                  borderRadius: "0 30px 0 30px",
                  padding: "20px 40px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EFC89A";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#729D64";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                Learn More
              </Link>
            </div>
            <div>
              <div className="aspect-square overflow-hidden shadow-lg" style={{ borderRadius: "0 100px 0 100px" }}>
                <img src="/wwd-mentors-team.jpg" alt="Mentors" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INVESTORS SECTION ===== */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
                Invest in ideas
              </h2>
              <h3 className="mt-2 text-[2.2rem] font-bold font-heading leading-[1.1em] text-foreground">
                The Conscious Investor
              </h3>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Turn dreams into reality by providing the support, resources, and guidance needed
                to bring visionary ideas to life. They champion projects that prioritize
                sustainability, collaboration, and global impact, helping innovators achieve their
                purpose.
              </p>
              <p className="mt-4 text-muted-foreground italic">
                Share your story with us and we will build trust with the right process.
              </p>
              <Link
                href="/investors"
                className="btn-sol uppercase text-sm text-white mt-8 inline-block"
                style={{
                  background: "#729D64",
                  borderRadius: "0 30px 0 30px",
                  padding: "20px 40px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EFC89A";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#729D64";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 BENEFIT CARDS ===== */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((b, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={b.title}
                  className={`p-10 ${i === 1 ? "bg-primary text-white" : "bg-secondary text-white"}`}
                  style={{ borderRadius: isEven ? "0 70px 0 70px" : "70px 0 70px 0" }}
                >
                  <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent mb-4">{b.title}</h3>
                  <p className="text-white leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ARE YOU READY CTA ===== */}
      <section className="relative py-20 text-center overflow-hidden" style={{ background: "#000000" }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/wwd-cta-bg.jpg)" }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
            Are you ready?
          </h2>
          <h2 className="mt-4 text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">
            Let&apos;s empower Visionaries to Regenerate Earth
          </h2>
        </div>
      </section>

      {/* ===== 3 PROCESS STEPS ===== */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {processSteps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={step.number}
                  className="text-center p-10 bg-white"
                  style={{
                    borderRadius: isEven ? "20px 0 20px 0" : "0 20px 0 20px",
                    boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)",
                  }}
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent mb-6"
                    style={{ borderRadius: "0 16px 0 16px", border: "2px solid #EFC89A" }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden mt-10 mb-10 px-5">
        <div
          className="relative min-h-[84vh] flex items-center overflow-hidden"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/wwd-cta-bg.jpg)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)",
            opacity: 0.5,
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center w-full">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
            Bringing a higher future to the present
            </h2>
            <h2 className="mt-4 text-[2.6rem] font-bold font-heading leading-[1.1em] text-white">
              Tell us your idea &amp; we are here to make it come true!
            </h2>
            <p className="mt-6 text-[1.4rem] text-white max-w-3xl mx-auto font-sans">
              Let&apos;s get together and build new opportunities.
            </p>
            <div className="mt-10 flex items-center justify-center gap-[10px] flex-wrap">
              <Link
                href="/register"
                className="btn-sol uppercase text-sm text-white"
                style={{
                  background: "#729D64",
                  borderRadius: "0 30px 0 30px",
                  padding: "20px 40px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EFC89A";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#729D64";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                SIGN-UP
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
