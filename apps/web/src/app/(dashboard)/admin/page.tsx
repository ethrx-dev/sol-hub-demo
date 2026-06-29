"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth";
import { api } from "@/src/lib/api-client";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Users,
  FolderKanban,
  Handshake,
  DollarSign,
  UserCog,
  BookOpen,
  MessageSquare,
  Shield,
} from "lucide-react";

interface Stats {
  total_users: number;
  total_projects: number;
  total_matches: number;
  total_groups: number;
  total_posts: number;
  total_resources: number;
  active_projects: number;
  revenue: number;
}

const statCards = [
  { key: "total_users" as const, label: "Total Users", icon: Users, color: "text-blue-500", href: "/admin/users" },
  { key: "total_projects" as const, label: "Active Projects", icon: FolderKanban, color: "text-green-500", href: "/admin/projects" },
  { key: "total_matches" as const, label: "Total Matches", icon: Handshake, color: "text-purple-500", href: "/admin/matches" },
  { key: "total_groups" as const, label: "Groups", icon: UserCog, color: "text-orange-500", href: "/admin/groups" },
  { key: "total_posts" as const, label: "Posts", icon: MessageSquare, color: "text-cyan-500", href: "/admin/posts" },
  { key: "total_resources" as const, label: "Resources", icon: BookOpen, color: "text-pink-500", href: "/admin/resources" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">
            Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Platform administration and management
          </p>
        </div>
        {user?.is_super_admin && (
          <Badge variant="outline" className="flex items-center gap-1 border-amber-300 text-amber-700">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats ? (
          statCards.map(({ key, label, icon: Icon, color, href }) => (
            <Link key={key} href={href}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold font-heading">
                    {stats[key].toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="mt-1 text-3xl font-bold font-heading">
                  {stats ? `$${stats.revenue.toLocaleString()}` : "—"}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        {user?.is_super_admin && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Super Admin Actions</p>
                  <p className="mt-1 text-sm">
                    Full access to manage users, projects, groups, posts, and resources.
                  </p>
                </div>
                <Shield className="h-10 w-10 text-amber-500/30" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/admin/users"><Button size="sm" variant="outline">Users</Button></Link>
                <Link href="/admin/projects"><Button size="sm" variant="outline">Projects</Button></Link>
                <Link href="/admin/groups"><Button size="sm" variant="outline">Groups</Button></Link>
                <Link href="/admin/posts"><Button size="sm" variant="outline">Posts</Button></Link>
                <Link href="/admin/resources"><Button size="sm" variant="outline">Resources</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
