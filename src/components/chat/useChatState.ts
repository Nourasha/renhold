// src/components/chat/useChatState.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage, parseReadBy } from "./types";

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

  const openRef = useRef(open);
  const activeConversationRef = useRef(activeConversation);
  const showConversationsRef = useRef(showConversations);
  const fetchingUnreadRef = useRef(false);
  const latestLoadTokenRef = useRef(0);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    showConversationsRef.current = showConversations;
  }, [showConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateAppBadge = useCallback((count: number) => {
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void> | void;
      clearAppBadge?: () => Promise<void> | void;
    };

    if (
      typeof nav.setAppBadge !== "function" ||
      typeof nav.clearAppBadge !== "function"
    ) {
      return;
    }

    try {
      if (count > 0) {
        nav.setAppBadge(count);
      } else {
        nav.clearAppBadge();
      }
    } catch {
      // ignore
    }
  }, []);

  const notifyServiceWorkerCloseChatNotifications = useCallback(
    (userId: string | null) => {
      if (!("serviceWorker" in navigator)) return;
      if (!navigator.serviceWorker.controller) return;

      navigator.serviceWorker.controller.postMessage({
        type: "CLOSE_CHAT_NOTIFICATIONS",
        userId,
      });
    },
    [],
  );

  const notifyServiceWorkerCloseAllChatNotifications = useCallback(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type: "CLOSE_ALL_CHAT_NOTIFICATIONS",
    });
  }, []);

  const fetchUnread = useCallback(async () => {
    if (fetchingUnreadRef.current) return;

    fetchingUnreadRef.current = true;
    try {
      const res = await fetch("/api/messages/unread", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      const count = Number(data.count || 0);
      const perUser = data.perUser || {};
      const group = Number(data.group || 0);

      setUnread(count);
      setPerUserUnread(perUser);
      setGroupUnread(group);
      updateAppBadge(count);
    } catch {
      // ignore
    } finally {
      fetchingUnreadRef.current = false;
    }
  }, [updateAppBadge]);

  const withDeliveryStatus = useCallback(
    (msg: ChatMessage): ChatMessage => {
      if (msg.senderId !== currentUserId) return msg;

      const readBy = parseReadBy(msg.readBy);
      const otherReaders = readBy.filter((id) => id !== currentUserId);

      return {
        ...msg,
        deliveryStatus: otherReaders.length > 0 ? "read" : "sent",
      };
    },
    [currentUserId],
  );

  const decorateMessagesWithStatus = useCallback(
    (incomingMessages: ChatMessage[]): ChatMessage[] => {
      return incomingMessages.map(withDeliveryStatus);
    },
    [withDeliveryStatus],
  );

  const loadMessages = useCallback(
    async (conversationId: string | null): Promise<ChatMessage[] | null> => {
      const token = ++latestLoadTokenRef.current;
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
        const nextMessages: ChatMessage[] = decorateMessagesWithStatus(
          data.messages || [],
        );

        if (token !== latestLoadTokenRef.current) {
          return nextMessages;
        }

        setMessages(nextMessages);
        return nextMessages;
      } catch {
        return null;
      }
    },
    [decorateMessagesWithStatus],
  );

  const markConversationAsRead = useCallback(
    async (msgs: ChatMessage[]) => {
      const unreadMsgs = msgs.filter((m) => {
        if (m.senderId === currentUserId) return false;
        const readBy = parseReadBy(m.readBy);
        return !readBy.includes(currentUserId);
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
        // ignore
      }

      await fetchUnread();
    },
    [currentUserId, fetchUnread],
  );

  useEffect(() => {
    fetchUnread();

    const interval = setInterval(() => {
      fetchUnread();
    }, 10000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchUnread();
      }
    };

    const handleFocus = () => {
      fetchUnread();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
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
            content: string;
            senderId: string;
            receiverId: string | null;
            createdAt: string;
            readBy: string;
            sender?: { id: string; name: string | null };
          };

          if (!newMsg || newMsg.senderId === currentUserId) return;

          const currentOpen = openRef.current;
          const currentConversation = activeConversationRef.current;
          const currentShowConversations = showConversationsRef.current;

          const isGroupMessage = !newMsg.receiverId;
          const isActiveGroup = currentConversation === null;
          const isActivePrivate =
            !!currentConversation &&
            newMsg.senderId === currentConversation &&
            newMsg.receiverId === currentUserId;

          const isMessageInVisibleChat =
            currentOpen &&
            !currentShowConversations &&
            ((isGroupMessage && isActiveGroup) || isActivePrivate);

          if (isMessageInVisibleChat) {
            const msgs = await loadMessages(currentConversation);
            if (msgs) {
              await markConversationAsRead(msgs);

              if (isGroupMessage) {
                notifyServiceWorkerCloseChatNotifications(null);
              } else {
                notifyServiceWorkerCloseChatNotifications(newMsg.senderId);
              }
            }
            return;
          }

          setUnread((prev) => {
            const next = prev + 1;
            updateAppBadge(next);
            return next;
          });

          if (isGroupMessage) {
            setGroupUnread((prev) => prev + 1);
          } else {
            setPerUserUnread((prev) => ({
              ...prev,
              [newMsg.senderId]: (prev[newMsg.senderId] || 0) + 1,
            }));
          }

          await fetchUnread();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Message" },
        async (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          if (!updatedMsg?.id) return;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMsg.id
                ? withDeliveryStatus({ ...msg, ...updatedMsg })
                : msg,
            ),
          );

          await fetchUnread();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Message" },
        async (payload) => {
          const deletedId = (payload.old as { id?: string })?.id;
          if (!deletedId) return;

          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          await fetchUnread();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    currentUserId,
    fetchUnread,
    loadMessages,
    markConversationAsRead,
    notifyServiceWorkerCloseChatNotifications,
    updateAppBadge,
    withDeliveryStatus,
  ]);

  const selectConversation = useCallback(
    async (userId: string | null) => {
      setActiveConversation(userId);
      activeConversationRef.current = userId;
      setShowConversations(false);
      showConversationsRef.current = false;

      if (userId === null) {
        setGroupUnread(0);
        setUnread((prev) => {
          const next = Math.max(0, prev - groupUnread);
          updateAppBadge(next);
          return next;
        });
      } else {
        const userCount = perUserUnread[userId] || 0;
        setPerUserUnread((prev) => ({ ...prev, [userId]: 0 }));
        setUnread((prev) => {
          const next = Math.max(0, prev - userCount);
          updateAppBadge(next);
          return next;
        });
      }

      const msgs = await loadMessages(userId);
      if (msgs) {
        await markConversationAsRead(msgs);
      }

      notifyServiceWorkerCloseChatNotifications(userId);
    },
    [
      groupUnread,
      perUserUnread,
      loadMessages,
      markConversationAsRead,
      notifyServiceWorkerCloseChatNotifications,
      updateAppBadge,
    ],
  );

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending) return;

    const conversationAtSend = activeConversationRef.current;

    setSending(true);
    setInput("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      content,
      senderId: currentUserId,
      receiverId: conversationAtSend || null,
      createdAt: new Date().toISOString(),
      readBy: JSON.stringify([currentUserId]),
      sender: {
        id: currentUserId,
        name: null,
      },
      deliveryStatus: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          receiverId: conversationAtSend || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();
      const realMessage: ChatMessage = withDeliveryStatus(data.message);

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === realMessage.id);
        if (exists) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) => (m.id === tempId ? realMessage : m));
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, deliveryStatus: "failed" } : m,
        ),
      );
      setInput(content);
    } finally {
      setSending(false);
    }
  }, [input, sending, currentUserId, withDeliveryStatus]);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      openRef.current = next;

      if (next) {
        setShowConversations(true);
        showConversationsRef.current = true;
        setActiveConversation(null);
        activeConversationRef.current = null;
        fetchUnread();
        notifyServiceWorkerCloseAllChatNotifications();
      }

      return next;
    });
  }, [fetchUnread, notifyServiceWorkerCloseAllChatNotifications]);

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
