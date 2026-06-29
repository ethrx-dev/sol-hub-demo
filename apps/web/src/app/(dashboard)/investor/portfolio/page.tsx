"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";

interface Investment {
  id: string;
  project_id: string;
  project_title?: string;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ items: Investment[] }>("/investments")
      .then((data) => setInvestments(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalInvested = investments.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Investments</h1>
          <p className="mt-1 text-muted-foreground">
            Track your investment portfolio
          </p>
        </div>
        <Link href="/investor/browse">
          <Button variant="outline">Browse Projects</Button>
        </Link>
      </div>

      {loading ? (
        <>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">Total Invested</span>
                  <p className="text-3xl font-bold">${totalInvested.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Active Investments</span>
                  <p className="text-3xl font-bold">{investments.length}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <p className="text-3xl font-bold">
                    {new Set(investments.map((i) => i.project_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {investments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No investments yet.{" "}
              <Link href="/investor/browse" className="text-primary underline underline-offset-4">
                Browse projects to get started
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((inv) => (
                <Card key={inv.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">
                          {inv.project_title || `Project ${inv.project_id.slice(0, 8)}`}
                        </h3>
                        <div className="mt-1 flex gap-2">
                          <Badge
                            variant={inv.status === "active" ? "success" : "secondary"}
                            className="capitalize"
                          >
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Amount Invested</span>
                        <p className="text-lg font-semibold">
                          ${inv.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Invested On</span>
                        <p className="text-lg font-semibold">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {inv.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{inv.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
