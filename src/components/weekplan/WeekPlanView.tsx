"use client";
// src/components/weekplan/WeekPlanView.tsx
import { useState, useTransition } from "react";
import { WeekPlanDayCard } from "./WeekPlanDayCard";
import { addWeekPlan, deleteWeekPlan } from "@/app/dashboard/ukeplan/actions";

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

export function WeekPlanView({ initialPlans }: { initialPlans: WeekPlan[] }) {
  const [plans, setPlans] = useState<WeekPlan[]>(initialPlans);
  const [showFormFor, setShowFormFor] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  function handleAdd(dayOfWeek: string) {
    if (!form.title) return;
    startTransition(async () => {
      const plan = await addWeekPlan({ ...form, dayOfWeek });
      setPlans((prev) => [...prev, plan]);
      setForm(emptyForm);
      setShowFormFor(null);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteWeekPlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    });
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
          loading={isPending}
          onToggleForm={() => setShowFormFor(showFormFor === key ? null : key)}
          onFormChange={setForm}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
