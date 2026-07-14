"use client";

import { useState, useEffect } from "react";
import { DollarSign, ArrowUpRight } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data: any = await api.get("/admin/donations");
        setDonations(data.items || []);
        setTotal(data.total || 0);
        setTotalAmount(data.totalAmount || 0);
      } catch {
        setDonations([]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Donations</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time donations received via Stripe
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Total Raised</span>
          </div>
          <p className="mt-1 text-2xl font-bold">
            ${(totalAmount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm font-medium">Donations</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Average</span>
          </div>
          <p className="mt-1 text-2xl font-bold">
            ${total > 0 ? ((totalAmount / 100) / total).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <DollarSign className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No donations yet</p>
          <p className="text-sm">Donations will appear here once Stripe webhooks start processing.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Donor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{d.donorName || "Anonymous"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.donorEmail}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    ${(d.amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    <span className="ml-1 text-xs text-muted-foreground">{d.currency.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={d.status === "completed" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
