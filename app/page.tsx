import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black text-zinc-50">
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-semibold">Operaciones</h1>
        <p className="mt-2 text-zinc-400">Selecciona una vista para continuar.</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/operacion"
            className="rounded-2xl bg-zinc-950 px-6 py-4 transition hover:bg-zinc-900"
          >
            Captura de movimiento
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl bg-zinc-950 px-6 py-4 transition hover:bg-zinc-900"
          >
            Dashboard gerencial
          </Link>
          <Link
            href="/chat"
            className="rounded-2xl bg-zinc-950 px-6 py-4 transition hover:bg-zinc-900"
          >
            Chat Operativo
          </Link>
          <Link
            href="/unidades"
            className="rounded-2xl bg-zinc-950 px-6 py-4 transition hover:bg-zinc-900"
          >
            Administración de unidades
          </Link>
        </div>
      </div>
    </div>
  );
}
