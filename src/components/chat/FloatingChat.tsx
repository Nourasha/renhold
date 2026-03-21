"use client";
// src/components/chat/FloatingChat.tsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ChatUser, ChatMessage, getUserColor, formatTime } from "./types";

interface Props {
  currentUser: { id: string; name: string };
  users: ChatUser[];
}

export function FloatingChat({ currentUser, users }: Props) {
  const [open, setOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showConversations, setShowConversations] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allUserIds = [currentUser.id, ...users.map((u) => u.id)];
  const activeUser = users.find((u) => u.id === activeConversation);
  const conversationTitle = activeUser ? activeUser.name || activeUser.email : "Alle";

  // Fetch unread count
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

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("floating-chat-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Message" },
        async (payload) => {
          const newMsg = payload.new as any;
          const isGroup = !newMsg.receiverId && !activeConversation;
          const isPrivate = activeConversation && (
            (newMsg.senderId === activeConversation && newMsg.receiverId === currentUser.id) ||
            (newMsg.senderId === currentUser.id && newMsg.receiverId === activeConversation)
          );
          if (!isGroup && !isPrivate) {
            // Update unread for messages not in active conversation
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
  }, [activeConversation, currentUser.id]);

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
    // Reset unread when opening chat
    setUnread(0);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), receiverId: activeConversation || null }),
    });
    setInput("");
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function toggleOpen() {
    setOpen((prev) => !prev);
    if (!open) {
      setShowConversations(true);
      setActiveConversation(null);
      setUnread(0);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* ── Chat window ── */}
      {open && (
        <div className="w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!showConversations && (
                <button
                  onClick={() => { setShowConversations(true); setActiveConversation(null); }}
                  className="text-white/80 hover:text-white mr-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <span className="text-white font-semibold text-sm">
                {showConversations ? "Meldinger" : conversationTitle}
              </span>
              {!showConversations && (
                <div className="flex items-center gap-1 ml-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <button
              onClick={toggleOpen}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conversation list */}
          {showConversations && (
            <div className="flex-1 overflow-y-auto">
              {/* Group */}
              <button
                onClick={() => selectConversation(null)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-base flex-shrink-0">
                  👥
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Alle</p>
                  <p className="text-xs text-gray-400">Gruppemelding</p>
                </div>
              </button>

              {/* Users */}
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectConversation(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${getUserColor(user.id, allUserIds)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                    <p className="text-xs text-gray-400">Privat</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {!showConversations && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    <p className="text-2xl mb-1">💬</p>
                    <p>Ingen meldinger ennå</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMe && (
                        <div className={`w-6 h-6 rounded-full ${getUserColor(msg.senderId, allUserIds)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {msg.sender.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="max-w-[75%]">
                        {!isMe && !activeConversation && (
                          <p className="text-xs text-gray-400 mb-0.5 px-1">{msg.sender.name}</p>
                        )}
                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                          isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-0.5 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2.5 border-t border-gray-200 flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Skriv en melding..."
                  rows={1}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Floating button ── */}
      <button
        onClick={toggleOpen}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 relative"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
