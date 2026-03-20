// src/app/register/page.tsx
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registrer deg</h2>
          <p className="text-gray-500 text-sm mt-1">
            Du trenger en passkode fra administrator
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
