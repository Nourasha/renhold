// src/components/layout/SidebarFooter.tsx
import { signOut } from "next-auth/react";

interface Props {
  user: { name?: string; email?: string };
  compact?: boolean;
}

export function SidebarFooter({ user, compact = false }: Props) {
  const avatarSize = compact ? "w-8 h-8 text-sm" : "w-9 h-9";

  return (
    <div className="px-4 py-4 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${avatarSize} rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold`}>
          {user.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full text-sm text-gray-500 hover:text-red-600 text-left px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
      >
        Logg ut
      </button>
    </div>
  );
}
