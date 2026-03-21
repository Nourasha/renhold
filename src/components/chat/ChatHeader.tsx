// src/components/chat/ChatHeader.tsx
import { ChatUser, getUserColor } from "./types";

interface Props {
  activeUser: ChatUser | undefined;
  allUserIds: string[];
  onBack: () => void;
}

export function ChatHeader({ activeUser, allUserIds, onBack }: Props) {
  const title = activeUser ? activeUser.name || activeUser.email : "Alle";

  return (
    <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
      {/* Back button — mobile only */}
      <button
        onClick={onBack}
        className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
        activeUser ? getUserColor(activeUser.id, allUserIds) : "bg-blue-600"
      }`}>
        {activeUser ? activeUser.name?.charAt(0).toUpperCase() || "?" : "👥"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-400">
          {activeUser ? "Privat samtale" : "Gruppemelding til alle"}
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400 hidden sm:inline">Sanntid</span>
      </div>
    </div>
  );
}
