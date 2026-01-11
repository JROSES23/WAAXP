import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f8f7] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Vendia
        </h1>

        <p className="text-gray-500 text-sm">
          Tu asistente inteligente para vender más por WhatsApp.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="bg-[#6dd3c6] hover:bg-[#5fc1b5] text-white rounded-lg py-3 font-medium transition"
          >
            Ir al Dashboard
          </Link>

          <button
            className="border border-gray-200 rounded-lg py-3 text-gray-600 hover:bg-gray-50 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
