"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MemberDirectory } from "@/src/components/shared/member-directory";
import { Input } from "@/src/components/ui/input";
import { api } from "@/src/lib/api-client";
import { Search } from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const fetchMembers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (q) params.set("search", q);
      const data: any = await api.get(`/members/?${params}`);
      const mapped = (data.items || []).map((m: any) => ({
        id: m.id,
        fullName: m.full_name,
        role: m.role,
        avatarUrl: m.avatar_url,
        headline: m.bio || "",
        sectors: m.sectors_of_interest || [],
        skills: m.skills || [],
      }));
      setMembers(mapped);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers("");
  }, [fetchMembers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchMembers(value), 300);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Member Directory</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search members by name, bio, or email..."
          className="pl-10"
        />
      </div>
      <MemberDirectory members={members} loading={loading} />
    </div>
  );
}
