"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

interface BlockButtonProps {
  userId: string;
  blocked?: boolean;
  onToggle?: (blocked: boolean) => void;
}

export function BlockButton({ userId, blocked = false, onToggle }: BlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(blocked);

  const toggle = async () => {
    if (!confirm(isBlocked ? "Unblock this user?" : "Block this user? They will not be able to interact with you.")) return;
    setLoading(true);
    try {
      if (isBlocked) {
        await api.delete(`/block/${userId}`);
        toast.success("User unblocked");
      } else {
        await api.post(`/block/${userId}`);
        toast.success("User blocked");
      }
      setIsBlocked(!isBlocked);
      onToggle?.(!isBlocked);
    } catch {
      toast.error("Failed to update block status");
    }
    setLoading(false);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading} className={isBlocked ? "text-red-400" : ""}>
      <Ban className="mr-2 h-4 w-4" />
      {isBlocked ? "Blocked" : "Block"}
    </Button>
  );
}
