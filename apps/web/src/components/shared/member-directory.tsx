"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface Member {
  id: string;
  fullName: string;
  role: "innovator" | "mentor" | "investor";
  avatarUrl?: string;
  headline: string;
  sectors: string[];
  skills: string[];
}

interface MemberDirectoryProps {
  members: Member[];
  loading?: boolean;
}

const SECTORS = [
  "CleanTech",
  "HealthTech",
  "FinTech",
  "EdTech",
  "AgriTech",
  "AI/ML",
  "Blockchain",
  "SaaS",
];

const ROLES = [
  { value: "innovator", label: "Innovators" },
  { value: "mentor", label: "Mentors" },
  { value: "investor", label: "Investors" },
];

export function MemberDirectory({ members, loading }: MemberDirectoryProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const filtered = members.filter((m) => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (sectorFilter !== "all" && !m.sectors.includes(sectorFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.fullName.toLowerCase().includes(q) &&
        !m.headline.toLowerCase().includes(q) &&
        !m.skills.some((s) => s.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(0, page * perPage);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search members..."
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No members found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((member) => (
              <Link key={member.id} href={`/users/${member.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>
                          {member.fullName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.fullName}</h3>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {member.role}
                        </Badge>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {member.headline}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {member.sectors.slice(0, 3).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {paginated.length < filtered.length && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
