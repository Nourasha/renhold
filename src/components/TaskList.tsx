"use client";
// src/components/TaskList.tsx
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  createdAt: Date | string;
}

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const priorityLabels: Record<string, string> = {
  low: "Lav",
  medium: "Middels",
  high: "Høy",
};

export function TaskList({
  initialTasks,
  status,
}: {
  initialTasks: Task[];
  status: "pending" | "done";
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setTasks([data.task, ...tasks]);
      setForm({ title: "", description: "", priority: "medium", dueDate: "" });
      setShowForm(false);
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  async function handleToggleStatus(task: Task) {
    const newStatus = task.status === "pending" ? "done" : "pending";
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Vil du slette denne oppgaven?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      {status === "pending" && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span>+</span> Ny oppgave
            </button>
          ) : (
            <form
              onSubmit={handleAddTask}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">Ny oppgave</h3>

              <input
                type="text"
                placeholder="Tittel"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Beskrivelse (valgfritt)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex gap-3">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Lav prioritet</option>
                  <option value="medium">Middels prioritet</option>
                  <option value="high">Høy prioritet</option>
                </select>

                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">{status === "pending" ? "📋" : "✅"}</p>
          <p className="text-sm">
            {status === "pending" ? "Ingen aktive oppgaver" : "Ingen fullførte oppgaver"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => handleToggleStatus(task)}
                className="mt-1 w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-gray-900 ${
                    task.status === "done" ? "line-through text-gray-400" : ""
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}
                  >
                    {priorityLabels[task.priority]}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-400">
                      Frist: {new Date(task.dueDate).toLocaleDateString("nb-NO")}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                title="Slett oppgave"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
