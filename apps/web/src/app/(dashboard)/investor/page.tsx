"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { api } from "@/src/lib/api-client";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    portfolio_size: 0,
    active_count: 0,
    opportunities: 0,
    total_invested: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ items: any[] }>("/investments").catch(() => ({ items: [] })),
      api.get<{ items: any[] }>("/projects/?status=seeking_funding&limit=5").catch(() => ({ items: [] })),
    ])
      .then(([investments, projects]) => {
        const items = investments.items || [];
        setStats({
          portfolio_size: items.length,
          active_count: items.filter((i: any) => i.status === "active").length,
          opportunities: (projects.items || []).length,
          total_invested: items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">
          Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
        <Link href="/investor/browse">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Browse Opportunities
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Size</p>
                  <p className="mt-1 text-3xl font-bold font-heading">{stats.portfolio_size}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Investments</p>
                  <p className="mt-1 text-3xl font-bold font-heading">{stats.active_count}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Opportunities</p>
                  <p className="mt-1 text-3xl font-bold font-heading">{stats.opportunities}</p>
                </div>
                <ArrowRight className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="mt-1 text-3xl font-bold font-heading">
                    ${stats.total_invested.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/investor/browse">
            <Button variant="outline">Browse Projects</Button>
          </Link>
          <Link href="/investor/portfolio">
            <Button variant="outline">View Portfolio</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
