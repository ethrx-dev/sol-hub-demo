"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, Download } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

const invoices = [
  { id: "INV-001", date: "Jun 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-002", date: "May 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-003", date: "Apr 1, 2026", amount: "$29.00", status: "paid" },
];

export default function BillingPage() {
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
            <CardDescription>You are on the Basic plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
              <div>
                <p className="font-semibold">Basic Plan</p>
                <p className="text-sm text-muted-foreground">$29/month</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Upgrade Plan</Button>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2027</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Update
              </Button>
            </div>
            <Button variant="link" className="mt-2">
              Add payment method
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>View and download past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.id}</p>
                      <p className="text-xs text-muted-foreground">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{inv.amount}</span>
                      <Badge
                        variant={inv.status === "paid" ? "success" : "warning"}
                      >
                        {inv.status}
                      </Badge>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
