"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { api } from "@/src/lib/api-client";

export interface WsMessage {
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string | null;
}

interface PaginatedMessages {
  items: WsMessage[];
  total: number;
}

export function useWorkspaceWs(projectId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial messages via REST
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    api
      .get<PaginatedMessages>(`/projects/${projectId}/workspace/messages`)
      .then((data) => {
        setMessages(data.items || []);
      })
      .catch(() => {
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  // Connect WebSocket
  useEffect(() => {
    if (!projectId) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const wsBase = apiBase.replace(/^http/, "ws");
    const url = `${wsBase}/ws/workspace/${projectId}`;

    const ws = new WebSocket(url, [token]);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === "message:new") {
          setMessages((prev) => [...prev, payload.data]);
        }
      } catch {
        // ignore malformed messages
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [projectId]);

  const sendMessage = useCallback(
    (content: string) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "message:send", data: { content } }));
        return true;
      }
      return false;
    },
    []
  );

  return { messages, sendMessage, connected, loading };
}
