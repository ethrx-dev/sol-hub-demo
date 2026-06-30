"use client";

import Link from "next/link";
import { useAuth } from "@/src/lib/auth";

export default function InnovatorsPage() {
  const { isAuthenticated } = useAuth();
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
                <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Innovators</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-heading">
                Turn Your Idea into{" "}
                <span className="text-primary">Reality</span>
              </h1>
              <p className="mt-2 text-sm font-medium text-primary uppercase tracking-wider font-heading">
                The Dreamer, Builder, Visionary
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                We empower innovators to transform their ideas into impactful solutions. From inspiration to implementation, we guide you every step of the way.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={isAuthenticated ? "/innovator/projects" : "/register?pillar=innovators"}
                  className="btn-sol btn-sol-primary text-sm"
                >
                  Submit Your Idea
                </Link>
                <Link href="/what-we-do" className="btn-sol btn-sol-outline text-sm">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] rounded-[0_40px_0_40px] overflow-hidden shadow-lg">
                <img src="/sol-hero-family.jpg" alt="Innovator with laptop" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Here to Help</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">We Build the Future</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tools, resources, and connections to help you launch transformative ideas.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you&apos;ve spotted a problem, envisioned a solution, or already mapped out a plan, we&apos;re here to guide you every step of the way. Our mission is to help you bring your vision to life, no matter where you are in your journey.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {["Wellness", "Education", "Housing", "Elder Care", "Climate Adaptation", "Mental Health"].map((item) => (
                <span key={item} className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* You'll Gain */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">What You&apos;ll Gain</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">Your Path to Impact</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Guided Proposal Frameworks", desc: "Structured templates and step-by-step guidance to turn your vision into a clear, actionable plan ready for pitch." },
              { title: "Mentorship & Pitch Opportunities", desc: "Get paired with experienced mentors and present your idea to aligned investors through exclusive pitch sessions." },
              { title: "Visibility in the Ecosystem", desc: "Your project gains exposure across the SOL network — connecting you with collaborators, funders, and community support." },
            ].map((item) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-sage-light/30 p-8 text-center">
                <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunity + Connect + Vision + Portal */}
      <section className="relative py-20 bg-sage-light/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-[0_16px_0_16px] bg-primary/10">
                <span className="text-2xl font-bold text-primary font-heading">01</span>
              </div>
              <h3 className="mt-4 text-xl font-bold font-heading">Recognize the Opportunity</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Do you feel something&apos;s missing or know there&apos;s a better way? Maybe you&apos;ve already crafted a solution or have an idea that could make a real difference. At SOL, we believe every great innovation starts with recognizing a need or an opportunity.
              </p>
            </div>
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-[0_16px_0_16px] bg-accent/20">
                <span className="text-2xl font-bold text-accent-foreground font-heading">02</span>
              </div>
              <h3 className="mt-4 text-xl font-bold font-heading">Connect with the Right People</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Innovation thrives when you have the right support. After reviewing your submission, we&apos;ll connect you with resources to succeed &mdash; funding through AdVenture Capital, mentorship from experienced guides, and conscious investors who share your values.
              </p>
            </div>
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-[0_16px_0_16px] bg-primary/10">
                <span className="text-2xl font-bold text-primary font-heading">03</span>
              </div>
              <h3 className="mt-4 text-xl font-bold font-heading">Share Your Vision</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Your ideas matter. Record a short video answering a few simple prompts about your idea, why it&apos;s important, and how it could create positive change. Don&apos;t worry about perfection &mdash; just share your passion and vision.
              </p>
            </div>
            <div className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-[0_16px_0_16px] bg-accent/20">
                <span className="text-2xl font-bold text-accent-foreground font-heading">04</span>
              </div>
              <h3 className="mt-4 text-xl font-bold font-heading">Access the SOL Portal</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Join a thriving community of like-minded innovators. Access classes, a solution bank, forums, and networking opportunities. Connect with people who share your vision and are eager to support your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Be an Innovator */}
      <section className="relative py-20 bg-sage-light/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-bold tracking-widest text-primary uppercase font-heading">Why Innovate with SOL</span>
            <h2 className="mt-2 text-3xl font-bold font-heading sm:text-4xl">We Set You Up for Success</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {[
              { title: "Plan Ahead", desc: "We help you turn your vision into a structured, actionable plan. With guided proposal frameworks and access to resources, you'll have the tools to map out your idea and prepare for success. Planning ahead ensures your project is built on a solid foundation." },
              { title: "Get an Assigned Mentor", desc: "Every innovator at SOL is paired with a mentor who aligns with their vision. These experienced guides provide personalized advice, share practical knowledge, and help you navigate challenges. With a mentor by your side, you'll have the support needed to bring your idea to life." },
              { title: "Financial Support", desc: "SOL connects you with heart-centered investors who believe in your mission. Gain access to aligned capital, transparent funding pathways, and opportunities to co-create enterprises. Financial support from SOL ensures you have the resources to execute your vision." },
              { title: "Future Proof", desc: "We focus on sustainability and long-term impact. By joining SOL, you'll learn how to future-proof your project through regenerative practices and innovative strategies. Build something that not only thrives today but also creates a legacy for tomorrow." },
            ].map((item, i) => (
              <div key={item.title} className="rounded-[0_30px_0_30px] bg-white p-8 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-[0_16px_0_16px] bg-primary/10">
                  <span className="text-2xl font-bold text-primary font-heading">{(i + 1).toString().padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading sm:text-4xl">Are You Ready?</h2>
            <p className="mt-2 text-lg font-heading text-primary">3 Steps to Join SOL</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Present Your Purpose", desc: "Share your vision with us by submitting your idea through our guided proposal portal. Clearly outline your purpose and how it aligns with SOL's mission to create sustainable and regenerative solutions." },
              { title: "Join the Community", desc: "Become a member of our global network of innovators, mentors, and investors. Gain access to exclusive resources, mentorship opportunities, and a supportive ecosystem designed to help you thrive." },
              { title: "Co-Create and Grow", desc: "Collaborate with like-minded individuals, receive funding, and bring your idea to life. Together we'll build impactful projects that regenerate Earth and create lasting change." },
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
      <section className="relative py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading sm:text-4xl">Ready to Make an Impact?</h2>
          <p className="mt-3 text-muted-foreground">
            The world needs your ideas. Take the first step today.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href={isAuthenticated ? "/innovator/projects" : "/register?pillar=innovators"}
              className="btn-sol btn-sol-primary uppercase text-sm"
            >
              Share Your Idea
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
