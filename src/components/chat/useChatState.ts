import { useState, useEffect, useRef, useCallback } from "react";
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

  const activeConversationRef = useRef<string | null>(activeConversation);
  const openRef = useRef(open);
  const showConversationsRef = useRef(showConversations);
  const unreadFetchInFlightRef = useRef(false);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    showConversationsRef.current = showConversations;
  }, [showConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUnread = useCallback(async () => {
    if (unreadFetchInFlightRef.current) return;

    unreadFetchInFlightRef.current = true;
    try {
      const res = await fetch("/api/messages/unread", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      setUnread(Number(data.count || 0));
      setPerUserUnread(data.perUser || {});
      setGroupUnread(Number(data.group || 0));
    } catch {
      // ignore transient mobile/network errors
    } finally {
      unreadFetchInFlightRef.current = false;
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string | null): Promise<ChatMessage[] | null> => {
      const url = conversationId
        ? `/api/messages?with=${conversationId}`
        : "/api/messages";

      try {
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return null;

        const data = await res.json();
        setMessages(data.messages || []);
        return data.messages || [];
      } catch {
        return null;
      }
    },
    [],
  );

  const markConversationAsRead = useCallback(
    async (conversationId: string | null, msgs: ChatMessage[]) => {
      const unreadMsgs = msgs.filter((m) => {
        if (m.senderId === currentUserId) return false;

        try {
          const readBy: string[] = JSON.parse(m.readBy || "[]");
          return !readBy.includes(currentUserId);
        } catch {
          return true;
        }
      });

      if (unreadMsgs.length === 0) return;

      try {
        await Promise.all(
          unreadMsgs.map((m) =>
            fetch(`/api/messages/${m.id}`, {
              method: "PATCH",
            }),
          ),
        );
      } catch {
        // ignore patch failure here; next refresh/realtime sync can recover
      }

      await fetchUnread();
    },
    [currentUserId, fetchUnread],
  );

  useEffect(() => {
    fetchUnread();

    const interval = setInterval(() => {
      fetchUnread();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnread();
      }
    };

    const handleFocus = () => {
      fetchUnread();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUnread]);

  useEffect(() => {
    const channel = supabase
      .channel(`floating-chat-realtime-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            senderId: string;
            receiverId: string | null;
            content: string;
            createdAt: string;
            readBy?: string;
          };

          if (!newMsg || newMsg.senderId === currentUserId) return;

          const currentActiveConversation = activeConversationRef.current;
          const isOpen = openRef.current;
          const isShowingConversationList = showConversationsRef.current;

          const isGroupMessage = !newMsg.receiverId;
          const isCurrentGroupView = currentActiveConversation === null;
          const isCurrentPrivateView =
            !!currentActiveConversation &&
            newMsg.senderId === currentActiveConversation &&
            newMsg.receiverId === currentUserId;

          const isMessageVisibleInOpenChat =
            isOpen &&
            !isShowingConversationList &&
            ((isGroupMessage && isCurrentGroupView) || isCurrentPrivateView);

          if (isMessageVisibleInOpenChat) {
            const msgs = await loadMessages(currentActiveConversation);
            if (msgs) {
              await markConversationAsRead(currentActiveConversation, msgs);
            }
            return;
          }

          // Optimistic local update so the badge reacts instantly
          setUnread((prev) => prev + 1);

          if (isGroupMessage) {
            setGroupUnread((prev) => prev + 1);
          } else {
            setPerUserUnread((prev) => ({
              ...prev,
              [newMsg.senderId]: (prev[newMsg.senderId] || 0) + 1,
            }));
          }

          // Then sync from server so counts stay correct
          await fetchUnread();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Message" },
        (payload) => {
          const deletedId = (payload.old as { id?: string })?.id;
          if (!deletedId) return;

          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          fetchUnread();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchUnread, loadMessages, markConversationAsRead]);

  const selectConversation = useCallback(
    async (userId: string | null) => {
      setActiveConversation(userId);
      setShowConversations(false);

      if (userId === null) {
        setGroupUnread(0);
        setUnread((prev) => Math.max(0, prev - groupUnread));
      } else {
        const userCount = perUserUnread[userId] || 0;
        setPerUserUnread((prev) => ({ ...prev, [userId]: 0 }));
        setUnread((prev) => Math.max(0, prev - userCount));
      }

      const msgs = await loadMessages(userId);
      if (msgs) {
        await markConversationAsRead(userId, msgs);
      }
    },
    [groupUnread, perUserUnread, loadMessages, markConversationAsRead],
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
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
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, activeConversation]);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;

      if (next) {
        setShowConversations(true);
        setActiveConversation(null);
        fetchUnread();
      }

      return next;
    });
  }, [fetchUnread]);

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
