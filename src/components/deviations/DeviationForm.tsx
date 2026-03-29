"use client";

import type { FormEvent } from "react";

type FormState = {
  title: string;
  description: string;
  severity: string;
};

interface DeviationFormProps {
  form: FormState;
  loading: boolean;
  error: string;
  onChange: (next: FormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function DeviationForm({
  form,
  loading,
  error,
  onChange,
  onSubmit,
  onCancel,
}: DeviationFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <div>
        <label htmlFor="deviation-title" className="mb-1 block text-sm font-medium text-gray-700">
          Tittel
        </label>
        <input
          id="deviation-title"
          type="text"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Kort tittel på avviket"
        />
      </div>

      <div>
        <label htmlFor="deviation-description" className="mb-1 block text-sm font-medium text-gray-700">
          Beskrivelse
        </label>
        <textarea
          id="deviation-description"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Beskriv hva som skjedde"
        />
      </div>

      <div>
        <label htmlFor="deviation-severity" className="mb-1 block text-sm font-medium text-gray-700">
          Alvorlighetsgrad
        </label>
        <select
          id="deviation-severity"
          value={form.severity}
          onChange={(e) => onChange({ ...form, severity: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="low">Lav</option>
          <option value="medium">Middels</option>
          <option value="high">Høy</option>
          <option value="critical">Kritisk</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Lagrer..." : "Lagre avvik"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
