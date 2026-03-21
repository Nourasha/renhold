"use client";
// src/components/ChatView.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  createdAt: string | Date;
  readBy: string;
  sender: { id: string; name: string | null };
}

interface Props {
  currentUser: { id: string; name: string };
  users: User[];
  initialMessages: Message[];
  activeConversation: string | null;
}

const userColors = [
  "bg-indigo-500", "bg-pink-500", "bg-teal-500",
  "bg-amber-500", "bg-cyan-600", "bg-rose-500",
  "bg-lime-600", "bg-violet-500",
];

function getUserColor(userId: string, allIds: string[]) {
  const idx = allIds.indexOf(userId);
  return userColors[idx % userColors.length] || "bg-gray-500";
}

function formatTime(dateStr: string | Date) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  }
  return (
    d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }) +
    " " +
    d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })
  );
}

export function ChatView({ currentUser, users, initialMessages, activeConversation }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const allUserIds = [currentUser.id, ...users.map((u) => u.id)];

  const activeUser = users.find((u) => u.id === activeConversation);
  const conversationTitle = activeUser ? activeUser.name || activeUser.email : "Alle";

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Supabase Realtime — replace polling ──
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        async (payload) => {
          const newMsg = payload.new as any;

          // Check if this message belongs to current conversation
          const isGroupMsg = !newMsg.receiverId && !activeConversation;
          const isPrivateMsg =
            activeConversation &&
            ((newMsg.senderId === activeConversation && newMsg.receiverId === currentUser.id) ||
              (newMsg.senderId === currentUser.id && newMsg.receiverId === activeConversation));

          if (!isGroupMsg && !isPrivateMsg) return;

          // Fetch full message with sender info
          const res = await fetch(
            activeConversation
              ? `/api/messages?with=${activeConversation}`
              : "/api/messages"
          );
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Message" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, currentUser.id]);

  // Reset messages when conversation changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

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
      // Realtime will handle adding the message to the list
    }
    setSending(false);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Slett denne meldingen?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    // Realtime DELETE event will handle removing from list
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-48px)] gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

      {/* Conversation list */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Meldinger</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Group chat */}
          <button
            onClick={() => router.push("/dashboard/chat")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              !activeConversation ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              👥
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${!activeConversation ? "text-blue-700" : "text-gray-900"}`}>
                Alle
              </p>
              <p className="text-xs text-gray-400">Gruppemelding</p>
            </div>
          </button>

          {/* Individual users */}
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => router.push(`/dashboard/chat?with=${user.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                activeConversation === user.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className={`w-9 h-9 rounded-full ${getUserColor(user.id, allUserIds)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${activeConversation === user.id ? "text-blue-700" : "text-gray-900"}`}>
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-400">Privat</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
            activeUser ? getUserColor(activeUser.id, allUserIds) : "bg-blue-600"
          }`}>
            {activeUser ? activeUser.name?.charAt(0).toUpperCase() || "?" : "👥"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{conversationTitle}</p>
            <p className="text-xs text-gray-400">
              {activeUser ? "Privat samtale" : "Gruppemelding til alle"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Sanntid</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12">
              <p className="text-3xl mb-2">💬</p>
              <p>Ingen meldinger ennå. Si hei!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <div className={`w-7 h-7 rounded-full ${getUserColor(msg.senderId, allUserIds)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {msg.sender.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                <div className="max-w-[70%] group">
                  {!isMe && !activeConversation && (
                    <p className="text-xs text-gray-500 mb-1 px-1">
                      {msg.sender.name || "Ukjent"}
                    </p>
                  )}

                  <div className={`relative px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                      {formatTime(msg.createdAt)}
                    </p>

                    {isMe && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Skriv til ${conversationTitle}...`}
            rows={1}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-40 transition-colors font-medium text-sm flex-shrink-0"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
