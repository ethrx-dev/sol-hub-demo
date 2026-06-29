"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/src/components/ui/dialog";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";

interface ReportButtonProps {
  targetType: string;
  targetId: string;
  variant?: "icon" | "text";
}

const REASONS = [
  "Spam",
  "Harassment",
  "Hate speech",
  "Inappropriate content",
  "Misinformation",
  "Copyright violation",
  "Other",
];

export function ReportButton({ targetType, targetId, variant = "icon" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    try {
      await api.post("/reports", { target_type: targetType, target_id: targetId, reason, description });
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch {
      toast.error("Failed to submit report");
    }
    setSending(false);
  };

  return (
    <>
      {variant === "icon" ? (
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-red-400 transition-colors" title="Report">
          <Flag className="h-4 w-4" />
        </button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Flag className="mr-2 h-4 w-4" />
          Report
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>
              Help us keep the community safe. Let us know why this content is inappropriate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a reason...</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional details (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submit} disabled={!reason || sending}>
              {sending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
