// src/components/chat/ChatWindow.tsx
import { RefObject } from "react";
import {
  ChatUser,
  ChatMessage,
  getUserColor,
  formatTime,
  parseReadBy,
} from "./types";

interface Props {
  showConversations: boolean;
  conversationTitle: string;
  users: ChatUser[];
  allUserIds: string[];
  messages: ChatMessage[];
  input: string;
  sending: boolean;
  bottomRef: RefObject<HTMLDivElement>;
  activeConversation: string | null;
  currentUserId: string;
  perUserUnread: Record<string, number>;
  groupUnread: number;
  onBack: () => void;
  onClose: () => void;
  onSelectConversation: (id: string | null) => void;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function getReaderNames(
  msg: ChatMessage,
  users: ChatUser[],
  currentUserId: string,
): string[] {
  const readBy = parseReadBy(msg.readBy);
  const otherReaders = readBy.filter((id) => id !== currentUserId);

  return otherReaders.map((readerId) => {
    const user = users.find((u) => u.id === readerId);
    return user?.name || user?.email || "Ukjent";
  });
}

function DeliveryStatus({
  msg,
  users,
  currentUserId,
}: {
  msg: ChatMessage;
  users: ChatUser[];
  currentUserId: string;
}) {
  if (msg.deliveryStatus === "sending") {
    return (
      <svg className="w-3 h-3 opacity-50" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (msg.deliveryStatus === "failed") {
    return <span className="text-red-300 text-xs">!</span>;
  }

  if (msg.deliveryStatus === "sent") {
    return (
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
        <path
          d="M1 6L4.5 9.5L10 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <path
          d="M7 6L10.5 9.5L16 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>
    );
  }

  if (msg.deliveryStatus === "read") {
    const readerNames = getReaderNames(msg, users, currentUserId);
    const isGroup = !msg.receiverId;
    const label =
      isGroup && readerNames.length > 0
        ? `Lest av ${readerNames.join(", ")}`
        : undefined;

    return (
      <span className="flex items-center gap-1">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <path
            d="M1 6L4.5 9.5L10 4"
            stroke="#53BDEB"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 6L10.5 9.5L16 4"
            stroke="#53BDEB"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label && <span className="text-[#53BDEB]">{label}</span>}
      </span>
    );
  }

  return null;
}

export function ChatWindow({
  showConversations,
  conversationTitle,
  users,
  allUserIds,
  messages,
  input,
  sending,
  bottomRef,
  activeConversation,
  currentUserId,
  perUserUnread,
  groupUnread,
  onBack,
  onClose,
  onSelectConversation,
  onInputChange,
  onSend,
  onKeyDown,
}: Props) {
  return (
    <div className="w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!showConversations && (
            <button
              onClick={onBack}
              className="text-white/80 hover:text-white mr-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <span className="text-white font-semibold text-sm">
            {showConversations ? "Meldinger" : conversationTitle}
          </span>
          {!showConversations && (
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse ml-1" />
          )}
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {showConversations && (
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => onSelectConversation(null)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-base flex-shrink-0">
              👥
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Alle</p>
              <p className="text-xs text-gray-400">Gruppemelding</p>
            </div>
            {groupUnread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {groupUnread}
              </span>
            )}
          </button>

          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectConversation(user.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-left"
            >
              <div
                className={`w-9 h-9 rounded-full ${getUserColor(
                  user.id,
                  allUserIds,
                )} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
              >
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-400">Privat</p>
              </div>
              {perUserUnread[user.id] > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {perUserUnread[user.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

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
              const isMe = msg.senderId === currentUserId;
              const senderName =
                msg.sender?.name ||
                users.find((u) => u.id === msg.senderId)?.name ||
                "Ukjent";

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMe && (
                    <div
                      className={`w-6 h-6 rounded-full ${getUserColor(
                        msg.senderId,
                        allUserIds,
                      )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                    >
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="max-w-[75%]">
                    {!isMe && !activeConversation && (
                      <p className="text-xs text-gray-400 mb-0.5 px-1">
                        {senderName}
                      </p>
                    )}

                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>

                      <div
                        className={`text-xs mt-0.5 flex items-center gap-1 flex-wrap ${
                          isMe ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        <span>{formatTime(msg.createdAt)}</span>

                        {isMe && msg.deliveryStatus && (
                          <DeliveryStatus
                            msg={msg}
                            users={users}
                            currentUserId={currentUserId}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-2.5 border-t border-gray-200 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Skriv en melding..."
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || sending}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
