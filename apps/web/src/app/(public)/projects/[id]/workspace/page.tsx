"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Upload, FileText, Download, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { MilestoneTimeline } from "@/src/components/shared/milestone-timeline";
import { MilestoneModal } from "@/src/components/shared/milestone-modal";
import { MessageThread } from "@/src/components/shared/message-thread";
import { useAuth } from "@/src/lib/auth";
import { useWorkspaceWs } from "@/src/hooks/use-workspace-ws";
import { api } from "@/src/lib/api-client";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";

interface WorkspaceData {
  project: { id: string; title: string } | null;
  members: Array<{ id: string; full_name: string; role: string; avatar_url: string | null }>;
  target_amount: number | null;
  raised_amount: number;
  documents: Array<{ id: string; filename: string; file_url: string; file_type: string; file_size: number; created_at: string }>;
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
                  <p className="text-2xl font-bold">
                    ${(workspace?.target_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Raised</span>
                  <p className="text-2xl font-bold">
                    ${(workspace?.raised_amount || 0).toLocaleString()}
                    {workspace?.target_amount ? (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}({Math.round(((workspace.raised_amount || 0) / workspace.target_amount) * 100)}%)
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: workspace?.target_amount
                        ? `${Math.min(((workspace.raised_amount || 0) / workspace.target_amount) * 100, 100)}%`
                        : "0%",
                    }}
                  />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <DocumentUploadButton projectId={id} />
            </CardHeader>
            <CardContent>
              {workspace?.documents && workspace.documents.length > 0 ? (
                <div className="space-y-2">
                  {workspace.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No documents uploaded yet.
                </div>
              )}
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
                    <p className="text-2xl font-bold">
                      ${(workspace?.raised_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Milestone Progress</span>
                    <p className="text-2xl font-bold">
                      {milestones.length > 0
                        ? `${Math.round((milestones.filter((m) => m.status === "completed").length / milestones.length) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Next Payout</span>
                    <p className="text-2xl font-bold">
                      ${(workspace?.target_amount || 0) > 0
                        ? ((workspace?.target_amount || 0) - (workspace?.raised_amount || 0)).toLocaleString()
                        : "0"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" asChild>
                    <Link href={`/investor/portfolio`}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      View Full Financial Report
                    </Link>
                  </Button>
                  <CommitFundingButton projectId={id} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function CommitFundingButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCommit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    setSubmitting(true);
    try {
      await api.post("/investments/", {
        project_id: projectId,
        amount: num,
        notes: notes || null,
      });
      toast.success("Funding committed!");
      setOpen(false);
      setAmount("");
      setNotes("");
    } catch {
      toast.error("Failed to commit funding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Commit Funding
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Commit Funding</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount ($)</label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any conditions or notes..."
              className="h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button
            onClick={handleCommit}
            disabled={submitting || !amount || parseFloat(amount) <= 0}
            className="w-full"
          >
            {submitting ? "Committing..." : "Commit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentUploadButton({ projectId }: { projectId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/projects/${projectId}/workspace/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded");
      window.location.reload();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
      />
      <Button
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </>
  );
}
