// src/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[url('/image/sentralvaskeriet-132.jpg')] bg-cover bg-center">
      <main className="min-h-screen flex flex-col items-center justify-center bg-black/60 px-4">
        <div className="text-center space-y-8 w-full max-w-sm text-white">
          <div className="space-y-2">
            {/* <div className="text-5xl">🏭</div> */}
            <h1 className="text-3xl font-bold">Textilia Oslo Renhold</h1>
            <p className="text-gray-200">
              Administrer oppgaver, ukeplan og avvik
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Logg inn
            </Link>

            <Link
              href="/register"
              className="w-full px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              Registrer deg
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
