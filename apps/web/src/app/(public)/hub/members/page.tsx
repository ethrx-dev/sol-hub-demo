"use client";

import { useState, useEffect } from "react";
import { MemberDirectory } from "@/src/components/shared/member-directory";
import { api } from "@/src/lib/api-client";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/members/?limit=100")
      .then((data: any) => {
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Member Directory</h1>
      <MemberDirectory members={members} loading={loading} />
    </div>
  );
}
