"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Pin, Send, Pencil, Trash2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";

export default function ThreadPage({ params }: { params: Promise<{ categoryId: string; threadId: string }> }) {
  const { categoryId, threadId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState("");

  useEffect(() => {
    api.get(`/forums/threads/${threadId}`).then(setThread).catch(() => router.push("/hub/forums")).finally(() => setLoading(false));
  }, [threadId, router]);

  const addReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const reply: any = await api.post(`/forums/threads/${threadId}/replies`, { content: replyText.trim() });
      setThread((prev: any) => prev ? { ...prev, replies: [...prev.replies, reply], reply_count: prev.reply_count + 1 } : prev);
      setReplyText("");
    } catch { toast.error("Failed to post reply"); }
    setSending(false);
  };

  const deleteReply = async (replyId: string) => {
    try {
      await api.delete(`/forums/replies/${replyId}`);
      setThread((prev: any) => prev ? { ...prev, replies: prev.replies.filter((r: any) => r.id !== replyId), reply_count: prev.reply_count - 1 } : prev);
      toast.success("Reply deleted");
    } catch { toast.error("Failed to delete reply"); }
  };

  const startEditReply = (reply: any) => {
    setEditingReply(reply.id);
    setEditReplyText(reply.content);
  };

  const saveEditReply = async (replyId: string) => {
    if (!editReplyText.trim()) return;
    try {
      const updated: any = await api.patch(`/forums/replies/${replyId}`, { content: editReplyText.trim() });
      setThread((prev: any) => prev ? { ...prev, replies: prev.replies.map((r: any) => r.id === replyId ? updated : r) } : prev);
      setEditingReply(null);
      toast.success("Reply updated");
    } catch { toast.error("Failed to update reply"); }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href={`/hub/forums/${categoryId}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to threads
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          {thread.is_locked && <Lock className="h-5 w-5 text-muted-foreground" />}
          {thread.is_pinned && <Pin className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{thread.author_name}</span>
          <span>{new Date(thread.created_at).toLocaleDateString()}</span>
          <span>{thread.view_count} view{thread.view_count !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={thread.author_avatar} />
              <AvatarFallback>{thread.author_name?.split(" ").map((n: string) => n[0]).join("") || "U"}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">{thread.author_name}</p>
          </div>
          <p className="whitespace-pre-wrap">{thread.content}</p>
        </CardContent>
      </Card>

      <h2 className="mb-4 font-semibold">{thread.reply_count} Repl{thread.reply_count === 1 ? "y" : "ies"}</h2>

      <div className="space-y-3">
        {thread.replies?.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No replies yet. Be the first to respond!</p>
        ) : (
          thread.replies?.map((reply: any) => (
            <Card key={reply.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.author_avatar} />
                      <AvatarFallback className="text-xs">{reply.author_name?.split(" ").map((n: string) => n[0]).join("") || "U"}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{reply.author_name}</p>
                    <span className="text-xs text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</span>
                  </div>
                  {user?.id === reply.author_id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditReply(reply)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteReply(reply.id)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
                {editingReply === reply.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea value={editReplyText} onChange={(e) => setEditReplyText(e.target.value)} className="w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={2} autoFocus />
                    <div className="flex gap-2">
                      <button onClick={() => saveEditReply(reply.id)} disabled={!editReplyText.trim()} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Check className="h-3 w-3" />Save</button>
                      <button onClick={() => setEditingReply(null)} className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"><X className="h-3 w-3" />Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm whitespace-pre-wrap">{reply.content}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!thread.is_locked && (
        <div className="mt-6 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => e.key === "Enter" && addReply()}
          />
          <Button size="sm" onClick={addReply} disabled={sending || !replyText.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Posting..." : "Reply"}
          </Button>
        </div>
      )}
    </div>
  );
}
