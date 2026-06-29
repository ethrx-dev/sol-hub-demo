"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

interface Subscription {
  tier: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    api.get<Subscription>("/membership/my-subscription")
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { url } = await api.post<{ url: string }>("/membership/portal");
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      active: "success",
      past_due: "warning",
      canceled: "destructive",
      incomplete: "warning",
      inactive: "secondary",
    };
    return map[status] || "secondary";
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tierName = sub?.tier ? sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1) : "Free";
  const isPaid = sub?.tier && sub.tier !== "free";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/settings"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Link>

      <h1 className="text-3xl font-bold mb-6">Billing</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {isPaid ? `You are on the ${tierName} plan` : "You are on the Free plan"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
              <div>
                <p className="font-semibold">{tierName} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {sub?.current_period_end
                    ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}`
                    : isPaid
                      ? "Active"
                      : "No active subscription"}
                </p>
              </div>
              <Badge variant={statusBadge(sub?.status || "inactive")}>
                {sub?.status || "inactive"}
              </Badge>
            </div>
            {isPaid && (
              <Button variant="outline" onClick={handlePortal} disabled={portalLoading}>
                {portalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Manage Billing
              </Button>
            )}
            {!isPaid && (
              <Link href="/pricing">
                <Button variant="outline">View Plans</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Managed securely via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isPaid ? "Managed via Stripe" : "No payment method on file"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPaid ? "Update in Stripe Customer Portal" : "Add one when you subscribe"}
                </p>
              </div>
              {isPaid && (
                <Button variant="outline" size="sm" className="ml-auto" onClick={handlePortal} disabled={portalLoading}>
                  Update
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>View and manage invoices via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            {isPaid ? (
              <Button variant="outline" onClick={handlePortal} disabled={portalLoading}>
                View Invoices
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
