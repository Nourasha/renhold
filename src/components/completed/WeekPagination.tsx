// src/components/completed/WeekPagination.tsx
import { getWeekStart, getWeekEnd } from "./types";

interface Props {
  currentWeekNum: number;
  currentWeekYear: number;
  currentWeekIdx: number;
  totalWeeks: number;
  currentWeekKey: string;
  onPrev: () => void;
  onNext: () => void;
}

function formatShort(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

export function WeekPagination({
  currentWeekNum,
  currentWeekYear,
  currentWeekIdx,
  totalWeeks,
  currentWeekKey,
  onPrev,
  onNext,
}: Props) {
  // Get Monday and Sunday of the week
  // Use the first day of the week by finding a date in that week
  const weekDate = `${currentWeekYear}-01-01`;
  const d = new Date(weekDate + "T12:00:00");
  // Find first day of ISO week
  d.setDate(1 + (currentWeekNum - 1) * 7);
  // Adjust to Monday
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  const monday = d.toISOString().split("T")[0];
  const sunday = new Date(d.getTime() + 6 * 86400000).toISOString().split("T")[0];

  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
      <button
        onClick={onPrev}
        disabled={currentWeekIdx >= totalWeeks - 1}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Forrige
      </button>
      <div className="text-center">
        <p className="font-bold text-gray-900">Uke {currentWeekNum}</p>
        <p className="text-xs text-gray-400">
          {formatShort(monday)} – {formatShort(sunday)} · {currentWeekYear}
        </p>
      </div>
      <button
        onClick={onNext}
        disabled={currentWeekIdx === 0}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Neste →
      </button>
    </div>
  );
}
