"use client";
// src/components/AdminInvitePanel.tsx
import { useState } from "react";

interface InviteCodeMeta {
  id: string;
  used: boolean;
  createdAt: string | Date;
  usedAt?: string | Date | null;
}

export function AdminInvitePanel({ initialCodes }: { initialCodes: InviteCodeMeta[] }) {
  const [codes, setCodes] = useState<InviteCodeMeta[]>(initialCodes);
  const [loading, setLoading] = useState(false);
  // The freshly generated plain-text code — shown once, then gone
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generateCode() {
    setLoading(true);
    setFreshCode(null);
    const res = await fetch("/api/admin/invite", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      setFreshCode(data.code);
      setCodes((prev) => [{ id: Date.now().toString(), used: false, createdAt: new Date() }, ...prev]);
    }
    setLoading(false);
  }

  async function copyCode() {
    if (!freshCode) return;
    await navigator.clipboard.writeText(freshCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function dismissFreshCode() {
    setFreshCode(null);
  }

  const unusedCount = codes.filter((c) => !c.used).length;
  const usedCodes = codes.filter((c) => c.used);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Generer passkode</h2>
        <p className="text-sm text-gray-500 mb-4">
          Passkoden krypteres og lagres sikkert. Den vises kun én gang — noter den ned og del med brukeren.
        </p>

        <button
          onClick={generateCode}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Genererer..." : "🔑 Generer ny passkode"}
        </button>

        {/* One-time code reveal */}
        {freshCode && (
          <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-lg">⚠️</span>
              <p className="text-sm text-amber-800 font-medium">
                Kopier denne koden nå — den kan ikke hentes frem igjen.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono font-bold text-2xl tracking-widest text-amber-900 bg-white px-4 py-2 rounded-lg border border-amber-200">
                {freshCode}
              </span>
              <button
                onClick={copyCode}
                className="px-3 py-2 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
              >
                {copied ? "✓ Kopiert!" : "Kopier"}
              </button>
            </div>
            <button
              onClick={dismissFreshCode}
              className="text-xs text-amber-600 hover:text-amber-800 underline"
            >
              Jeg har kopiert koden, lukk denne
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Passkode-oversikt</h2>
        <div className="flex gap-4 flex-wrap mb-4">
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">{unusedCount}</p>
            <p className="text-xs text-green-600">Ubrukte</p>
          </div>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-600">{usedCodes.length}</p>
            <p className="text-xs text-gray-500">Brukte</p>
          </div>
        </div>

        {usedCodes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Brukte koder</p>
            <div className="space-y-1.5">
              {usedCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="font-mono text-gray-400 text-sm">••••••••••••</span>
                  <span className="text-xs text-gray-400">
                    Brukt {code.usedAt ? new Date(code.usedAt).toLocaleDateString("nb-NO") : "–"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
