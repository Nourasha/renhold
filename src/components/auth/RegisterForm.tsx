"use client";
// src/components/auth/RegisterForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FieldErrors, RegisterForm as RegisterFormType, validateForm } from "@/lib/registerValidation";
import { FormField } from "./FormField";
import { PasswordStrengthHints } from "./PasswordStrengthHints";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormType>({
    name: "", email: "", password: "", confirmPassword: "", inviteCode: "",
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
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: errors[e.target.name as keyof FieldErrors] }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const name = e.target.name;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errors = validateForm(form);
    setFieldErrors((prev) => ({ ...prev, [name]: errors[name as keyof FieldErrors] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setTouched({ name: true, email: true, password: true, confirmPassword: true, inviteCode: true });
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(), email: form.email.trim(),
        password: form.password, inviteCode: form.inviteCode.trim().toUpperCase(),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setServerError(data.error || "Noe gikk galt"); setLoading(false); }
    else router.push("/login?registered=true");
  }

  function f(name: keyof FieldErrors) {
    return { hasError: !!(touched[name] && fieldErrors[name]), isValid: !!(touched[name] && !fieldErrors[name] && form[name]) };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField label="Navn" name="name" value={form.name} placeholder="Ola Nordmann"
        {...f("name")} errorMsg={fieldErrors.name} successMsg="Ser bra ut"
        onChange={handleChange} onBlur={handleBlur} />

      <FormField label="E-post" name="email" type="email" value={form.email} placeholder="navn@eksempel.no"
        {...f("email")} errorMsg={fieldErrors.email} successMsg="Gyldig e-postadresse"
        onChange={handleChange} onBlur={handleBlur} />

      <FormField label="Passord" name="password" type="password" value={form.password}
        placeholder="Minst 8 tegn, stor bokstav og tall"
        {...f("password")} errorMsg={fieldErrors.password} successMsg="Sterkt passord"
        onChange={handleChange} onBlur={handleBlur}>
        <PasswordStrengthHints password={form.password} />
      </FormField>

      <FormField label="Bekreft passord" name="confirmPassword" type="password"
        value={form.confirmPassword} placeholder="Gjenta passord"
        {...f("confirmPassword")} errorMsg={fieldErrors.confirmPassword} successMsg="Passordene matcher"
        onChange={handleChange} onBlur={handleBlur} />

      <FormField label="Passkode fra administrator" name="inviteCode" value={form.inviteCode}
        placeholder="XXXXXXXX" maxLength={12} extraClass="uppercase tracking-widest"
        {...f("inviteCode")} errorMsg={fieldErrors.inviteCode} successMsg="Passkode ser gyldig ut"
        onChange={handleChange} onBlur={handleBlur} />

      {serverError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">⚠ {serverError}</p>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? "Registrerer..." : "Registrer deg"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Har du allerede konto?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">Logg inn</Link>
      </p>
      <p className="text-center text-sm text-gray-500">
        <Link href="/" className="text-gray-400 hover:underline">← Tilbake til forsiden</Link>
      </p>
    </form>
  );
}
