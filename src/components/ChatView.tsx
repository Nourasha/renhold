"use client";
// src/components/ChatView.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChatUser, ChatMessage } from "./chat/types";
import { ConversationSidebar } from "./chat/ConversationSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageBubble } from "./chat/MessageBubble";
import { MessageInput } from "./chat/MessageInput";

interface Props {
  currentUser: { id: string; name: string };
  users: ChatUser[];
  initialMessages: ChatMessage[];
  activeConversation: string | null;
}

export function ChatView({ currentUser, users, initialMessages, activeConversation }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!activeConversation);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allUserIds = [currentUser.id, ...users.map((u) => u.id)];
  const activeUser = users.find((u) => u.id === activeConversation);
  const conversationTitle = activeUser ? activeUser.name || activeUser.email : "Alle";

  useEffect(() => {
    if (activeConversation) setShowSidebar(false);
    else setShowSidebar(true);
  }, [activeConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Message" },
        async (payload) => {
          const newMsg = payload.new as any;
          const isGroup = !newMsg.receiverId && !activeConversation;
          const isPrivate = activeConversation && (
            (newMsg.senderId === activeConversation && newMsg.receiverId === currentUser.id) ||
            (newMsg.senderId === currentUser.id && newMsg.receiverId === activeConversation)
          );
          if (!isGroup && !isPrivate) return;

          const res = await fetch(activeConversation ? `/api/messages?with=${activeConversation}` : "/api/messages");
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages);
          }
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Message" },
        (payload) => setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversation, currentUser.id]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), receiverId: activeConversation || null }),
    });
    if (res.ok) setInput("");
    setSending(false);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Slett denne meldingen?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
  }

  function navigateTo(url: string) {
    setShowSidebar(false);
    router.push(url);
  }

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-48px)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

      <ConversationSidebar
        users={users}
        allUserIds={allUserIds}
        activeConversation={activeConversation}
        visible={showSidebar}
        onSelectAll={() => navigateTo("/dashboard/chat")}
        onSelectUser={(id) => navigateTo(`/dashboard/chat?with=${id}`)}
      />

      <div className={`${showSidebar ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0`}>

        <ChatHeader
          activeUser={activeUser}
          allUserIds={allUserIds}
          onBack={() => setShowSidebar(true)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12">
              <p className="text-3xl mb-2">💬</p>
              <p>Ingen meldinger ennå. Si hei!</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUser.id}
              allUserIds={allUserIds}
              isGroupChat={!activeConversation}
              onDelete={deleteMessage}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <MessageInput
          value={input}
          sending={sending}
          placeholder={`Skriv til ${conversationTitle}...`}
          onChange={setInput}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
