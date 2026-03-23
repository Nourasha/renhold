// src/components/chat/types.ts

export interface ChatUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  createdAt: string | Date;
  readBy: string;
  sender: { id: string; name: string | null };
  deliveryStatus?: "sending" | "sent" | "read" | "failed";
}

export const userColors = [
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-rose-500",
  "bg-lime-600",
  "bg-violet-500",
];

export function getUserColor(userId: string, allIds: string[]) {
  const idx = allIds.indexOf(userId);
  return userColors[idx % userColors.length] || "bg-gray-500";
}

export function formatTime(dateStr: string | Date) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    d.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    }) +
    " " +
    d.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function parseReadBy(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
