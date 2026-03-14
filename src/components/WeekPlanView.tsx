"use client";
// src/components/WeekPlanView.tsx
import { useState } from "react";

interface WeekPlan {
  id: string;
  title: string;
  description?: string | null;
  dayOfWeek: string;
  startTime?: string | null;
  endTime?: string | null;
}

const days = [
  { key: "monday", label: "Mandag" },
  { key: "tuesday", label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag" },
  { key: "thursday", label: "Torsdag" },
  { key: "friday", label: "Fredag" },
  { key: "saturday", label: "Lørdag" },
  { key: "sunday", label: "Søndag" },
];

export function WeekPlanView({
  initialPlans,
  weekNumber,
  year,
}: {
  initialPlans: WeekPlan[];
  weekNumber: number;
  year: number;
}) {
  const [plans, setPlans] = useState<WeekPlan[]>(initialPlans);
  const [showFormFor, setShowFormFor] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startTime: "", endTime: "" });
  const [loading, setLoading] = useState(false);

  async function handleAdd(dayOfWeek: string) {
    if (!form.title) return;
    setLoading(true);

    const res = await fetch("/api/weekplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dayOfWeek, weekNumber, year }),
    });

    const data = await res.json();
    if (res.ok) {
      setPlans([...plans, data.plan]);
      setForm({ title: "", description: "", startTime: "", endTime: "" });
      setShowFormFor(null);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/weekplan/${id}`, { method: "DELETE" });
    setPlans(plans.filter((p) => p.id !== id));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {days.map(({ key, label }) => {
        const dayPlans = plans.filter((p) => p.dayOfWeek === key);
        const isAdding = showFormFor === key;

        return (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <button
                onClick={() => setShowFormFor(isAdding ? null : key)}
                className="text-blue-600 hover:text-blue-800 text-xl font-bold leading-none"
                title="Legg til"
              >
                {isAdding ? "×" : "+"}
              </button>
            </div>

            {isAdding && (
              <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Tittel"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
                  />
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleAdd(key)}
                  disabled={loading || !form.title}
                  className="w-full py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Lagre
                </button>
              </div>
            )}

            {dayPlans.length === 0 && !isAdding ? (
              <p className="text-xs text-gray-400 italic">Ingen aktiviteter</p>
            ) : (
              <ul className="space-y-2">
                {dayPlans.map((plan) => (
                  <li
                    key={plan.id}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-blue-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{plan.title}</p>
                      {(plan.startTime || plan.endTime) && (
                        <p className="text-xs text-gray-500">
                          {plan.startTime} {plan.endTime ? `– ${plan.endTime}` : ""}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-gray-300 hover:text-red-500 text-lg leading-none flex-shrink-0"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
