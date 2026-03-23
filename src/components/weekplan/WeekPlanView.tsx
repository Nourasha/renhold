"use client";
// src/components/weekplan/WeekPlanView.tsx
import { useState } from "react";
import { WeekPlanDayCard } from "./WeekPlanDayCard";

interface WeekPlan {
  id: string;
  title: string;
  description?: string | null;
  dayOfWeek: string;
  startTime?: string | null;
  endTime?: string | null;
}

const days = [
  { key: "monday",    label: "Mandag"  },
  { key: "tuesday",   label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag"  },
  { key: "thursday",  label: "Torsdag" },
  { key: "friday",    label: "Fredag"  },
  { key: "saturday",  label: "Lørdag"  },
  { key: "sunday",    label: "Søndag"  },
];

const emptyForm = { title: "", description: "", startTime: "", endTime: "" };

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
  const [form, setForm] = useState(emptyForm);
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
      setForm(emptyForm);
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
      {days.map(({ key, label }) => (
        <WeekPlanDayCard
          key={key}
          dayKey={key}
          dayLabel={label}
          dayPlans={plans.filter((p) => p.dayOfWeek === key)}
          isAdding={showFormFor === key}
          form={form}
          loading={loading}
          onToggleForm={() => setShowFormFor(showFormFor === key ? null : key)}
          onFormChange={setForm}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
