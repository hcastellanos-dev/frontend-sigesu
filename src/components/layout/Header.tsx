import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">SIGESU</h1>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:underline">Inicio</Link>
          <Link href="/contacto" className="hover:underline">Contacto</Link>
          <Link
            href="/login"
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Acceder
          </Link>
        </nav>
      </div>
    </header>
  );
}
