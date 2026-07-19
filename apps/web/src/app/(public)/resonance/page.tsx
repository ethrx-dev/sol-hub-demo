import Link from "next/link";
import { Sparkles, Compass, HeartHandshake } from "lucide-react";
import { ResonanceStewardIntro } from "@/src/components/shared/resonance-steward-intro";

const PRINCIPLES = [
  {
    icon: Sparkles,
    title: "Resonance, not alignment",
    desc: "Alignment is the result. Resonance is the mechanism. We meet you; we do not align you. Resonance reveals, and alignment naturally follows.",
  },
  {
    icon: Compass,
    title: "Reveal, don't recognize",
    desc: "We create the conditions in which what is already true can become visible. Not giving. Not teaching. Not convincing. Revealing.",
  },
  {
    icon: HeartHandshake,
    title: "Contribution, not role",
    desc: "Your contribution comes into focus. A role can change; contribution is deeper. From it, roles, collaborations, and opportunities emerge.",
  },
];

export default function ResonanceGatewayPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-light/40 via-background to-sage-light/20 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4rem] leading-[1.1] font-heading">
            The Resonance Gateway
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The living point of entry into Spaces of Learning. A space of reflection where, beyond
            titles, resumes, and ambition, what is already true about you can become visible.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-sol btn-sol-primary uppercase text-sm">
              Begin the Conversation
            </Link>
            <Link
              href="/become-a-member"
              className="btn-sol uppercase text-sm bg-white text-primary hover:bg-primary hover:text-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Whitney — Resonance Steward */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ResonanceStewardIntro />
        </div>
      </section>

      {/* Foundational principles */}
      <section className="bg-sage-light/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">What the Gateway Is</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Three principles guide how we meet every new member.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-[0_20px_0_20px] bg-white p-8 shadow-sm"
              >
                <p.icon className="mb-4 h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold font-heading">{p.title}</h3>
                <p className="mt-3 text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mirror principle */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-heading">The Mirror Has No Identity</h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            This is more than a quote. It is the design principle that explains why the Gateway
            works. The mirror does not decide who you are. It has no identity of its own — and that
            is exactly why it can reflect you so clearly. You are not evaluated here. You are met.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-light/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold font-heading">Ready to Be Met?</h2>
          <p className="mt-3 text-muted-foreground">
            Before anything is asked of you — before any role is named — you are invited to be met.
          </p>
          <Link
            href="/register"
            className="btn-sol btn-sol-primary mt-8 inline-block uppercase text-sm"
          >
            Enter the Gateway
          </Link>
        </div>
      </section>
    </div>
  );
}
