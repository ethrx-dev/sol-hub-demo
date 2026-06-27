"use client";

import { useAuth } from "@/src/lib/auth";
import { Card, CardContent } from "@/src/components/ui/card";

export default function InnovatorDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="mt-1 text-3xl font-bold font-heading">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Matches</p>
            <p className="mt-1 text-3xl font-bold font-heading">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Resources</p>
            <p className="mt-1 text-3xl font-bold font-heading">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
