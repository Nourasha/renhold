"use client";
// src/components/chat/FloatingChat.tsx
import { ChatUser } from "./types";
import { useChatState } from "./useChatState";
import { ChatWindow } from "./ChatWindow";
import { ChatBubbleButton } from "./ChatBubbleButton";

interface Props {
  currentUser: { id: string; name: string };
  users: ChatUser[];
}

export function FloatingChat({ currentUser, users }: Props) {
  const allUserIds = [currentUser.id, ...users.map((u) => u.id)];
  const activeUser = (userId: string | null) => users.find((u) => u.id === userId);

  const {
    open, activeConversation, messages, input, sending,
    unread, showConversations, bottomRef,
    setInput, setShowConversations, setActiveConversation,
    selectConversation, sendMessage, toggleOpen,
  } = useChatState({ currentUserId: currentUser.id });

  const conversationTitle = activeUser(activeConversation)?.name
    || activeUser(activeConversation)?.email
    || "Alle";

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
          onBack={() => { setShowConversations(true); setActiveConversation(null); }}
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
