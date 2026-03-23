"use client";
// src/components/deviations/DeviationList.tsx
import { useState } from "react";
import { DeviationForm } from "./DeviationForm";
import { DeviationCard } from "./DeviationCard";

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
    if (res.ok) setDeviations(deviations.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Vil du slette dette avviket?")) return;
    await fetch(`/api/avvik/${id}`, { method: "DELETE" });
    setDeviations(deviations.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <span>+</span> Registrer avvik
        </button>
      ) : (
        <DeviationForm
          form={form}
          loading={loading}
          error={error}
          onChange={setForm}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {deviations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">⚠️</p>
          <p className="text-sm">Ingen registrerte avvik</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deviations.map((dev) => (
            <DeviationCard
              key={dev.id}
              dev={dev}
              isOwner={dev.userId === currentUserId || currentUserRole === "admin"}
              allUserIds={allUserIds}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
