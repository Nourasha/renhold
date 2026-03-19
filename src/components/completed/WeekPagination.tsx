// src/components/completed/WeekPagination.tsx

interface Props {
  currentWeekNum: number;
  currentWeekYear: number;
  currentWeekIdx: number;
  totalWeeks: number;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekPagination({
  currentWeekNum,
  currentWeekYear,
  currentWeekIdx,
  totalWeeks,
  onPrev,
  onNext,
}: Props) {
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
          {currentWeekYear} · {currentWeekIdx + 1} av {totalWeeks}
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
