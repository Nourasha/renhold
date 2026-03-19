// src/components/completed/ChecklistFilters.tsx

interface Props {
  filterUser: string;
  filterWeek: string;
  allUsers: [string, string][];
  allWeekKeys: string[];
  onUserChange: (v: string) => void;
  onWeekChange: (v: string) => void;
  onReset: () => void;
}

export function ChecklistFilters({
  filterUser,
  filterWeek,
  allUsers,
  allWeekKeys,
  onUserChange,
  onWeekChange,
  onReset,
}: Props) {
  const hasFilter = filterUser || filterWeek;

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filterUser}
        onChange={(e) => onUserChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Alle brukere</option>
        {allUsers.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={filterWeek}
        onChange={(e) => onWeekChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Alle uker</option>
        {allWeekKeys.map((w) => {
          const num = parseInt(w.split("-W")[1]);
          const year = parseInt(w.split("-W")[0]);
          return (
            <option key={w} value={w}>
              Uke {num} ({year})
            </option>
          );
        })}
      </select>

      {hasFilter && (
        <button
          onClick={onReset}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Nullstill filter
        </button>
      )}
    </div>
  );
}
