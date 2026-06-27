import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Explore the community and get started.",
    features: [
      "Community hub access",
      "Basic profile",
      "Browse public resources",
      "Join discussion groups",
    ],
    cta: "Get Started",
    href: "/register",
    popular: false,
  },
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    description: "For active members looking to engage deeply.",
    features: [
      "Everything in Free",
      "Submit projects",
      "Match with mentors/investors",
      "Messaging & collaboration",
      "Milestone tracking",
      "Resource library access",
    ],
    cta: "Start Free Trial",
    href: "/register",
    popular: true,
  },
  {
    name: "Premium",
    price: "$99",
    period: "/month",
    description: "For serious founders and active investors.",
    features: [
      "Everything in Basic",
      "Priority matching",
      "Video pitch reviews",
      "Dedicated success manager",
      "Investment analytics",
      "API access",
      "Early access to new features",
    ],
    cta: "Go Premium",
    href: "/register",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute -top-10 -right-10 opacity-[0.04] pointer-events-none">
        <img src="/sol-icon.svg" alt="" className="w-[250px]" />
      </div>
      <div className="absolute -bottom-10 -left-10 opacity-[0.04] pointer-events-none rotate-45">
        <img src="/sol-icon.svg" alt="" className="w-[250px]" />
      </div>
      <section className="text-center relative">
        <div className="flex justify-center mb-4">
          <img src="/sol-icon.svg" alt="SOL" className="h-12 w-12" />
        </div>
        <h1 className="text-5xl font-black font-heading">Pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Choose the plan that fits your journey. All plans include access to our community hub.
        </p>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.popular ? "border-primary shadow-lg ring-1 ring-primary" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[0_10px_0_10px] bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardContent className="flex flex-1 flex-col p-8">
              <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold font-heading">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 w-full">
                <Link href={plan.href}>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    corner="sol"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
