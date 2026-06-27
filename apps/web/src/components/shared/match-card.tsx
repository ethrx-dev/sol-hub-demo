"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Card, CardContent } from "@/src/components/ui/card";

interface MatchCardProps {
  id: string;
  projectTitle: string;
  projectTagline: string;
  matchedUserName: string;
  matchedUserAvatar?: string;
  matchedUserRole: string;
  status: "pending" | "accepted" | "declined" | "active";
  onAccept?: () => void;
  onDecline?: () => void;
}

const statusColors: Record<string, "warning" | "success" | "destructive" | "default"> = {
  pending: "warning",
  accepted: "success",
  declined: "destructive",
  active: "default",
};

export function MatchCard({
  projectTitle,
  projectTagline,
  matchedUserName,
  matchedUserAvatar,
  matchedUserRole,
  status,
  onAccept,
  onDecline,
}: MatchCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{projectTitle}</h3>
              <Badge variant={statusColors[status] || "secondary"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{projectTagline}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={matchedUserAvatar} />
            <AvatarFallback>
              {matchedUserName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{matchedUserName}</p>
            <p className="text-xs text-muted-foreground capitalize">{matchedUserRole}</p>
          </div>
        </div>

        {status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={onAccept}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={onDecline}>
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
