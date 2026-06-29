"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useState, useEffect } from "react";
import { api } from "@/src/lib/api-client";
import { GroupModal } from "@/src/components/shared/group-modal";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchGroups = () => {
    api.get("/groups/?limit=50")
      .then((data: any) => setGroups(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <GroupModal onCreated={fetchGroups}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </GroupModal>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search groups..."
        className="mb-6"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-3 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No groups found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((group) => (
            <Link key={group.id} href={`/hub/groups/${group.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                  <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {group.member_count} members
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
