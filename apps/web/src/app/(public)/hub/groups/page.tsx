"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { useState } from "react";

const groups = [
  { id: "1", name: "CleanTech Innovators", members: 24, description: "For founders building in clean technology" },
  { id: "2", name: "Women in Tech", members: 18, description: "Supporting women entrepreneurs" },
  { id: "3", name: "AI/ML Founders", members: 31, description: "AI and machine learning startups" },
  { id: "4", name: "HealthTech Pioneers", members: 15, description: "Healthcare innovation and technology" },
  { id: "5", name: "Impact Investors Circle", members: 22, description: "For conscious investors" },
  { id: "6", name: " SaaS Builders", members: 27, description: "SaaS founders and developers" },
];

export default function GroupsPage() {
  const [search, setSearch] = useState("");

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search groups..."
        className="mb-6"
      />

      {filtered.length === 0 ? (
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    {group.members} members
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
