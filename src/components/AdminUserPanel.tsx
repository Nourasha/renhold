"use client";
// src/components/AdminUserPanel.tsx
import { useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string | Date;
}

export function AdminUserPanel({
  initialUsers,
  currentUserId,
}: {
  initialUsers: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(user: User) {
    if (!confirm(`Er du sikker på at du vil slette "${user.name || user.email}"?\n\nDette sletter også alle avvik og notater tilknyttet brukeren.`))
      return;

    setDeletingId(user.id);
    setError(null);

    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      setError(data.error || "Noe gikk galt");
    }
    setDeletingId(null);
  }

  async function handleToggleRole(user: User) {
    const newRole = user.role === "admin" ? "user" : "admin";
    const label = newRole === "admin" ? "admin" : "vanlig bruker";

    if (!confirm(`Vil du gjøre "${user.name || user.email}" til ${label}?`)) return;

    setUpdatingId(user.id);
    setError(null);

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    const data = await res.json();

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } else {
      setError(data.error || "Noe gikk galt");
    }
    setUpdatingId(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Brukere</h2>
      <p className="text-sm text-gray-500 mb-4">
        {users.length} registrerte brukere. Du kan ikke slette deg selv.
      </p>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const isDeleting = deletingId === user.id;
          const isUpdating = updatingId === user.id;

          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">
                      {user.name || "Uten navn"}
                    </span>
                    {user.role === "admin" && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        Deg
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs text-gray-300">
                    Registrert {new Date(user.createdAt).toLocaleDateString("nb-NO")}
                  </p>
                </div>
              </div>

              {!isSelf && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle admin role */}
                  <button
                    onClick={() => handleToggleRole(user)}
                    disabled={isUpdating}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 ${
                      user.role === "admin"
                        ? "text-gray-600 border-gray-200 hover:bg-gray-50"
                        : "text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {isUpdating
                      ? "..."
                      : user.role === "admin"
                      ? "Fjern admin"
                      : "Gjør til admin"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    {isDeleting ? "Sletter..." : "Slett"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
