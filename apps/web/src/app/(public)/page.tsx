"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DynamicPage } from "@/src/components/admin/section-renderers";
import { Rocket, Handshake, GraduationCap, Users, Heart, FileText, Pen, ArrowRight, Compass } from "lucide-react";

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
    desc: "Conscious Investors provide capital, resources, and bring ideas to life.",
    cta: "Support Ideas",
    href: "/investors",
    icon: Handshake,
    isAccent: false,
  },
];

const steps = [
  {
    title: "Submit an Idea",
    desc: "Innovators pitch through our guided proposal portal.",
    icon: FileText,
  },
  {
    title: "Get Matched",
    desc: "Mentors and investors join based on interest and expertise.",
    icon: Users,
  },
  {
    title: "Co-Create",
    desc: "Projects receive funding, mentorship, and community support.",
    icon: Pen,
  },
];

interface CMSPage {
  sections: Array<{ id: string; type: string; data: Record<string, unknown> }>;
}

export default function LandingPage() {
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
    fetch(`${apiBase}/pages/home`)
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
      {/* 1. HERO */}
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
                Spaces of Learning
              </h2>
              <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[4rem] font-black font-heading leading-[1em] text-white">
                Nurture your dream into a successful business
              </h2>
              <p className="mt-6 text-lg sm:text-[1.4rem] text-white max-w-3xl mx-auto font-sans">
                SOL&apos;s helpful mentors, conscious investors and private business portal brings
                success for a better Earth.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/what-we-do"
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
                  Find Your Path
                </Link>
                <Link
                  href="/become-a-member"
                  className="btn-sol uppercase text-sm"
                  style={{
                    background: "transparent",
                    border: "2px solid #EFC89A",
                    color: "#fff",
                    padding: "18px 40px",
                    borderRadius: "0 30px 0 30px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EFC89A";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#EFC89A";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  Join SOL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPIRITUAL ENTREPRENEUR TAGLINE */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-muted-foreground">
            Become a Spiritual Entrepreneur for Freedom
          </h2>
          <h2 className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
            Work For yourSelf * Have more income
          </h2>
        </div>
      </section>

      {/* 3. PILLAR CARDS + PARTICIPANT */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-foreground">
              Find the role that fits you
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Whether you have a clear vision or are just beginning to explore, there&apos;s a place for you here.
            </p>
          </div>
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
                  <p className="text-base text-white max-w-xs">
                    {p.desc}
                  </p>
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

          {/* PARTICIPANT CARD */}
          <div className="mt-8 flex justify-center">
            <div
              className="relative flex flex-col items-center text-center w-full max-w-lg px-8 py-12"
              style={{
                background: "linear-gradient(135deg, #f5f0e8 0%, #e8f0e3 100%)",
                borderRadius: "70px 0 70px 0",
                border: "2px dashed #729D64",
              }}
            >
              <div
                className="flex items-center justify-center mb-5"
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "#729D64",
                }}
              >
                <Compass className="h-9 w-9 text-white" />
              </div>
              <h2 className="text-[1.6rem] font-bold font-heading leading-[1.1em] text-foreground mb-2">
                Not sure where you fit?
              </h2>
              <p className="text-base text-muted-foreground max-w-sm">
                We get it. Maybe you&apos;re curious, exploring options, or just want to
                be part of something meaningful without a label. Join as a Participant —
                browse the hub, attend events, meet the community, and find your place
                when it feels right.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-accent font-medium">
                <span>No commitment required</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span>Explore freely</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span>Find your people</span>
              </div>
              <Link
                href="/register?role=participant"
                className="inline-flex items-center gap-2 mt-6 text-sm font-bold uppercase tracking-wider"
                style={{
                  color: "#729D64",
                  borderBottom: "2px solid #729D64",
                  paddingBottom: "4px",
                }}
              >
                I&apos;m Interested — Join as a Participant <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR MISSION */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-[1.8rem] font-bold font-heading leading-[1.1em] text-foreground">
                A hub for Innovation to Solution
              </h2>
              <h2 className="mt-3 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
                Any age, any person can start a business becoming the architect of your life
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                At SOL, our mission is to offer a nurturing, private space where ideas come to
                life, at any age. From inspiration to implementation, we support our members by
                providing practical knowledge and real-world skills to help bring their visions to
                market. By connecting innovators with mentors and essential resources, we empower
                individuals to transform their passions into impactful, sustainable ventures that
                enrich their communities and the world.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The New Earth needs fresh ideas, and SOL is here to deliver them in a whole new
                way: the SOL way. Join us and help make a difference!
              </p>
              <Link
                href="/become-a-member"
                className="btn-sol btn-sol-primary inline-flex mt-8 text-sm uppercase"
              >
                Join the Movement
              </Link>
            </div>
            <div className="relative" style={{ margin: "66px 0 0 23px" }}>
              <img
                src="/about-bg.jpg"
                alt="Spaces of Learning"
                className="w-full h-auto shadow-lg"
                style={{ borderRadius: "0 100px 0 100px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUOTE / PARALLAX */}
      <section className="relative py-[5em] px-[8em] text-center mt-[100px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/about-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-dark/55" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <Heart className="mx-auto mb-6 text-accent" style={{ fontSize: "94px", width: "94px", height: "94px" }} />
          <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-white">
            &ldquo;If you can dream it, you can achieve it.&rdquo; — Zig Ziglar
          </h2>
          <h2 className="mt-6 text-[1.8rem] font-bold font-heading leading-[1.1em] text-accent">
            Think Globally, Act Locally &amp; Connect Everywhere
          </h2>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-[2.2rem] font-bold font-heading leading-[1.1em] text-foreground">
            Collaboration Over Competition
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The future thrives on collaboration and cooperation, not competition. SOL fosters a
            global mindset with local action, creating solutions together.
          </p>
          <div className="mt-16 grid gap-[40px] md:grid-cols-3 max-w-[1038px] mx-auto">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="text-center p-10 bg-white"
                  style={{
                    borderRadius: "20px 0 20px 0",
                    boxShadow: "0px 0px 25px 5px rgba(0,0,0,0.12)",
                  }}
                >
                  <div className="mx-auto flex items-center justify-center mb-6 text-accent" style={{ fontSize: "91px" }}>
                    <Icon className="h-[91px] w-[91px]" />
                  </div>
                  <h3 className="text-[1.4rem] font-bold font-heading leading-[1.1em] text-foreground">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-12">
            <Link
              href="/become-a-member"
              className="btn-sol btn-sol-primary inline-flex uppercase text-sm"
              style={{ flexDirection: "row-reverse", gap: "22px" }}
            >
              <ArrowRight className="h-4 w-4" />
              Get Started Now!
            </Link>
          </div>
        </div>
      </section>

      {/* 7. JOIN SOL TODAY CTA */}
      <section className="relative overflow-hidden mt-10 mb-10 px-5">
        <div
          className="relative min-h-[84vh] flex items-center overflow-hidden"
          style={{ borderRadius: "0 150px 0 150px" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/community-bg.jpg)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(45deg, #000000 0%, #5C6E56 100%)",
              opacity: 0.5,
            }}
          />
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 pointer-events-none opacity-60">
            <img src="/sol-shape-gardenie.png" alt="" className="w-[120px] sm:w-[200px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center w-full">
            <h2 className="text-[2.6rem] font-bold font-heading leading-[1.1em] text-white">
              SPACES OF LEARNING
            </h2>
            <h2 className="mt-4 text-[1.4rem] font-bold font-heading leading-[1.1em] text-accent">
              Join SOL Today
            </h2>
            <p className="mt-6 text-[1.4rem] text-white max-w-3xl mx-auto font-sans">
              Be a part of the movement to create the New Earth. Whether you&apos;re an
              entrepreneur, investor, mentor, or dreamer, SOL is your platform to make a
              difference. Let&apos;s build a better world together.
            </p>
            <div className="mt-10 flex items-center justify-center gap-[10px] flex-wrap">
              <Link
                href="/become-a-member"
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
                Become a Member
              </Link>
              <Link
                href="/what-we-do"
                className="btn-sol uppercase text-sm text-white"
                style={{
                  background: "#02010100",
                  border: "2px solid #EFC89A",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#729D64";
                  e.currentTarget.style.borderColor = "#729D64";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#EFC89A";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
