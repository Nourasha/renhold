// ─── Bruker ───────────────────────────────────────────────
export interface SimpleUser {
  id: string;
  name: string | null;
}

// ─── Admin ────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string | Date;
}

export interface InviteCodeMeta {
  id: string;
  used: boolean;
  createdAt: string | Date;
  usedAt?: string | Date | null;
}

// ─── Checklist (brett) ────────────────────────────────────
export interface BoardCompletion {
  userId: string;
  user: SimpleUser;
}

export interface Item {
  id: string;
  label: string;
  order: number;
  completions: BoardCompletion[];
}

export interface Group {
  id: string;
  title: string;
  color: string;
  order: number;
  items: Item[];
}

// ─── Checklist (ferdige) ──────────────────────────────────
export interface Completion {
  id: string;
  completedAt: string | Date;
  date: string;
  user: SimpleUser;
  item: {
    id: string;
    label: string;
    group: { title: string; color: string };
  };
}

export interface DailyNote {
  id: string;
  content: string;
  date: string;
  user: SimpleUser;
}

// ─── Avvik ────────────────────────────────────────────────
export interface Deviation {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: Date | string;
  userId: string;
  user: SimpleUser;
}

// ─── Chat ─────────────────────────────────────────────────
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
  sender: SimpleUser;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
}
