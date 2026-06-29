import { api } from "@/src/lib/api-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Globe, Mail, Calendar } from "lucide-react";

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  skills: string[];
  sectors_of_interest: string[];
  created_at: string | null;
}

async function getProfile(id: string): Promise<ProfileData | null> {
  try {
    const res = await api.get<ProfileData>(`/users/${id}`);
    return res;
  } catch {
    return null;
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getProfile(id);

  if (!user) notFound();

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  const roleColors: Record<string, string> = {
    innovator: "bg-emerald-100 text-emerald-800",
    mentor: "bg-blue-100 text-blue-800",
    investor: "bg-amber-100 text-amber-800",
    admin: "bg-purple-100 text-purple-800",
  };

  return (
    <>
      {/* Profile header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20 py-16">
        <div className="absolute -top-10 -right-10 opacity-[0.07] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[200px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold font-heading">{user.full_name}</h1>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge className={`capitalize ${roleColors[user.role] || "bg-gray-100 text-gray-800"}`}>
                  {user.role}
                </Badge>
                {joinedDate && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {joinedDate}
                  </span>
                )}
              </div>
              {user.bio && (
                <p className="mt-4 text-muted-foreground max-w-lg">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Skills */}
            {user.skills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold font-heading mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sectors */}
            {user.sectors_of_interest.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold font-heading mb-4">Sectors of Interest</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.sectors_of_interest.map((sector) => (
                      <Badge key={sector} variant="outline">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/hub/members"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            &larr; Back to Member Directory
          </Link>
        </div>
      </section>
    </>
  );
}
