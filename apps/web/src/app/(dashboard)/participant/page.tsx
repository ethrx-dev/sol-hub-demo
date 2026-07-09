"use client";

import Link from "next/link";
import { useAuth } from "@/src/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Users, BookOpen, Bell, ArrowRight } from "lucide-react";

export default function ParticipantDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">Welcome, {user?.full_name}</h1>
      <p className="text-muted-foreground">
        Explore the SOL community — connect, learn, and grow.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/hub">
          <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Community Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse feeds, groups, forums, and events.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                Explore <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resources">
          <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access templates, guides, and learning materials.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                Browse <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications">
          <Card className="transition-colors hover:bg-sage-light/20 cursor-pointer h-full">
            <CardHeader>
              <Bell className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay up to date with community activity.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                View <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
