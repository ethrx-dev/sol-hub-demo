"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { MilestoneTimeline } from "@/src/components/shared/milestone-timeline";
import { MilestoneModal } from "@/src/components/shared/milestone-modal";
import { MessageThread } from "@/src/components/shared/message-thread";
import { useAuth } from "@/src/lib/auth";
import { useWorkspaceWs } from "@/src/hooks/use-workspace-ws";
import { api } from "@/src/lib/api-client";
import { Skeleton } from "@/src/components/ui/skeleton";

interface WorkspaceData {
  project: { id: string; title: string } | null;
  members: Array<{ id: string; full_name: string; role: string; avatar_url: string | null }>;
}

interface MilestoneItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  budget: number | null;
  is_funding_trigger: boolean;
  created_at: string;
}

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { messages, sendMessage, connected, loading } = useWorkspaceWs(id);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [wsLoading, setWsLoading] = useState(true);
  const isInvestor = user?.role === "investor";

  useEffect(() => {
    if (!id) return;
    api
      .get<WorkspaceData>(`/projects/${id}/workspace/`)
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setWsLoading(false));
  }, [id]);

  const fetchMilestones = useCallback(() => {
    if (!id) return;
    api
      .get<{ items: MilestoneItem[] }>(`/projects/${id}/milestones`)
      .then((data) => setMilestones(data.items || []))
      .catch(() => {})
      .finally(() => setMilestonesLoading(false));
  }, [id]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const senderName = user?.full_name || "You";
  const currentUserId = user?.id || "unknown";

  const chatMessages = messages.map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    content: m.content,
    timestamp: m.created_at || new Date().toISOString(),
  }));

  if (wsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-48" />
        <Skeleton className="mb-8 h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {workspace?.project?.title || "Project Workspace"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {connected ? "🟢 Connected" : "🔴 Disconnected"}
            </p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          {isInvestor && <TabsTrigger value="financials">Financials</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Funding Goal</span>
                  <p className="text-2xl font-bold">$50,000</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Raised</span>
                  <p className="text-2xl font-bold">$15,000 (30%)</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[30%] rounded-full bg-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workspace?.members?.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{m.role}:</span>
                      <span className="text-sm text-muted-foreground">{m.full_name}</span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No members yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Milestones</CardTitle>
              <MilestoneModal projectId={id} onCreated={fetchMilestones} />
            </CardHeader>
            <CardContent>
              {milestonesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <MilestoneTimeline
                  milestones={milestones.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description || "",
                    dueDate: m.due_date || "",
                    status: (m.status as "pending" | "in_progress" | "completed" | "overdue") || "pending",
                    fundingAllocation: m.budget || 0,
                    totalFunding: m.budget || 0,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                No documents uploaded yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <MessageThread
                messages={chatMessages}
                currentUserId={currentUserId}
                onSend={sendMessage}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isInvestor && (
          <TabsContent value="financials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Invested</span>
                    <p className="text-2xl font-bold">$15,000</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Milestone Progress</span>
                    <p className="text-2xl font-bold">25%</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Next Payout</span>
                    <p className="text-2xl font-bold">$10,000</p>
                  </div>
                </div>
                <Button variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Full Financial Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
