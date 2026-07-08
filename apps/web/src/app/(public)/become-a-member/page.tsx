"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { CheckCircle, Users, GraduationCap, Globe, Shield } from "lucide-react";

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Mentorship Training",
    description:
      "Access expert-led training sessions designed to help you grow as an innovator, mentor, or conscious investor.",
  },
  {
    icon: Users,
    title: "Private Social Hub",
    description:
      "Connect with like-minded members in our private community platform — share ideas, resources, and opportunities.",
  },
  {
    icon: Globe,
    title: "Business & Lawful",
    description:
      "Learn how to structure and grow your business within a lawful framework that protects your rights and privacy.",
  },
  {
    icon: Shield,
    title: "Community",
    description:
      "Join a supportive private membership association where your freedom of association is protected under the 1st and 14th Amendments.",
  },
];

const FAQS = [
  {
    q: "What is a Private Membership Association (PMA)?",
    a: "A PMA is a private unincorporated association operating under the protections of the 1st and 14th Amendments. Members gather for lawful purposes including education, mentorship, and mutual support, outside the jurisdiction of state and federal regulatory agencies.",
  },
  {
    q: "Is there a membership fee?",
    a: "Membership is currently free. We believe in providing access to education and community without financial barriers.",
  },
  {
    q: "Who can join?",
    a: "Anyone who aligns with our mission of nurturing dreams into successful businesses is welcome. We have three pillars: Innovators, Mentors, and Conscious Investors.",
  },
  {
    q: "What does membership include?",
    a: "Members gain access to our private social hub, mentorship training programs, community forums, events, resources, and the ability to connect with fellow members.",
  },
  {
    q: "How do I cancel my membership?",
    a: "You can withdraw from this agreement and terminate your membership at any time. Contact us and we will process your request promptly.",
  },
];

export default function BecomeAMemberPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-light/40 via-background to-sage-light/20 py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-center mb-6">
            <img src="/sol-icon.svg" alt="SOL" className="h-16 w-16" />
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-heading">
              Sign-Up to Join Our{" "}
              <span className="text-primary">PMA</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              SPACES OF LEARNING is a Private Membership Association (PMA) — a private community
              where innovators, mentors, and conscious investors come together to learn, grow, and
              build successful businesses, protected under the rights of freedom of association.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="btn-sol btn-sol-primary uppercase text-sm"
              >
                SIGN-UP Today!
              </Link>
              <Link
                href="/membership-agreement"
                className="btn-sol uppercase text-sm bg-white text-primary hover:bg-primary hover:text-white"
              >
                View Membership Agreement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PMA Notice Banner */}
      <section className="bg-primary/5 py-8 border-y border-primary/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            SPACES OF LEARNING is a Private Membership Association exercising the right of freedom
            of association as guaranteed by the 1st and 14th Amendments of the U.S. Constitution.
            All members are bound by the{" "}
            <Link href="/membership-agreement" className="text-primary underline">
              Membership Agreement
            </Link>{" "}
            and Terms of Use.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">Why Join SOL PMA?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Become part of a private community dedicated to nurturing dreams into successful
              businesses through mentorship, collaboration, and conscious capital.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <Card
                key={benefit.title}
                className="border-0 shadow-md bg-white overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0_12px_0_12px] bg-primary/10">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-heading">{benefit.title}</h3>
                      <p className="mt-2 text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="relative bg-sage-light/30 py-20 overflow-hidden">
        <div className="absolute left-0 top-0 opacity-[0.05] pointer-events-none">
          <img src="/sol-asset-3.svg" alt="" className="w-[180px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">How to Join</h2>
            <p className="mt-3 text-muted-foreground">
              Getting started is simple. Follow these three steps.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Read the Agreement",
                desc: "Review our Membership Agreement to understand your rights and responsibilities as a private member.",
              },
              {
                step: "02",
                title: "Sign Up",
                desc: "Create your account and agree to the membership terms. Choose your path as an Innovator, Mentor, or Investor.",
              },
              {
                step: "03",
                title: "Join the Community",
                desc: "Access the private hub, connect with members, and start your journey with SOL.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary font-heading relative">
                  {item.step}
                  <img
                    src="/sol-icon-color.svg"
                    alt=""
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-20"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold font-heading">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Alerts */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold font-heading">Get Email Alerts</h2>
          <p className="mt-3 text-muted-foreground">
            Stay informed about events, opportunities, and community updates.
          </p>
          <Link
            href="/register"
            className="btn-sol btn-sol-primary mt-8 inline-block uppercase text-sm"
          >
            SIGN-UP Today!
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sage-light/30 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">Frequently Asked Questions</h2>
          </div>
          <div className="mt-12 space-y-6">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-[0_10px_0_10px] bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold font-heading">{faq.q}</h3>
                <p className="mt-2 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/sol-shape-gardenie.png" alt="" className="h-12 w-auto opacity-30" />
          </div>
          <h2 className="text-4xl font-bold font-heading">Ready to Join?</h2>
          <p className="mt-3 text-muted-foreground">
            Become a member of SOL PMA and start your journey today.
          </p>
          <Link
            href="/register"
            className="btn-sol btn-sol-primary mt-8 inline-block uppercase text-sm"
          >
            Become A Member
          </Link>
        </div>
      </section>
    </div>
  );
}
