import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/card";
import { ShapoWidget } from "@/src/components/shared/ShapoWidget";

const FEATURES = [
  {
    title: "For Innovators",
    description:
      "Get mentorship, funding, and a supportive community to turn your idea into a thriving business.",
    cta: "Submit Your Idea",
    href: "/register",
  },
  {
    title: "For Mentors",
    description:
      "Share your expertise, guide the next generation of entrepreneurs, and give back to the ecosystem.",
    cta: "Become a Mentor",
    href: "/register",
  },
  {
    title: "For Conscious Investors",
    description:
      "Discover vetted, impact-driven startups and invest in ventures that align with your values.",
    cta: "Start Investing",
    href: "/register",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Submit Your Idea",
    description:
      "Share your project with detailed information about your vision, stage, and funding needs.",
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "Our AI-powered platform matches you with the right mentors and investors for your venture.",
  },
  {
    number: "03",
    title: "Co-Create & Grow",
    description:
      "Collaborate with your team, track milestones, and scale your business with community support.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
        {/* Decorative SOL icon */}
        <div className="absolute -top-10 -right-10 opacity-[0.07] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[200px] sm:w-[300px] lg:w-[400px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <img src="/sol-icon.svg" alt="SOL" className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[5.2rem] leading-[1.1] font-heading">
              Nurture your dream into a{" "}
              <span className="text-primary">successful business</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
              SOL Hub is a private membership community where innovators, mentors, and conscious
              investors come together to incubate and scale impact-driven ventures.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register" className="btn-sol btn-sol-primary uppercase text-sm">
                Join SOL Today
              </Link>
              <Link href="/about" className="btn-sol btn-sol-outline uppercase text-sm">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-sage-light/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md bg-white">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold font-heading">{feature.title}</h3>
                  <p className="mt-3 text-muted-foreground">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline mt-4"
                  >
                    {feature.cta} &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative overflow-hidden py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-heading">How It Works</h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to get started on SOL Hub.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary font-heading relative">
                  {step.number}
                  <img
                    src="/sol-icon.svg"
                    alt=""
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-20"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold font-heading">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {process.env.NEXT_PUBLIC_SHAPO_WIDGET_ID && (
        <section className="relative overflow-hidden py-20 bg-sage-light/20">
          <div className="absolute -left-10 top-0 opacity-[0.05] pointer-events-none rotate-12">
            <img src="/sol-asset-3.svg" alt="" className="w-[200px]" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold font-heading">What Our Community Says</h2>
              <p className="mt-3 text-muted-foreground">
                Hear from innovators, mentors, and investors who are part of SOL Hub.
              </p>
            </div>
            <div className="mt-12">
              <ShapoWidget
                widgetId={process.env.NEXT_PUBLIC_SHAPO_WIDGET_ID}
                className="mx-auto max-w-5xl"
              />
            </div>
            <div className="mt-10 text-center">
              <a
                href="/testimonials"
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Share your story →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Mission */}
      <section className="relative bg-sage-light/30 py-20 overflow-hidden">
        <div className="absolute -left-10 top-0 opacity-[0.05] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[180px] sm:w-[250px]" />
        </div>
        <div className="absolute -right-10 bottom-0 opacity-[0.05] pointer-events-none rotate-180">
          <img src="/sol-icon.svg" alt="" className="w-[180px] sm:w-[250px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative">
          <div className="flex justify-center mb-6">
            <img src="/sol-shape-gardenie.png" alt="" className="h-12 w-auto opacity-30" />
          </div>
          <h2 className="text-4xl font-bold font-heading">Our Mission</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            We believe that the most impactful businesses are built at the intersection of visionary
            ideas, experienced guidance, and conscious capital. SOL Hub is where that convergence
            happens.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.04] pointer-events-none">
          <img src="/sol-asset-5.svg" alt="" className="w-[400px] sm:w-[600px]" />
        </div>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8 relative">
          <div className="flex justify-center gap-3 mb-6">
            <img src="/sol-icon.svg" alt="" className="h-8 w-8 opacity-40" />
            <img src="/sol-icon.svg" alt="" className="h-8 w-8 opacity-60" />
            <img src="/sol-icon.svg" alt="" className="h-8 w-8 opacity-80" />
            <img src="/sol-icon.svg" alt="" className="h-8 w-8 opacity-60" />
            <img src="/sol-icon.svg" alt="" className="h-8 w-8 opacity-40" />
          </div>
          <h2 className="text-4xl font-bold font-heading">Join SOL Today</h2>
          <p className="mt-3 text-muted-foreground">
            Become part of a community that&apos;s building the future, one venture at a time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register" className="btn-sol btn-sol-primary uppercase text-sm">
              Get Started Free
            </Link>
            <Link href="/pricing" className="btn-sol btn-sol-outline uppercase text-sm">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
