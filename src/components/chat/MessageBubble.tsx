// src/components/chat/MessageBubble.tsx
import { ChatMessage, getUserColor, formatTime } from "./types";

interface Props {
  message: ChatMessage;
  currentUserId: string;
  allUserIds: string[];
  isGroupChat: boolean;
  onDelete: (id: string) => void;
}

export function MessageBubble({
  message,
  currentUserId,
  allUserIds,
  isGroupChat,
  onDelete,
}: Props) {
  const isMe = message.senderId === currentUserId;

  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isMe && (
        <div className={`w-7 h-7 rounded-full ${getUserColor(message.senderId, allUserIds)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {message.sender.name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}

      <div className="max-w-[80%] md:max-w-[70%] group">
        {/* Sender name — only in group chat for others */}
        {!isMe && isGroupChat && (
          <p className="text-xs text-gray-500 mb-1 px-1">
            {message.sender.name || "Ukjent"}
          </p>
        )}

        <div className={`relative px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-sm ${
          isMe
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
            {formatTime(message.createdAt)}
          </p>

          {isMe && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
