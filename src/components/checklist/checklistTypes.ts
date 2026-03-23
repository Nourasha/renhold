// src/components/checklist/checklistTypes.ts

export interface Completion {
  userId: string;
  user: { id: string; name: string | null };
}

export interface Item {
  id: string;
  label: string;
  order: number;
  completions: Completion[];
}

export interface Group {
  id: string;
  title: string;
  color: string;
  order: number;
  items: Item[];
}

export const COLORS = ["blue", "green", "purple", "orange", "red", "yellow"];

export const groupStyles: Record<string, { card: string; header: string; check: string }> = {
  blue:   { card: "bg-blue-50 border-blue-200",   header: "bg-blue-600 text-white",   check: "accent-blue-600" },
  green:  { card: "bg-green-50 border-green-200",  header: "bg-green-600 text-white",  check: "accent-green-600" },
  purple: { card: "bg-purple-50 border-purple-200", header: "bg-purple-600 text-white", check: "accent-purple-600" },
  orange: { card: "bg-orange-50 border-orange-200", header: "bg-orange-500 text-white", check: "accent-orange-500" },
  red:    { card: "bg-red-50 border-red-200",     header: "bg-red-600 text-white",    check: "accent-red-600" },
  yellow: { card: "bg-yellow-50 border-yellow-200", header: "bg-yellow-500 text-white", check: "accent-yellow-500" },
};

const userColors = [
  "bg-indigo-100 text-indigo-800", "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",     "bg-amber-100 text-amber-800",
  "bg-cyan-100 text-cyan-800",     "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",     "bg-violet-100 text-violet-800",
];

export function getUserColor(userId: string, allUserIds: string[]) {
  const idx = allUserIds.indexOf(userId);
  return userColors[idx % userColors.length] || "bg-gray-100 text-gray-700";
}
