import type { Completion, DailyNote } from "@/types";

// ─── User color utilities ──────────────────────────────────

const USER_COLORS_BG = [
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-rose-500",
  "bg-lime-600",
  "bg-violet-500",
];

const USER_COLORS_TINT = [
  "bg-indigo-100 text-indigo-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
  "bg-amber-100 text-amber-800",
  "bg-cyan-100 text-cyan-800",
  "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",
  "bg-violet-100 text-violet-800",
];

/** Returns a solid bg color class (e.g. "bg-indigo-500") — for avatar circles */
export function getUserColorBg(userId: string, allIds: string[]): string {
  const idx = allIds.indexOf(userId);
  return USER_COLORS_BG[idx % USER_COLORS_BG.length] ?? "bg-gray-500";
}

/** Returns a tinted bg+text class (e.g. "bg-indigo-100 text-indigo-800") — for badges */
export function getUserColorTint(userId: string, allIds: string[]): string {
  const idx = allIds.indexOf(userId);
  return USER_COLORS_TINT[idx % USER_COLORS_TINT.length] ?? "bg-gray-100 text-gray-700";
}

// ─── Group/checklist styles ────────────────────────────────

export const COLORS = ["blue", "green", "purple", "orange", "red", "yellow"] as const;

export const groupStyles: Record<
  string,
  { card: string; header: string; check: string; border: string }
> = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    header: "bg-blue-600 text-white",
    check: "accent-blue-600",
    border: "border-blue-200",
  },
  green: {
    card: "bg-green-50 border-green-200",
    header: "bg-green-600 text-white",
    check: "accent-green-600",
    border: "border-green-200",
  },
  purple: {
    card: "bg-purple-50 border-purple-200",
    header: "bg-purple-600 text-white",
    check: "accent-purple-600",
    border: "border-purple-200",
  },
  orange: {
    card: "bg-orange-50 border-orange-200",
    header: "bg-orange-500 text-white",
    check: "accent-orange-500",
    border: "border-orange-200",
  },
  red: {
    card: "bg-red-50 border-red-200",
    header: "bg-red-600 text-white",
    check: "accent-red-600",
    border: "border-red-200",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    header: "bg-yellow-500 text-white",
    check: "accent-yellow-500",
    border: "border-yellow-200",
  },
};

// ─── Deviation config ──────────────────────────────────────

export const severityConfig = {
  low: { label: "Lav", color: "bg-green-100 text-green-700" },
  medium: { label: "Middels", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "Høy", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Kritisk", color: "bg-red-100 text-red-700" },
} as const;

export const statusConfig = {
  open: { label: "Åpen", color: "bg-red-100 text-red-700" },
  "in-progress": { label: "Under behandling", color: "bg-yellow-100 text-yellow-700" },
  resolved: { label: "Løst", color: "bg-green-100 text-green-700" },
} as const;

// ─── Date / week utilities ─────────────────────────────────

export const DAYS_NO = [
  "søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag",
];

export const DAY_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "bg-red-50", text: "text-red-800" },
  1: { bg: "bg-blue-50", text: "text-blue-800" },
  2: { bg: "bg-purple-50", text: "text-purple-800" },
  3: { bg: "bg-green-50", text: "text-green-800" },
  4: { bg: "bg-orange-50", text: "text-orange-800" },
  5: { bg: "bg-pink-50", text: "text-pink-800" },
  6: { bg: "bg-yellow-50", text: "text-yellow-800" },
};

function parseUTC(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`);
}

export function getWeekNumber(dateStr: string): number {
  const d = parseUTC(dateStr);
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeekYear(dateStr: string): number {
  const d = parseUTC(dateStr);
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return thursday.getUTCFullYear();
}

export function getWeekKey(dateStr: string): string {
  return `${getWeekYear(dateStr)}-W${String(getWeekNumber(dateStr)).padStart(2, "0")}`;
}

export function getWeekStart(dateStr: string): string {
  const d = parseUTC(dateStr);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().split("T")[0];
}

export function getWeekEnd(dateStr: string): string {
  const d = parseUTC(dateStr);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 7);
  return d.toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  const d = parseUTC(dateStr);
  const day = DAYS_NO[d.getUTCDay()];
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
}

// ─── Chat utilities ────────────────────────────────────────

export function formatTime(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }) +
    " " +
    d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })
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

// ─── Completed/checklist helpers ──────────────────────────

export function groupByDate(filtered: Completion[]) {
  return filtered.reduce<Record<string, Record<string, Record<string, Completion[]>>>>(
    (acc, c) => {
      if (!acc[c.date]) acc[c.date] = {};
      if (!acc[c.date][c.item.group.title]) acc[c.date][c.item.group.title] = {};
      if (!acc[c.date][c.item.group.title][c.item.label]) {
        acc[c.date][c.item.group.title][c.item.label] = [];
      }
      acc[c.date][c.item.group.title][c.item.label].push(c);
      return acc;
    },
    {},
  );
}

export function groupNotesByDate(notes: DailyNote[]) {
  return notes.reduce<Record<string, DailyNote[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});
}

export function getVisibleDates(
  byDate: Record<string, unknown>,
  notesByDate: Record<string, unknown>,
  filterDate: string,
  currentWeekKey: string,
): string[] {
  const allDates = Array.from(
    new Set([...Object.keys(byDate), ...Object.keys(notesByDate)]),
  );

  return allDates
    .filter((date) => {
      if (filterDate) return date === filterDate;
      return getWeekKey(date) === currentWeekKey;
    })
    .sort()
    .reverse();
}

export function filterCompletions(
  items: Completion[],
  filterDate: string,
  filterUser: string,
  currentWeekKey: string,
  filterWeek: string,
): Completion[] {
  return items.filter((c) => {
    if (filterDate && c.date !== filterDate) return false;
    if (filterUser && c.user.id !== filterUser) return false;
    if (!filterDate && getWeekKey(c.date) !== currentWeekKey) return false;
    if (filterWeek && getWeekKey(c.date) !== filterWeek) return false;
    return true;
  });
}
