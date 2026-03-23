"use client";
// src/components/deviations/DeviationCard.tsx

interface Deviation {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: Date | string;
  userId: string;
  user: { id: string; name: string | null };
}

const severityConfig: Record<string, { label: string; color: string }> = {
  low:      { label: "Lav",     color: "bg-green-100 text-green-700" },
  medium:   { label: "Middels", color: "bg-yellow-100 text-yellow-700" },
  high:     { label: "Høy",     color: "bg-orange-100 text-orange-700" },
  critical: { label: "Kritisk", color: "bg-red-100 text-red-700" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  open:          { label: "Åpen",             color: "bg-red-100 text-red-700" },
  "in-progress": { label: "Under behandling", color: "bg-yellow-100 text-yellow-700" },
  resolved:      { label: "Løst",             color: "bg-green-100 text-green-700" },
};

const userColors = [
  "bg-indigo-100 text-indigo-800", "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",     "bg-amber-100 text-amber-800",
  "bg-cyan-100 text-cyan-800",     "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",     "bg-violet-100 text-violet-800",
];

export function getUserColor(userId: string, allIds: string[]) {
  const idx = allIds.indexOf(userId);
  return userColors[idx % userColors.length] || "bg-gray-100 text-gray-700";
}

interface Props {
  dev: Deviation;
  isOwner: boolean;
  allUserIds: string[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export function DeviationCard({ dev, isOwner, allUserIds, onDelete, onStatusChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-medium text-gray-900">{dev.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityConfig[dev.severity]?.color}`}>
              {severityConfig[dev.severity]?.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[dev.status]?.color}`}>
              {statusConfig[dev.status]?.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{dev.description}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getUserColor(dev.userId, allUserIds)}`}>
              {dev.user?.name || "Ukjent"}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(dev.createdAt).toLocaleDateString("nb-NO")}
            </span>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(dev.id)}
            className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0"
            title="Slett avvik"
          >
            ×
          </button>
        )}
      </div>

      {isOwner && dev.status !== "resolved" && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {dev.status === "open" && (
            <button
              onClick={() => onStatusChange(dev.id, "in-progress")}
              className="text-xs px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full hover:bg-yellow-100"
            >
              Sett til behandling
            </button>
          )}
          <button
            onClick={() => onStatusChange(dev.id, "resolved")}
            className="text-xs px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100"
          >
            Merk som løst
          </button>
        </div>
      )}
    </div>
  );
}
