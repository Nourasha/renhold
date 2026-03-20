"use client";
// src/components/RegisterForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FieldErrors,
  RegisterForm as RegisterFormType,
  validateForm,
} from "@/lib/registerValidation";

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormType>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (touched[e.target.name]) {
      const errors = validateForm(updated);
      setFieldErrors((prev) => ({
        ...prev,
        [e.target.name]: errors[e.target.name as keyof FieldErrors],
      }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const name = e.target.name;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errors = validateForm(form);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: errors[name as keyof FieldErrors],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      inviteCode: true,
    });

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        inviteCode: form.inviteCode.trim().toUpperCase(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error || "Noe gikk galt");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  function fieldClass(name: keyof FieldErrors) {
    const hasError = touched[name] && fieldErrors[name];
    const isValid = touched[name] && !fieldErrors[name] && form[name];
    if (hasError)
      return "w-full px-4 py-2 border border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50";
    if (isValid)
      return "w-full px-4 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50";
    return "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Navn */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Navn *
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("name")}
          placeholder="Ola Nordmann"
        />
        {touched.name && fieldErrors.name && (
          <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.name}</p>
        )}
        {touched.name && !fieldErrors.name && form.name && (
          <p className="text-green-600 text-xs mt-1">✓ Ser bra ut</p>
        )}
      </div>

      {/* E-post */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-post *
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("email")}
          placeholder="navn@eksempel.no"
        />
        {touched.email && fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.email}</p>
        )}
        {touched.email && !fieldErrors.email && form.email && (
          <p className="text-green-600 text-xs mt-1">✓ Gyldig e-postadresse</p>
        )}
      </div>

      {/* Passord */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Passord *
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("password")}
          placeholder="Minst 8 tegn, stor bokstav og tall"
        />
        {touched.password && fieldErrors.password && (
          <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.password}</p>
        )}
        {touched.password && !fieldErrors.password && form.password && (
          <p className="text-green-600 text-xs mt-1">✓ Sterkt passord</p>
        )}
        {form.password && (
          <ul className="mt-1.5 space-y-0.5">
            <li
              className={`text-xs ${form.password.length >= 8 ? "text-green-600" : "text-gray-400"}`}
            >
              {form.password.length >= 8 ? "✓" : "○"} Minst 8 tegn
            </li>
            <li
              className={`text-xs ${/[A-Z]/.test(form.password) ? "text-green-600" : "text-gray-400"}`}
            >
              {/[A-Z]/.test(form.password) ? "✓" : "○"} Minst én stor bokstav
            </li>
            <li
              className={`text-xs ${/[0-9]/.test(form.password) ? "text-green-600" : "text-gray-400"}`}
            >
              {/[0-9]/.test(form.password) ? "✓" : "○"} Minst ett tall
            </li>
          </ul>
        )}
      </div>

      {/* Bekreft passord */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bekreft passord *
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass("confirmPassword")}
          placeholder="Gjenta passord"
        />
        {touched.confirmPassword && fieldErrors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">
            ⚠ {fieldErrors.confirmPassword}
          </p>
        )}
        {touched.confirmPassword &&
          !fieldErrors.confirmPassword &&
          form.confirmPassword && (
            <p className="text-green-600 text-xs mt-1">✓ Passordene matcher</p>
          )}
      </div>

      {/* Passkode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Passkode fra administrator *
        </label>
        <input
          type="text"
          name="inviteCode"
          value={form.inviteCode}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${fieldClass("inviteCode")} uppercase tracking-widest`}
          placeholder="XXXXXXXX"
          maxLength={12}
        />
        {touched.inviteCode && fieldErrors.inviteCode && (
          <p className="text-red-500 text-xs mt-1">
            ⚠ {fieldErrors.inviteCode}
          </p>
        )}
        {touched.inviteCode && !fieldErrors.inviteCode && form.inviteCode && (
          <p className="text-green-600 text-xs mt-1">
            ✓ Passkode ser gyldig ut
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">⚠ {serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Registrerer..." : "Registrer deg"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Har du allerede konto?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Logg inn
        </Link>
      </p>
      <p className="text-center text-sm text-gray-500">
        <Link href="/" className="text-gray-400 hover:underline">
          ← Tilbake til forsiden
        </Link>
      </p>
    </form>
  );
}
