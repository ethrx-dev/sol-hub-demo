"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

const investments = [
  {
    id: "1",
    projectTitle: "GreenGrid AI",
    amountInvested: 15000,
    totalFunding: 50000,
    stage: "Prototype",
    status: "active",
    returnMetric: "+12%",
  },
  {
    id: "2",
    projectTitle: "HealthBridge",
    amountInvested: 25000,
    totalFunding: 75000,
    stage: "Early Traction",
    status: "active",
    returnMetric: "+8%",
  },
  {
    id: "3",
    projectTitle: "EduFuture",
    amountInvested: 80000,
    totalFunding: 300000,
    stage: "Growth",
    status: "active",
    returnMetric: "+15%",
  },
];

export default function PortfolioPage() {
  const totalInvested = investments.reduce((sum, i) => sum + i.amountInvested, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Investments</h1>
        <p className="mt-1 text-muted-foreground">
          Track your investment portfolio
        </p>
      </div>

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
              <span className="text-sm text-muted-foreground">Avg. Return</span>
              <p className="text-3xl font-bold text-green-600">+11.7%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {investments.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No investments yet. Browse projects to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{inv.projectTitle}</h3>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="secondary">{inv.stage}</Badge>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {inv.returnMetric}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Amount Invested</span>
                    <p className="text-lg font-semibold">
                      ${inv.amountInvested.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Total Project Funding</span>
                    <p className="text-lg font-semibold">
                      ${inv.totalFunding.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Ownership stake</span>
                    <span>
                      {((inv.amountInvested / inv.totalFunding) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(inv.amountInvested / inv.totalFunding) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
