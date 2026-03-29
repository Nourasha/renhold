"use client";

import { useState, useTransition } from "react";
import { DeviationForm } from "./DeviationForm";
import { DeviationCard } from "./DeviationCard";
import type { Deviation } from "@/types";
import {
  createDeviationAction,
  deleteDeviationAction,
  updateDeviationStatusAction,
} from "@/app/dashboard/avvik/actions";

interface DeviationListProps {
  initialDeviations: Deviation[];
  currentUserId: string;
  currentUserRole: string;
}

export function DeviationList({
  initialDeviations,
  currentUserId,
  currentUserRole,
}: DeviationListProps) {
  const [deviations, setDeviations] = useState<Deviation[]>(initialDeviations);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "low",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const allUserIds = Array.from(new Set(deviations.map((d) => d.userId)));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await createDeviationAction(form);

      if (res.ok && res.deviation) {
        setDeviations((prev) => [res.deviation, ...prev]);
        setForm({
          title: "",
          description: "",
          severity: "low",
        });
        setShowForm(false);
      } else {
        setError(res.error || "Kunne ikke registrere avvik");
      }
    });
  }

  async function handleStatusChange(id: string, status: string) {
    setError("");

    startTransition(async () => {
      const res = await updateDeviationStatusAction(id, status);

      if (res.ok) {
        setDeviations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status } : d)),
        );
      } else {
        setError(res.error || "Kunne ikke oppdatere status");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Vil du slette dette avviket?")) return;

    setError("");

    startTransition(async () => {
      const res = await deleteDeviationAction(id);

      if (res.ok) {
        setDeviations((prev) => prev.filter((d) => d.id !== id));
      } else {
        setError(res.error || "Kunne ikke slette avvik");
      }
    });
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          + Registrer avvik
        </button>
      ) : (
        <DeviationForm
          form={form}
          loading={isPending}
          error={error}
          onChange={setForm}
          onSubmit={handleAdd}
          onCancel={() => {
            setShowForm(false);
            setError("");
          }}
        />
      )}

      {error && !showForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {deviations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          <div className="mb-2 text-3xl">⚠️</div>
          <p>Ingen registrerte avvik</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deviations.map((deviation) => (
            <DeviationCard
              key={deviation.id}
              deviation={deviation}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              allUserIds={allUserIds}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
