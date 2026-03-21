// src/components/chat/useChatState.ts
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "./types";

interface UseChatStateProps {
  currentUserId: string;
}

export function useChatState({ currentUserId }: UseChatStateProps) {
  const [open, setOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showConversations, setShowConversations] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch unread count every 10 seconds
  useEffect(() => {
    async function fetchUnread() {
      const res = await fetch("/api/messages/unread");
      if (res.ok) {
        const data = await res.json();
        setUnread(data.count);
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("floating-chat-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Message" },
        async (payload) => {
          const newMsg = payload.new as any;
          const isGroup = !newMsg.receiverId && !activeConversation;
          const isPrivate = activeConversation && (
            (newMsg.senderId === activeConversation && newMsg.receiverId === currentUserId) ||
            (newMsg.senderId === currentUserId && newMsg.receiverId === activeConversation)
          );
          if (!isGroup && !isPrivate) {
            setUnread((prev) => prev + 1);
            return;
          }
          await loadMessages(activeConversation);
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Message" },
        (payload) => setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversation, currentUserId]);

  async function loadMessages(conversationId: string | null) {
    const url = conversationId ? `/api/messages?with=${conversationId}` : "/api/messages";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  async function selectConversation(userId: string | null) {
    setActiveConversation(userId);
    setShowConversations(false);
    await loadMessages(userId);
    setUnread(0);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), receiverId: activeConversation || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    }
    setSending(false);
  }

  function toggleOpen() {
    setOpen((prev) => !prev);
    if (!open) {
      setShowConversations(true);
      setActiveConversation(null);
      setUnread(0);
    }
  }

  return {
    open, activeConversation, messages, input, sending,
    unread, showConversations, bottomRef,
    setInput, setShowConversations, setActiveConversation,
    selectConversation, sendMessage, toggleOpen,
  };
}
