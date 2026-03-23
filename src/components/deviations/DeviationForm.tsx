"use client";
// src/components/deviations/DeviationForm.tsx

interface DeviationFormData {
  title: string;
  description: string;
  severity: string;
}

interface Props {
  form: DeviationFormData;
  loading: boolean;
  error: string;
  onChange: (form: DeviationFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function DeviationForm({ form, loading, error, onChange, onSubmit, onCancel }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm"
    >
      <h3 className="font-semibold text-gray-900">Nytt avvik</h3>

      <input
        type="text"
        placeholder="Tittel"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <textarea
        placeholder="Beskrivelse av avviket"
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
        required
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
      />

      <select
        value={form.severity}
        onChange={(e) => onChange({ ...form, severity: e.target.value })}
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
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
