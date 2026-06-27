"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { MilestoneTimeline } from "@/src/components/shared/milestone-timeline";
import { MessageThread } from "@/src/components/shared/message-thread";
import { useAuth } from "@/src/lib/auth";

const milestones = [
  {
    id: "1",
    title: "Market Research Complete",
    description: "Complete market analysis and competitor research",
    dueDate: "2026-03-15",
    status: "completed" as const,
    fundingAllocation: 5000,
    totalFunding: 5000,
  },
  {
    id: "2",
    title: "MVP Development",
    description: "Build minimum viable product",
    dueDate: "2026-05-01",
    status: "in_progress" as const,
    fundingAllocation: 15000,
    totalFunding: 20000,
  },
  {
    id: "3",
    title: "Beta Launch",
    description: "Launch beta version to test users",
    dueDate: "2026-07-01",
    status: "pending" as const,
    fundingAllocation: 10000,
    totalFunding: 15000,
  },
  {
    id: "4",
    title: "Full Launch",
    description: "Public launch and marketing campaign",
    dueDate: "2026-09-01",
    status: "pending" as const,
    fundingAllocation: 10000,
    totalFunding: 10000,
  },
];

const messages = [
  {
    id: "1",
    senderId: "mentor1",
    senderName: "Mike Johnson",
    content: "Great progress on the market research! Let's discuss the MVP requirements.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    senderId: "user1",
    senderName: "Alex Rivera",
    content: "Thanks! I've drafted the initial specs. Should I share them here?",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "3",
    senderId: "mentor1",
    senderName: "Mike Johnson",
    content: "Yes, please do. I'll review and we can schedule a call to go over them.",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
  },
];

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  use(params);
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState(messages);
  const isInvestor = user?.role === "investor";

  const handleSend = (content: string) => {
    const newMsg = {
      id: String(Date.now()),
      senderId: "user1",
      senderName: user?.full_name || "You",
      content,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

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
            <h1 className="text-3xl font-bold">GreenGrid AI Workspace</h1>
            <p className="mt-1 text-muted-foreground">
              AI-powered energy optimization for smart grids
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
                  <span className="text-xs text-muted-foreground">Stage</span>
                  <p className="font-medium">Prototype</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Sectors</span>
                  <div className="mt-1 flex gap-1.5">
                    <Badge variant="secondary">CleanTech</Badge>
                    <Badge variant="secondary">AI/ML</Badge>
                  </div>
                </div>
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
                <p className="text-sm text-muted-foreground">
                  Innovator: Alex Rivera
                  <br />
                  Mentor: Mike Johnson
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneTimeline milestones={milestones} />
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
                currentUserId="user1"
                onSend={handleSend}
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
