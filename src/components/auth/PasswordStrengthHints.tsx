// src/components/auth/PasswordStrengthHints.tsx

interface Props {
  password: string;
}

export function PasswordStrengthHints({ password }: Props) {
  if (!password) return null;

  const rules = [
    { label: "Minst 8 tegn",        met: password.length >= 8 },
    { label: "Minst én stor bokstav", met: /[A-Z]/.test(password) },
    { label: "Minst ett tall",       met: /[0-9]/.test(password) },
  ];

  return (
    <ul className="mt-1.5 space-y-0.5">
      {rules.map(({ label, met }) => (
        <li key={label} className={`text-xs ${met ? "text-green-600" : "text-gray-400"}`}>
          {met ? "✓" : "○"} {label}
        </li>
      ))}
    </ul>
  );
}
