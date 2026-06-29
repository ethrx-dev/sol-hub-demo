"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Check, Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Input } from "@/src/components/ui/input";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

interface GroupMember {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string | null;
  sender_avatar: string | null;
  content: string;
  created_at: string;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  visibility: string;
  member_count: number;
  members: GroupMember[];
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<GroupData>(`/groups/${id}`)
      .then((data) => {
        setGroup(data);
        if (user && data.members?.some((m) => m.user_id === user.id)) {
          setJoined(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!id || !joined) return;
    setMessagesLoading(true);
    api
      .get<{ items: GroupMessage[] }>(`/groups/${id}/messages?limit=100`)
      .then((data) => setMessages(data.items.reverse()))
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, [id, joined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = async () => {
    if (!user || !id) return;
    setJoining(true);
    try {
      await api.post(`/groups/${id}/join`);
      setJoined(true);
    } catch {
      setJoined(false);
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !id || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const msg = await api.post<GroupMessage>(`/groups/${id}/messages`, {
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch {
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/groups/${id}/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {}
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-32" />
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-8 h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="py-12 text-center text-muted-foreground">Group not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/hub/groups"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Groups
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="mt-2 text-muted-foreground">{group.description}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {group.member_count} members
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            {group.members?.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/users/${member.user_id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.full_name}</p>
                      <Badge variant="secondary" className="capitalize">
                        {member.role}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No members yet.</p>
            )}
          </CardContent>
        </Card>

        {user ? (
          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={joined || joining}
            variant={joined ? "secondary" : "default"}
          >
            {joining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : joined ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Joined
              </>
            ) : (
              "Join Group"
            )}
          </Button>
        ) : (
          <Link href="/login">
            <Button className="w-full" variant="outline">
              Sign in to join this group
            </Button>
          </Link>
        )}

        {joined && (
          <Card>
            <CardHeader>
              <CardTitle>Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-5/6" />
                </div>
              ) : messages.length > 0 ? (
                <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {msg.sender_name?.split(" ").map((n) => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {!isOwn && (
                            <p className="mb-1 text-xs font-medium">{msg.sender_name}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <div className={`mt-1 flex items-center gap-2 ${isOwn ? "justify-end" : ""}`}>
                            <span className="text-[10px] opacity-70">
                              {formatTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-[10px] opacity-50 hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <p className="mb-4 py-4 text-center text-sm text-muted-foreground">
                  No messages yet. Start the discussion!
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
