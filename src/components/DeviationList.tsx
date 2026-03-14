"use client";
// src/components/DeviationList.tsx
import { useState } from "react";

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
  open:        { label: "Åpen",             color: "bg-red-100 text-red-700" },
  "in-progress": { label: "Under behandling", color: "bg-yellow-100 text-yellow-700" },
  resolved:    { label: "Løst",             color: "bg-green-100 text-green-700" },
};

const userColors = [
  "bg-indigo-100 text-indigo-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
  "bg-amber-100 text-amber-800",
  "bg-cyan-100 text-cyan-800",
  "bg-rose-100 text-rose-800",
  "bg-lime-100 text-lime-800",
  "bg-violet-100 text-violet-800",
];

function getUserColor(userId: string, allIds: string[]) {
  const idx = allIds.indexOf(userId);
  return userColors[idx % userColors.length] || "bg-gray-100 text-gray-700";
}

export function DeviationList({
  initialDeviations,
  currentUserId,
  currentUserRole,
}: {
  initialDeviations: Deviation[];
  currentUserId: string;
  currentUserRole: string;
}) {
  const [deviations, setDeviations] = useState<Deviation[]>(initialDeviations);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "low" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allUserIds = Array.from(new Set(deviations.map((d) => d.userId)));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/avvik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setDeviations([data.deviation, ...deviations]);
      setForm({ title: "", description: "", severity: "low" });
      setShowForm(false);
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/avvik/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setDeviations(deviations.map((d) => (d.id === id ? { ...d, status } : d)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Vil du slette dette avviket?")) return;
    await fetch(`/api/avvik/${id}`, { method: "DELETE" });
    setDeviations(deviations.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* New deviation form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <span>+</span> Registrer avvik
        </button>
      ) : (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900">Nytt avvik</h3>

          <input
            type="text"
            placeholder="Tittel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <textarea
            placeholder="Beskrivelse av avviket"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />

          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="low">Lav alvorlighet</option>
            <option value="medium">Middels alvorlighet</option>
            <option value="high">Høy alvorlighet</option>
            <option value="critical">Kritisk</option>
          </select>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Lagrer..." : "Lagre"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      {deviations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">⚠️</p>
          <p className="text-sm">Ingen registrerte avvik</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deviations.map((dev) => {
            const isOwner = dev.userId === currentUserId || currentUserRole === "admin";
            return (
              <div
                key={dev.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title + badges */}
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

                    {/* Footer: author + date */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getUserColor(dev.userId, allUserIds)}`}>
                        {dev.user?.name || "Ukjent"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(dev.createdAt).toLocaleDateString("nb-NO")}
                      </span>
                    </div>
                  </div>

                  {/* Only the owner can delete */}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(dev.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0"
                      title="Slett avvik"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status actions — only owner can change status */}
                {isOwner && dev.status !== "resolved" && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {dev.status === "open" && (
                      <button
                        onClick={() => handleStatusChange(dev.id, "in-progress")}
                        className="text-xs px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full hover:bg-yellow-100"
                      >
                        Sett til behandling
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(dev.id, "resolved")}
                      className="text-xs px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100"
                    >
                      Merk som løst
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
