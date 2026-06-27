"use client";

import { Check, Clock, Circle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  fundingAllocation: number;
  totalFunding: number;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

const statusConfig = {
  pending: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  completed: { icon: Check, color: "text-green-500", bg: "bg-green-500/10" },
  overdue: { icon: Clock, color: "text-destructive", bg: "bg-destructive/10" },
};

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No milestones yet.
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {milestones.map((milestone, index) => {
        const config = statusConfig[milestone.status];
        const Icon = config.icon;
        const progress = (milestone.fundingAllocation / milestone.totalFunding) * 100;

        return (
          <div key={milestone.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < milestones.length - 1 && (
              <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
            )}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  config.bg
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
            </div>
            <div className="flex-1 space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{milestone.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {milestone.description}
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Funding allocated</span>
                  <span>
                    ${milestone.fundingAllocation.toLocaleString()} / $
                    {milestone.totalFunding.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      milestone.status === "completed"
                        ? "bg-green-500"
                        : milestone.status === "overdue"
                        ? "bg-destructive"
                        : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
