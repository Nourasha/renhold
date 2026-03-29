"use client";

import type { Deviation } from "@/types";
import { severityConfig, statusConfig, getUserColorTint } from "@/lib/utils";

interface DeviationCardProps {
  deviation: Deviation;
  currentUserId: string;
  currentUserRole: string;
  allUserIds: string[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function DeviationCard({
  deviation,
  currentUserId,
  currentUserRole,
  allUserIds,
  onStatusChange,
  onDelete,
}: DeviationCardProps) {
  const severity =
    severityConfig[deviation.severity as keyof typeof severityConfig] ??
    severityConfig.low;

  const status =
    statusConfig[deviation.status as keyof typeof statusConfig] ??
    statusConfig.open;

  const canManage =
    currentUserRole === "admin" || deviation.userId === currentUserId;

  const createdAt = new Date(deviation.createdAt).toLocaleString("no-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            {deviation.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${severity.color}`}
            >
              {severity.label}
            </span>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}
            >
              {status.label}
            </span>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getUserColorTint(
                deviation.userId,
                allUserIds,
              )}`}
            >
              {deviation.user?.name || "Ukjent bruker"}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right text-xs text-gray-500">
          <div>Registrert</div>
          <div>{createdAt}</div>
        </div>
      </div>

      <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
        {deviation.description}
      </p>

      {canManage && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {deviation.status !== "open" && (
            <button
              type="button"
              onClick={() => onStatusChange(deviation.id, "open")}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Sett som åpen
            </button>
          )}

          {deviation.status !== "in-progress" && (
            <button
              type="button"
              onClick={() => onStatusChange(deviation.id, "in-progress")}
              className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
            >
              Under behandling
            </button>
          )}

          {deviation.status !== "resolved" && (
            <button
              type="button"
              onClick={() => onStatusChange(deviation.id, "resolved")}
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Marker som løst
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(deviation.id)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Slett
          </button>
        </div>
      )}
    </div>
  );
}
