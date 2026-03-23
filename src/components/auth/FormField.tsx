// src/components/auth/FormField.tsx
import { ChangeEvent, FocusEvent, ReactNode } from "react";

interface Props {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  hasError: boolean;
  isValid: boolean;
  errorMsg?: string;
  successMsg?: string;
  extraClass?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}

export function FormField({
  label, name, type = "text", value, placeholder,
  maxLength, hasError, isValid, errorMsg, successMsg,
  extraClass = "", onChange, onBlur, children,
}: Props) {
  const baseClass = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2";
  const stateClass = hasError
    ? "border-red-400 focus:ring-red-400 bg-red-50"
    : isValid
    ? "border-green-400 focus:ring-green-400 bg-green-50"
    : "border-gray-300 focus:ring-blue-500";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={onChange}
        onBlur={onBlur}
        className={`${baseClass} ${stateClass} ${extraClass}`}
      />
      {hasError && errorMsg && (
        <p className="text-red-500 text-xs mt-1">⚠ {errorMsg}</p>
      )}
      {isValid && successMsg && (
        <p className="text-green-600 text-xs mt-1">✓ {successMsg}</p>
      )}
      {children}
    </div>
  );
}
