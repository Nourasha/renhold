// src/components/completed/types.ts

export interface Completion {
  id: string;
  completedAt: string | Date;
  date: string;
  user: { id: string; name: string | null };
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
  user: { id: string; name: string | null };
}

export const groupHeaderColors: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  green:  "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
  orange: "bg-orange-500 text-white",
  red:    "bg-red-600 text-white",
  yellow: "bg-yellow-500 text-white",
};

export const groupBorderColors: Record<string, string> = {
  blue:   "border-blue-200",
  green:  "border-green-200",
  purple: "border-purple-200",
  orange: "border-orange-200",
  red:    "border-red-200",
  yellow: "border-yellow-200",
};

export const userColors = [
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-pink-500",   text: "text-white" },
  { bg: "bg-teal-500",   text: "text-white" },
  { bg: "bg-amber-500",  text: "text-white" },
  { bg: "bg-cyan-600",   text: "text-white" },
  { bg: "bg-rose-500",   text: "text-white" },
  { bg: "bg-lime-600",   text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
];

export const DAY_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "bg-red-50",    text: "text-red-800"    },
  1: { bg: "bg-blue-50",   text: "text-blue-800"   },
  2: { bg: "bg-purple-50", text: "text-purple-800" },
  3: { bg: "bg-green-50",  text: "text-green-800"  },
  4: { bg: "bg-orange-50", text: "text-orange-800" },
  5: { bg: "bg-pink-50",   text: "text-pink-800"   },
  6: { bg: "bg-yellow-50", text: "text-yellow-800" },
};

export const DAYS_NO = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

export function getUserColorClass(userId: string, allIds: string[]) {
  const idx = allIds.indexOf(userId);
  const c = userColors[idx % userColors.length] || { bg: "bg-gray-500", text: "text-white" };
  return `${c.bg} ${c.text}`;
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const day = DAYS_NO[d.getDay()];
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

// ISO 8601 week number — week starts on Monday
export function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  // Move to nearest Thursday (ISO standard)
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  return Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ISO year (can differ from calendar year around new year)
export function getWeekYear(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return thursday.getFullYear();
}

export function getWeekKey(dateStr: string): string {
  const week = getWeekNumber(dateStr);
  const year = getWeekYear(dateStr);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// Get Monday of the week for a given date
export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay() || 7; // treat Sunday as 7
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().split("T")[0];
}

// Get Sunday of the week for a given date
export function getWeekEnd(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 7);
  return d.toISOString().split("T")[0];
}
