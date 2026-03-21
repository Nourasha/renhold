// src/components/chat/ChatWindow.tsx
import { RefObject } from "react";
import { ChatUser, ChatMessage, getUserColor, formatTime } from "./types";

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
  onBack: () => void;
  onClose: () => void;
  onSelectConversation: (id: string | null) => void;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatWindow({
  showConversations, conversationTitle, users, allUserIds,
  messages, input, sending, bottomRef, activeConversation,
  currentUserId, onBack, onClose, onSelectConversation,
  onInputChange, onSend, onKeyDown,
}: Props) {
  return (
    <div className="w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!showConversations && (
            <button onClick={onBack} className="text-white/80 hover:text-white mr-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Conversation list */}
      {showConversations && (
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => onSelectConversation(null)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-base flex-shrink-0">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Alle</p>
              <p className="text-xs text-gray-400">Gruppemelding</p>
            </div>
          </button>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectConversation(user.id)}
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
              const isMe = msg.senderId === currentUserId;
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
                    <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
