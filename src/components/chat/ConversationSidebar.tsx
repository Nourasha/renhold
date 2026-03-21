// src/components/chat/ConversationSidebar.tsx
import { ChatUser, getUserColor } from "./types";

interface Props {
  users: ChatUser[];
  allUserIds: string[];
  activeConversation: string | null;
  visible: boolean;
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
}

export function ConversationSidebar({
  users,
  allUserIds,
  activeConversation,
  visible,
  onSelectAll,
  onSelectUser,
}: Props) {
  return (
    <div className={`
      ${visible ? "flex" : "hidden"} md:flex
      w-full md:w-64 flex-shrink-0 border-r border-gray-200 flex-col
      absolute md:relative inset-0 z-10 bg-white md:z-auto
    `}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="font-bold text-gray-900">Meldinger</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group chat */}
        <button
          onClick={onSelectAll}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
            !activeConversation ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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
            onClick={() => onSelectUser(user.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              activeConversation === user.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-full ${getUserColor(user.id, allUserIds)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
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
  );
}
