// src/components/chat/useChatState.ts
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "./types";

interface UseChatStateProps {
  currentUserId: string;
}

export function useChatState({ currentUserId }: UseChatStateProps) {
  const [open, setOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [perUserUnread, setPerUserUnread] = useState<Record<string, number>>(
    {},
  );
  const [groupUnread, setGroupUnread] = useState(0);
  const [showConversations, setShowConversations] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch unread count every 10 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnread() {
    const res = await fetch("/api/messages/unread");
    if (res.ok) {
      const data = await res.json();
      setUnread(data.count);
      setPerUserUnread(data.perUser || {});
      setGroupUnread(data.group || 0);
    }
  }

  async function markConversationAsRead(
    conversationId: string | null,
    msgs: ChatMessage[],
  ) {
    const unreadMsgs = msgs.filter((m) => {
      if (m.senderId === currentUserId) return false;
      const readBy: string[] = JSON.parse(m.readBy || "[]");
      return !readBy.includes(currentUserId);
    });

    await Promise.all(
      unreadMsgs.map((m) =>
        fetch(`/api/messages/${m.id}`, { method: "PATCH" }),
      ),
    );

    if (unreadMsgs.length > 0) await fetchUnread();
  }

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("floating-chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        async (payload) => {
          const newMsg = payload.new as any;
          const isGroup = !newMsg.receiverId && !activeConversation;
          const isPrivate =
            activeConversation &&
            ((newMsg.senderId === activeConversation &&
              newMsg.receiverId === currentUserId) ||
              (newMsg.senderId === currentUserId &&
                newMsg.receiverId === activeConversation));

          if (!isGroup && !isPrivate) {
            if (newMsg.senderId !== currentUserId) await fetchUnread();
            return;
          }

          // Load full messages from API (includes sender info)
          const msgs = await loadMessages(activeConversation);
          if (msgs) await markConversationAsRead(activeConversation, msgs);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Message" },
        (payload) =>
          setMessages((prev) =>
            prev.filter((m) => m.id !== (payload.old as any).id),
          ),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, currentUserId]);

  async function loadMessages(
    conversationId: string | null,
  ): Promise<ChatMessage[] | null> {
    const url = conversationId
      ? `/api/messages?with=${conversationId}`
      : "/api/messages";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      return data.messages;
    }
    return null;
  }

  async function selectConversation(userId: string | null) {
    setActiveConversation(userId);
    setShowConversations(false);

    // Reset count immediately
    if (userId === null) {
      setGroupUnread(0);
      setUnread((prev) => Math.max(0, prev - groupUnread));
    } else {
      const userCount = perUserUnread[userId] || 0;
      setPerUserUnread((prev) => ({ ...prev, [userId]: 0 }));
      setUnread((prev) => Math.max(0, prev - userCount));
    }

    const msgs = await loadMessages(userId);
    if (msgs) await markConversationAsRead(userId, msgs);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: input.trim(),
        receiverId: activeConversation || null,
      }),
    });
    if (res.ok) {
      setInput("");
      // Don't add locally — Realtime handles it for everyone including sender
    }
    setSending(false);
  }

  function toggleOpen() {
    setOpen((prev) => !prev);
    if (!open) {
      setShowConversations(true);
      setActiveConversation(null);
      fetchUnread();
    }
  }

  return {
    open,
    activeConversation,
    messages,
    input,
    sending,
    unread,
    perUserUnread,
    groupUnread,
    showConversations,
    bottomRef,
    setInput,
    setShowConversations,
    setActiveConversation,
    selectConversation,
    sendMessage,
    toggleOpen,
  };
}
