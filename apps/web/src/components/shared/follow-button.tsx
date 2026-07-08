"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onToggle?: (following: boolean) => void;
  size?: "sm" | "default";
}

export function FollowButton({ userId, initialFollowing = false, onToggle, size = "sm" }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await api.delete(`/connections/unfollow/${userId}`);
        setFollowing(false);
        onToggle?.(false);
      } else {
        await api.post(`/connections/follow/${userId}`, {});
        setFollowing(true);
        onToggle?.(true);
      }
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="mr-1 h-3.5 w-3.5" />
      ) : (
        <UserPlus className="mr-1 h-3.5 w-3.5" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
