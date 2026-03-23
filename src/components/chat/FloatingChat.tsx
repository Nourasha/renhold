"use client";

// src/components/chat/FloatingChat.tsx
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
  const handledNotificationRef = useRef(false);
  const openRef = useRef(false);
  const activeConversationRef = useRef<string | null>(null);

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
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chat = params.get("chat");
    const userId = params.get("userId");

    if (chat !== "open") return;
    if (handledNotificationRef.current) return;

    handledNotificationRef.current = true;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    const cleanupUrl = () => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete("chat");
      nextParams.delete("userId");

      const nextQuery = nextParams.toString();
      const nextUrl = nextQuery ? `/dashboard?${nextQuery}` : "/dashboard";
      window.history.replaceState({}, "", nextUrl);
    };

    const tryOpenFromNotification = async () => {
      if (cancelled) return;

      attempts += 1;

      if (!openRef.current) {
        toggleOpen();

        if (attempts < maxAttempts) {
          setTimeout(tryOpenFromNotification, 250);
        } else {
          cleanupUrl();
        }
        return;
      }

      if (userId) {
        try {
          await selectConversation(userId);
        } catch {
          // retry below
        }

        if (
          activeConversationRef.current !== userId &&
          attempts < maxAttempts
        ) {
          setTimeout(tryOpenFromNotification, 350);
          return;
        }
      } else {
        setShowConversations(true);
        setActiveConversation(null);
      }

      cleanupUrl();
    };

    const timer = setTimeout(tryOpenFromNotification, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
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
