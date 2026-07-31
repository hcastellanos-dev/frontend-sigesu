import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Acceso denegado
        </h1>
        <p className="mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <Link
          href="/"
          className="text-blue-700 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
