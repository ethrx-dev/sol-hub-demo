"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

interface Plan {
  tier: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const FALLBACK_PLANS: Plan[] = [
  { tier: "free", name: "Free", price: 0, description: "Explore the community and get started.", features: ["Community hub access", "Basic profile", "Browse public resources", "Join discussion groups"] },
  { tier: "innovator", name: "Innovator", price: 19.99, description: "For climate innovators building ventures.", features: ["Create projects", "Apply to matches", "Access workspace", "Messaging & collaboration", "Milestone tracking"] },
  { tier: "mentor", name: "Mentor", price: 29.99, description: "For mentors and advisors sharing expertise.", features: ["Match with projects", "Full workspace access", "Create resources", "Priority matching"] },
  { tier: "investor", name: "Investor", price: 49.99, description: "For investors and funders backing ventures.", features: ["Match with projects", "Full workspace access", "Investment dashboard", "Video pitch reviews"] },
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api.get<Plan[]>("/membership/plans")
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planTier: string) => {
    if (planTier === "free") {
      window.location.href = "/register";
      return;
    }

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setCheckingOut(planTier);
    try {
      const priceId = `price_${planTier}`;
      const { url } = await api.post<{ url: string }>("/membership/checkout", {
        price_id: priceId,
        success_url: `${window.location.origin}/settings/billing?success=true`,
        cancel_url: `${window.location.origin}/pricing?canceled=true`,
      });
      window.location.href = url;
    } catch (err: any) {
      if (err?.status === 401) {
        window.location.href = "/login";
        return;
      }
      toast.error(err?.message || "Checkout failed.");
    } finally {
      setCheckingOut(null);
    }
  };

  const popular = "innovator";

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

      <section className="mt-16 grid gap-8 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.tier}
            className={`relative flex flex-col ${
              plan.tier === popular ? "border-primary shadow-lg ring-1 ring-primary" : ""
            }`}
          >
            {plan.tier === popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[0_10px_0_10px] bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardContent className="flex flex-1 flex-col p-8">
              <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold font-heading">
                  ${plan.price === 0 ? "0" : plan.price.toFixed(2)}
                </span>
                {plan.price > 0 && <span className="text-sm text-muted-foreground">/month</span>}
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
                <Button
                  variant={plan.tier === popular ? "default" : "outline"}
                  className="w-full"
                  corner="sol"
                  disabled={checkingOut === plan.tier}
                  onClick={() => handleCheckout(plan.tier)}
                >
                  {checkingOut === plan.tier ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {plan.price === 0 ? "Get Started" : "Subscribe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
