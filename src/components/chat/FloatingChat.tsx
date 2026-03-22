"use client";

import { useEffect, useRef } from "react";
import { ChatUser } from "./types";
import { useChatState } from "./useChatState";
import { ChatWindow } from "./ChatWindow";
import { ChatBubbleButton } from "./ChatBubbleButton";

interface Props {
  currentUser: { id: string; name: string };
  users: ChatUser[];
}

export function FloatingChat({ currentUser, users }: Props) {
  const handledRef = useRef(false);

  const allUserIds = [currentUser.id, ...users.map((u) => u.id)];
  const activeUser = (userId: string | null) =>
    users.find((u) => u.id === userId);

  const {
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
  } = useChatState({ currentUserId: currentUser.id });

  useEffect(() => {
    if (handledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const chat = params.get("chat");
    const userId = params.get("userId");

    if (chat !== "open") return;
    handledRef.current = true;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 6;

    const cleanupUrl = () => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete("chat");
      nextParams.delete("userId");

      const nextQuery = nextParams.toString();
      const nextUrl = nextQuery ? `/dashboard?${nextQuery}` : "/dashboard";
      window.history.replaceState({}, "", nextUrl);
    };

    const tryOpen = async () => {
      if (cancelled) return;
      attempts += 1;

      if (!open) {
        toggleOpen();
        setTimeout(tryOpen, 250);
        return;
      }

      if (userId) {
        try {
          await selectConversation(userId);
        } catch {
          // prøv igjen
        }

        if (activeConversation !== userId && attempts < maxAttempts) {
          setTimeout(tryOpen, 350);
          return;
        }
      } else {
        setShowConversations(true);
        setActiveConversation(null);
      }

      cleanupUrl();
    };

    setTimeout(tryOpen, 250);

    return () => {
      cancelled = true;
    };
  }, [
    open,
    activeConversation,
    toggleOpen,
    selectConversation,
    setShowConversations,
    setActiveConversation,
  ]);

  const conversationTitle =
    activeUser(activeConversation)?.name ||
    activeUser(activeConversation)?.email ||
    "Alle";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <ChatWindow
          showConversations={showConversations}
          conversationTitle={conversationTitle}
          users={users}
          allUserIds={allUserIds}
          messages={messages}
          input={input}
          sending={sending}
          bottomRef={bottomRef}
          activeConversation={activeConversation}
          currentUserId={currentUser.id}
          perUserUnread={perUserUnread}
          groupUnread={groupUnread}
          onBack={() => {
            setShowConversations(true);
            setActiveConversation(null);
          }}
          onClose={toggleOpen}
          onSelectConversation={selectConversation}
          onInputChange={setInput}
          onSend={sendMessage}
          onKeyDown={handleKeyDown}
        />
      )}
      <ChatBubbleButton open={open} unread={unread} onClick={toggleOpen} />
    </div>
  );
}
